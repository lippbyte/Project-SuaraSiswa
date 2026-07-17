import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'susi',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
try {
  const connection = await pool.getConnection();
  console.log('✅ Connected to MySQL database successfully!');
  
  // Migration: Check if reply_id column exists in guest_votes table
  try {
    const [columns] = await connection.query('SHOW COLUMNS FROM guest_votes LIKE "reply_id"');
    if (columns.length === 0) {
      console.log('🔄 Migrating database: Adding reply_id column to guest_votes...');
      await connection.query('ALTER TABLE guest_votes ADD COLUMN reply_id INT NULL AFTER option_id');
      await connection.query("ALTER TABLE guest_votes MODIFY COLUMN type ENUM('upvote', 'poll', 'reply_vote') NOT NULL");
      // Update UNIQUE KEY unique_vote
      try {
        await connection.query('ALTER TABLE guest_votes DROP INDEX unique_vote');
        await connection.query('ALTER TABLE guest_votes ADD UNIQUE KEY unique_vote (guest_id, post_id, option_id, reply_id)');
      } catch (keyError) {
        console.warn('⚠️ Unique key adjustment warning:', keyError.message);
      }
      console.log('✅ Database migration successful!');
    }
  } catch (migError) {
    console.warn('⚠️ Database migration check skipped (table might not exist yet):', migError.message);
  }

  connection.release();
} catch (error) {
  console.error('❌ Failed to connect to MySQL database:', error.message);
  console.error('Verify your MySQL service is running and credentials in .env are correct.');
}

export default pool;
