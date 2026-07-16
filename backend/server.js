import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

// Configure CORS to allow access from Vite frontend (default port 5173 or other)
app.use(cors({
  origin: '*', // For demo environment, allow any origin. In production, restrict this.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());

// Socket.io Connection
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Helper: Format single post based on its type and attach related child records
async function getPostDetails(post) {
  if (post.type === 'diskusi') {
    const [replies] = await db.query('SELECT * FROM replies WHERE post_id = ? ORDER BY id ASC', [post.id]);
    post.replies = replies;
  } else if (post.type === 'musyawarah') {
    const [agenda] = await db.query('SELECT task FROM agenda WHERE post_id = ?', [post.id]);
    post.agenda = agenda.map(a => a.task);
    
    const [peserta] = await db.query('SELECT name, role, keterangan FROM peserta WHERE post_id = ?', [post.id]);
    post.peserta = peserta.map(p => ({
      name: p.name,
      role: p.role,
      keterangan: !!p.keterangan
    }));
    post.status = peserta.some(p => p.keterangan === 0) ? false : true; // status: true if all present
  } else if (post.type === 'demos') {
    const [options] = await db.query('SELECT id, label, currentVotes FROM poll_options WHERE post_id = ?', [post.id]);
    post.options = options;
  }
  return post;
}

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. Get all posts with detailed children nested
app.get('/api/posts', async (req, res) => {
  try {
    const [posts] = await db.query('SELECT * FROM posts ORDER BY vote DESC');
    const detailedPosts = await Promise.all(posts.map(post => getPostDetails(post)));
    res.json(detailedPosts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// 2. Create a new post
app.post('/api/posts', async (req, res) => {
  const { type, category, title, text, sender, class: className, agenda, peserta, options } = req.body;
  const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  
  try {
    // Start transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Insert to posts table
      const [postResult] = await connection.query(
        'INSERT INTO posts (type, category, title, text, sender, class, vote, time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [type, category, title, text, sender, className || null, 0, time]
      );
      const postId = postResult.insertId;

      // Insert extra data based on type
      if (type === 'musyawarah' && Array.isArray(agenda)) {
        for (const task of agenda) {
          await connection.query('INSERT INTO agenda (post_id, task) VALUES (?, ?)', [postId, task]);
        }
        if (Array.isArray(peserta)) {
          for (const p of peserta) {
            await connection.query('INSERT INTO peserta (post_id, name, role, keterangan) VALUES (?, ?, ?, ?)', [postId, p.name, p.role, p.keterangan ? 1 : 0]);
          }
        }
      } else if (type === 'demos' && Array.isArray(options)) {
        for (const option of options) {
          await connection.query('INSERT INTO poll_options (post_id, label, currentVotes) VALUES (?, ?, ?)', [postId, option, 0]);
        }
      }

      await connection.commit();
      connection.release();

      // Retrieve full created post object
      const [newPostArr] = await db.query('SELECT * FROM posts WHERE id = ?', [postId]);
      const fullPost = await getPostDetails(newPostArr[0]);

      // Log activity
      let finalGuestId = req.body.guest_id;
      if (!finalGuestId && sender !== 'Admin') {
        const [g] = await db.query('SELECT id FROM buku_tamu WHERE name = ? AND class = ? LIMIT 1', [sender, className]);
        if (g.length > 0) finalGuestId = g[0].id;
      }
      await db.query(
        'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
        [finalGuestId || null, sender, className || 'Tamu', 'post', title]
      );

      // Broadcast new post to all clients
      io.emit('post:new', fullPost);
      io.emit('admin:activity', {
        guest_id: finalGuestId || null,
        guest_name: sender,
        guest_class: className || 'Tamu',
        action: 'post',
        target: title,
        created_at: new Date()
      });

      res.status(201).json(fullPost);
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// 3. Upvote a post (Modified: anti-spam with guest verification & activity log)
app.post('/api/posts/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { guest_id, guest_name, guest_class } = req.body;

  if (!guest_id) {
    return res.status(401).json({ error: 'Aksi ini memerlukan login Buku Tamu!' });
  }

  try {
    const [postArr] = await db.query('SELECT title, vote FROM posts WHERE id = ?', [id]);
    if (postArr.length === 0) {
      return res.status(404).json({ error: 'Post tidak ditemukan!' });
    }
    const post = postArr[0];

    // Check if already voted
    const [existing] = await db.query(
      'SELECT id FROM guest_votes WHERE guest_id = ? AND post_id = ? AND option_id IS NULL',
      [guest_id, id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Anda sudah memberikan suara pada postingan ini!' });
    }

    // Increment vote
    await db.query('UPDATE posts SET vote = vote + 1 WHERE id = ?', [id]);
    const newVoteCount = post.vote + 1;

    await db.query(
      'INSERT INTO guest_votes (guest_id, post_id, option_id, type) VALUES (?, ?, NULL, \'upvote\')',
      [guest_id, id]
    );

    let name = guest_name || 'Anonim';
    let className = guest_class || 'Tamu';
    // Double check from db if not provided
    if (name === 'Anonim') {
      const [guest] = await db.query('SELECT name, class FROM buku_tamu WHERE id = ?', [guest_id]);
      if (guest.length > 0) {
        name = guest[0].name;
        className = guest[0].class;
      }
    }

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
      [guest_id, name, className, 'vote', post.title]
    );

    // Broadcast updates
    io.emit('post:vote', { id: Number(id), vote: newVoteCount });
    io.emit('admin:activity', {
      guest_id: Number(guest_id),
      guest_name: name,
      guest_class: className,
      action: 'vote',
      target: post.title,
      created_at: new Date()
    });

    res.json({ success: true, id: Number(id), vote: newVoteCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memberikan suara' });
  }
});

// Cancel Upvote (Unvote)
app.delete('/api/posts/:id/vote', async (req, res) => {
  const { id } = req.params;
  const guest_id = req.body.guest_id || req.query.guest_id;

  if (!guest_id) {
    return res.status(401).json({ error: 'Aksi ini memerlukan login!' });
  }

  try {
    const [postArr] = await db.query('SELECT title, vote FROM posts WHERE id = ?', [id]);
    if (postArr.length === 0) {
      return res.status(404).json({ error: 'Post tidak ditemukan!' });
    }
    const post = postArr[0];

    // Check if already voted
    const [existing] = await db.query(
      'SELECT id FROM guest_votes WHERE guest_id = ? AND post_id = ? AND option_id IS NULL',
      [guest_id, id]
    );

    if (existing.length === 0) {
      return res.status(400).json({ error: 'Anda belum memberikan suara pada postingan ini!' });
    }

    // Decrement vote
    const newVoteCount = Math.max(0, post.vote - 1);
    await db.query('UPDATE posts SET vote = ? WHERE id = ?', [newVoteCount, id]);

    // Delete record
    await db.query(
      'DELETE FROM guest_votes WHERE guest_id = ? AND post_id = ? AND option_id IS NULL',
      [guest_id, id]
    );

    // Get guest info
    const [guestArr] = await db.query('SELECT name, class FROM buku_tamu WHERE id = ?', [guest_id]);
    const name = guestArr[0]?.name || 'Anonim';
    const className = guestArr[0]?.class || 'Tamu';

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
      [guest_id, name, className, 'unvote', post.title]
    );

    // Broadcast updates
    io.emit('post:unvote', { id: Number(id), vote: newVoteCount });
    io.emit('post:vote', { id: Number(id), vote: newVoteCount });
    io.emit('admin:activity', {
      guest_id: Number(guest_id),
      guest_name: name,
      guest_class: className,
      action: 'unvote',
      target: post.title,
      created_at: new Date()
    });

    res.json({ success: true, id: Number(id), vote: newVoteCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal membatalkan suara' });
  }
});

// Delete a post (Admin only)
app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [postArr] = await db.query('SELECT id, title FROM posts WHERE id = ?', [id]);
    if (postArr.length === 0) {
      return res.status(404).json({ error: 'Post tidak ditemukan!' });
    }
    // All child rows (replies, agenda, peserta, poll_options, guest_votes) have ON DELETE CASCADE
    await db.query('DELETE FROM posts WHERE id = ?', [id]);

    // Broadcast deletion to all clients so UI updates in real-time
    io.emit('post:delete', { id: Number(id) });

    res.json({ success: true, id: Number(id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus postingan' });
  }
});

// 4. Add a reply to a discussion (Modified: guest name/class & activity log)
app.post('/api/posts/:id/replies', async (req, res) => {
  const { id } = req.params;
  const { sender, class: className, text, guest_id } = req.body;
  try {
    const [postArr] = await db.query('SELECT title FROM posts WHERE id = ?', [id]);
    if (postArr.length === 0) {
      return res.status(404).json({ error: 'Post tidak ditemukan!' });
    }
    const post = postArr[0];

    const [result] = await db.query(
      'INSERT INTO replies (post_id, sender, class, text, vote) VALUES (?, ?, ?, ?, ?)',
      [id, sender, className, text, 0]
    );

    const [newReply] = await db.query('SELECT * FROM replies WHERE id = ?', [result.insertId]);

    let finalGuestId = guest_id;
    if (!finalGuestId && sender !== 'Admin Mading') {
      const [g] = await db.query('SELECT id FROM buku_tamu WHERE name = ? AND class = ? LIMIT 1', [sender, className]);
      if (g.length > 0) finalGuestId = g[0].id;
    }

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
      [finalGuestId || null, sender, className || 'Tamu', 'reply', post.title]
    );

    // Broadcast updates
    io.emit('reply:new', { post_id: Number(id), reply: newReply[0] });
    io.emit('admin:activity', {
      guest_id: finalGuestId || null,
      guest_name: sender,
      guest_class: className || 'Tamu',
      action: 'reply',
      target: post.title,
      created_at: new Date()
    });

    res.status(201).json(newReply[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// 5. Upvote a reply (Modified: anti-spam with guest verification & activity log)
app.post('/api/posts/:id/replies/:replyId/vote', async (req, res) => {
  const { id, replyId } = req.params;
  const { guest_id, guest_name, guest_class } = req.body;

  if (!guest_id) {
    return res.status(401).json({ error: 'Aksi ini memerlukan login Buku Tamu!' });
  }

  try {
    const [replyArr] = await db.query('SELECT text, vote FROM replies WHERE id = ? AND post_id = ?', [replyId, id]);
    if (replyArr.length === 0) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan!' });
    }
    const reply = replyArr[0];

    // Check if already voted
    const [existing] = await db.query(
      'SELECT id FROM guest_votes WHERE guest_id = ? AND post_id = ? AND reply_id = ?',
      [guest_id, id, replyId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Anda sudah menyukai komentar ini!' });
    }

    // Increment vote
    await db.query('UPDATE replies SET vote = vote + 1 WHERE id = ? AND post_id = ?', [replyId, id]);
    const newVoteCount = reply.vote + 1;

    await db.query(
      'INSERT INTO guest_votes (guest_id, post_id, reply_id, type) VALUES (?, ?, ?, \'reply_vote\')',
      [guest_id, id, replyId]
    );

    let name = guest_name || 'Anonim';
    let className = guest_class || 'Tamu';
    // Double check from db if not provided
    if (name === 'Anonim') {
      const [guest] = await db.query('SELECT name, class FROM buku_tamu WHERE id = ?', [guest_id]);
      if (guest.length > 0) {
        name = guest[0].name;
        className = guest[0].class;
      }
    }

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
      [guest_id, name, className, 'vote', reply.text.substring(0, 50)]
    );

    // Broadcast updates
    io.emit('reply:vote', { post_id: Number(id), reply_id: Number(replyId), vote: newVoteCount });
    io.emit('admin:activity', {
      guest_id: Number(guest_id),
      guest_name: name,
      guest_class: className,
      action: 'vote',
      target: reply.text.substring(0, 50),
      created_at: new Date()
    });

    res.json({ success: true, reply_id: Number(replyId), vote: newVoteCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memberikan suara pada komentar' });
  }
});

// Cancel Reply Upvote
app.delete('/api/posts/:id/replies/:replyId/vote', async (req, res) => {
  const { id, replyId } = req.params;
  const guest_id = req.body.guest_id || req.query.guest_id;

  if (!guest_id) {
    return res.status(401).json({ error: 'Aksi ini memerlukan login!' });
  }

  try {
    const [replyArr] = await db.query('SELECT text, vote FROM replies WHERE id = ? AND post_id = ?', [replyId, id]);
    if (replyArr.length === 0) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan!' });
    }
    const reply = replyArr[0];

    // Check if already voted
    const [existing] = await db.query(
      'SELECT id FROM guest_votes WHERE guest_id = ? AND post_id = ? AND reply_id = ?',
      [guest_id, id, replyId]
    );

    if (existing.length === 0) {
      return res.status(400).json({ error: 'Anda belum memberikan suara pada komentar ini!' });
    }

    // Decrement vote
    const newVoteCount = Math.max(0, reply.vote - 1);
    await db.query('UPDATE replies SET vote = ? WHERE id = ? AND post_id = ?', [newVoteCount, replyId, id]);

    // Delete record
    await db.query(
      'DELETE FROM guest_votes WHERE guest_id = ? AND post_id = ? AND reply_id = ?',
      [guest_id, id, replyId]
    );

    // Get guest info
    const [guestArr] = await db.query('SELECT name, class FROM buku_tamu WHERE id = ?', [guest_id]);
    const name = guestArr[0]?.name || 'Anonim';
    const className = guestArr[0]?.class || 'Tamu';

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
      [guest_id, name, className, 'unvote', reply.text.substring(0, 50)]
    );

    // Broadcast updates
    io.emit('reply:vote', { post_id: Number(id), reply_id: Number(replyId), vote: newVoteCount });
    io.emit('admin:activity', {
      guest_id: Number(guest_id),
      guest_name: name,
      guest_class: className,
      action: 'unvote',
      target: reply.text.substring(0, 50),
      created_at: new Date()
    });

    res.json({ success: true, reply_id: Number(replyId), vote: newVoteCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal membatalkan suara pada komentar' });
  }
});

// 6. Vote for an option in Demos (Modified: anti-spam with guest verification & activity log)
app.post('/api/posts/:id/poll/:optionId', async (req, res) => {
  const { id, optionId } = req.params;
  const { guest_id, guest_name, guest_class } = req.body;

  if (!guest_id) {
    return res.status(401).json({ error: 'Aksi ini memerlukan login Buku Tamu!' });
  }

  try {
    const [postArr] = await db.query('SELECT title, vote FROM posts WHERE id = ?', [id]);
    const [optionArr] = await db.query('SELECT label, currentVotes FROM poll_options WHERE id = ? AND post_id = ?', [optionId, id]);

    if (postArr.length === 0 || optionArr.length === 0) {
      return res.status(404).json({ error: 'Post atau Opsi tidak ditemukan!' });
    }
    const post = postArr[0];
    const option = optionArr[0];

    // Check if guest already voted on this option of this post
    const [existing] = await db.query(
      'SELECT id FROM guest_votes WHERE guest_id = ? AND post_id = ? AND option_id = ?',
      [guest_id, id, optionId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Anda sudah menyuarakan opsi ini!' });
    }

    // Increment votes
    await db.query('UPDATE poll_options SET currentVotes = currentVotes + 1 WHERE id = ? AND post_id = ?', [optionId, id]);
    await db.query('UPDATE posts SET vote = vote + 1 WHERE id = ?', [id]);

    const newOptionVotes = option.currentVotes + 1;
    const newPostVotes = post.vote + 1;

    await db.query(
      'INSERT INTO guest_votes (guest_id, post_id, option_id, type) VALUES (?, ?, ?, \'poll\')',
      [guest_id, id, optionId]
    );

    let name = guest_name || 'Anonim';
    let className = guest_class || 'Tamu';
    // Double check from db if not provided
    if (name === 'Anonim') {
      const [guest] = await db.query('SELECT name, class FROM buku_tamu WHERE id = ?', [guest_id]);
      if (guest.length > 0) {
        name = guest[0].name;
        className = guest[0].class;
      }
    }

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
      [guest_id, name, className, 'poll', post.title]
    );

    // Broadcast updates
    io.emit('poll:vote', {
      post_id: Number(id),
      option_id: Number(optionId),
      currentVotes: newOptionVotes,
      total_votes: newPostVotes
    });
    io.emit('admin:activity', {
      guest_id: Number(guest_id),
      guest_name: name,
      guest_class: className,
      action: 'poll',
      target: post.title,
      created_at: new Date()
    });

    res.json({
      success: true,
      post_id: Number(id),
      option_id: Number(optionId),
      currentVotes: newOptionVotes,
      total_votes: newPostVotes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal berpartisipasi dalam polling' });
  }
});

// Cancel poll vote (unpoll)
app.delete('/api/posts/:id/poll/:optionId', async (req, res) => {
  const { id, optionId } = req.params;
  const guest_id = req.body.guest_id || req.query.guest_id;

  if (!guest_id) {
    return res.status(401).json({ error: 'Aksi ini memerlukan login!' });
  }

  try {
    const [postArr] = await db.query('SELECT title, vote FROM posts WHERE id = ?', [id]);
    const [optionArr] = await db.query('SELECT label, currentVotes FROM poll_options WHERE id = ? AND post_id = ?', [optionId, id]);

    if (postArr.length === 0 || optionArr.length === 0) {
      return res.status(404).json({ error: 'Post atau Opsi tidak ditemukan!' });
    }
    const post = postArr[0];
    const option = optionArr[0];

    // Check if guest voted on this option of this post
    const [existing] = await db.query(
      'SELECT id FROM guest_votes WHERE guest_id = ? AND post_id = ? AND option_id = ?',
      [guest_id, id, optionId]
    );
    if (existing.length === 0) {
      return res.status(400).json({ error: 'Anda belum menyuarakan opsi ini!' });
    }

    // Decrement votes
    const newOptionVotes = Math.max(0, option.currentVotes - 1);
    const newPostVotes = Math.max(0, post.vote - 1);
    await db.query('UPDATE poll_options SET currentVotes = ? WHERE id = ? AND post_id = ?', [newOptionVotes, optionId, id]);
    await db.query('UPDATE posts SET vote = ? WHERE id = ?', [newPostVotes, id]);

    // Delete record
    await db.query(
      'DELETE FROM guest_votes WHERE guest_id = ? AND post_id = ? AND option_id = ?',
      [guest_id, id, optionId]
    );

    // Get guest info
    const [guestArr] = await db.query('SELECT name, class FROM buku_tamu WHERE id = ?', [guest_id]);
    const name = guestArr[0]?.name || 'Anonim';
    const className = guestArr[0]?.class || 'Tamu';

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
      [guest_id, name, className, 'unpoll', post.title]
    );

    // Broadcast updates
    io.emit('poll:unvote', {
      post_id: Number(id),
      option_id: Number(optionId),
      currentVotes: newOptionVotes,
      total_votes: newPostVotes
    });
    io.emit('poll:vote', {
      post_id: Number(id),
      option_id: Number(optionId),
      currentVotes: newOptionVotes,
      total_votes: newPostVotes
    });
    io.emit('admin:activity', {
      guest_id: Number(guest_id),
      guest_name: name,
      guest_class: className,
      action: 'unpoll',
      target: post.title,
      created_at: new Date()
    });

    res.json({
      success: true,
      post_id: Number(id),
      option_id: Number(optionId),
      currentVotes: newOptionVotes,
      total_votes: newPostVotes
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal membatalkan pilihan polling' });
  }
});

// Get Guest Votes (helper endpoint)
app.get('/api/guest/votes', async (req, res) => {
  const guest_id = req.query.guest_id;
  if (!guest_id) {
    return res.json([]);
  }
  try {
    const [votes] = await db.query(
      'SELECT post_id, option_id, reply_id, type FROM guest_votes WHERE guest_id = ?',
      [guest_id]
    );
    res.json(votes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data vote user' });
  }
});

// ==========================================
// ADMIN & GUEST BOOK SERVICE ENDPOINTS
// ==========================================

// Register Guest to Guest Book
app.post('/api/guest/register', async (req, res) => {
  const { name, class: className } = req.body;
  if (!name || !className) {
    return res.status(400).json({ error: 'Nama dan Kelas wajib diisi!' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO buku_tamu (name, class) VALUES (?, ?)',
      [name, className]
    );
    const guestId = result.insertId;

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
      [guestId, name, className, 'post', 'Buku Tamu']
    );

    // Broadcast activity
    io.emit('admin:activity', {
      guest_id: guestId,
      guest_name: name,
      guest_class: className,
      action: 'post',
      target: 'Buku Tamu',
      created_at: new Date()
    });
    io.emit('admin:guest_joined', {
      name,
      class: className,
      joined_at: new Date()
    });

    res.status(201).json({
      success: true,
      guest_id: guestId,
      name,
      class: className,
      role: 'guest'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mendaftar buku tamu' });
  }
});

// Get all guests
app.get('/api/admin/guests', async (req, res) => {
  try {
    const [guests] = await db.query('SELECT * FROM buku_tamu ORDER BY joined_at DESC');
    res.json(guests);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data buku tamu' });
  }
});

// Get activity logs
app.get('/api/admin/logs', async (req, res) => {
  try {
    const [logs] = await db.query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 50');
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil log aktivitas' });
  }
});

// Get mading quick stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [[guestsCount]] = await db.query('SELECT COUNT(*) as count FROM buku_tamu');
    const [[votesCount]] = await db.query('SELECT SUM(vote) as count FROM posts');
    const [[postsCount]] = await db.query('SELECT COUNT(*) as count FROM posts');
    res.json({
      total_guests: guestsCount.count || 0,
      total_votes: votesCount.count || 0,
      total_posts: postsCount.count || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data statistik' });
  }
});

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  if (username === adminUser && password === adminPass) {
    try {
      // Find or insert Admin in buku_tamu to get a valid guest_id
      let [adminGuest] = await db.query('SELECT id FROM buku_tamu WHERE name = ? AND class = ? LIMIT 1', ['Admin', 'Staf']);
      let adminGuestId;
      if (adminGuest.length === 0) {
        const [insertResult] = await db.query('INSERT INTO buku_tamu (name, class) VALUES (?, ?)', ['Admin', 'Staf']);
        adminGuestId = insertResult.insertId;
      } else {
        adminGuestId = adminGuest[0].id;
      }
      return res.json({
        success: true,
        user: {
          guest_id: adminGuestId,
          name: 'Admin',
          class: 'Staf',
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('Error registering admin guest record:', error);
      return res.status(500).json({ error: 'Gagal memproses login admin' });
    }
  }
  res.status(401).json({ error: 'Username atau Password salah!' });
});

// Delete Post
app.delete('/api/posts/:id', async (req, res) => {
  const { id } = req.params;
  const guest_id = req.body.guest_id || req.query.guest_id;
  const role = req.body.role || req.query.role;
  const guest_name = req.body.guest_name || req.query.guest_name;
  const guest_class = req.body.guest_class || req.query.guest_class;

  try {
    const [postArr] = await db.query('SELECT title, sender, class FROM posts WHERE id = ?', [id]);
    if (postArr.length === 0) {
      return res.status(404).json({ error: 'Post tidak ditemukan!' });
    }
    const post = postArr[0];

    // If role is not admin, verify ownership
    if (role !== 'admin') {
      if (post.sender !== guest_name || post.class !== guest_class) {
        return res.status(403).json({ error: 'Anda tidak memiliki hak untuk menghapus postingan ini!' });
      }
    }

    await db.query('DELETE FROM posts WHERE id = ?', [id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
      [guest_id || null, guest_name || 'Anonim', guest_class || 'Tamu', 'delete', post.title]
    );

    // Broadcast deletions and activity
    io.emit('post:delete', { id: Number(id) });
    io.emit('admin:activity', {
      guest_id: guest_id || null,
      guest_name: guest_name || 'Anonim',
      guest_class: guest_class || 'Tamu',
      action: 'delete',
      target: post.title,
      created_at: new Date()
    });

    res.json({ success: true, message: 'Post berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus post' });
  }
});

// Delete Reply
app.delete('/api/posts/:id/replies/:replyId', async (req, res) => {
  const { id, replyId } = req.params;
  const guest_id = req.body.guest_id || req.query.guest_id;
  const role = req.body.role || req.query.role;
  const guest_name = req.body.guest_name || req.query.guest_name;
  const guest_class = req.body.guest_class || req.query.guest_class;

  try {
    const [replyArr] = await db.query('SELECT text, sender, class FROM replies WHERE id = ? AND post_id = ?', [replyId, id]);
    if (replyArr.length === 0) {
      return res.status(404).json({ error: 'Komentar tidak ditemukan!' });
    }
    const reply = replyArr[0];

    // If role is not admin, verify ownership
    if (role !== 'admin') {
      if (reply.sender !== guest_name || reply.class !== guest_class) {
        return res.status(403).json({ error: 'Anda tidak memiliki hak untuk menghapus komentar ini!' });
      }
    }

    await db.query('DELETE FROM replies WHERE id = ? AND post_id = ?', [replyId, id]);

    // Log activity
    await db.query(
      'INSERT INTO activity_logs (guest_id, guest_name, guest_class, action, target) VALUES (?, ?, ?, ?, ?)',
      [guest_id || null, guest_name || 'Anonim', guest_class || 'Tamu', 'delete', reply.text.substring(0, 50)]
    );

    // Broadcast deletions and activity
    io.emit('reply:delete', { post_id: Number(id), reply_id: Number(replyId) });
    io.emit('admin:activity', {
      guest_id: guest_id || null,
      guest_name: guest_name || 'Anonim',
      guest_class: guest_class || 'Tamu',
      action: 'delete',
      target: reply.text.substring(0, 50),
      created_at: new Date()
    });

    res.json({ success: true, message: 'Komentar berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus komentar' });
  }
});

// Reset Database
app.post('/api/admin/reset', async (req, res) => {
  try {
    const sqlPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    const queries = sql
      .split(';')
      .map(q => q.replace(/--.*$/gm, '').trim())
      .filter(q => q.length > 0);
       
    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
      for (const query of queries) {
        await connection.query(query);
      }
      await connection.commit();
      connection.release();
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
    
    io.emit('db:reset');
    res.json({ success: true, message: 'Database berhasil direset ke bawaan pabrik' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mereset database' });
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 SUSI Backend running on http://localhost:${PORT}`);
});
