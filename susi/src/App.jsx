import Navbar from './components/Navbar';
import Mading from './pages/Mading';
import Forum from './pages/Forum';
import Diskusi from './pages/Diskusi';
import Musyawarah from './pages/Musyawarah';
import Demos from './pages/Demos';
import Laporan from './pages/Laporan';
import Form from './pages/Form';
import AdminDashboard from './pages/AdminDashboard';
import gsap from 'gsap';
import AllData from './data/data.json';
import { useState, useMemo, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/all';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { io } from 'socket.io-client';

gsap.registerPlugin(Draggable, ScrollTrigger);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';


function App() {
  const [allData, setAllData] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [overflow, setOverflow] = useState('visible');
  const [page, setPage] = useState('mading');
  const [cardData, setCardData] = useState(null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('susi_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [userVotes, setUserVotes] = useState([]);

  const fetchUserVotes = (guestId) => {
    if (!guestId) {
      setUserVotes([]);
      return;
    }
    fetch(`${BACKEND_URL}/api/guest/votes?guest_id=${guestId}`)
      .then(res => res.json())
      .then(data => setUserVotes(data))
      .catch(err => console.error('Error fetching user votes:', err));
  };

  // Sync user state with localStorage and fetch votes
  useEffect(() => {
    if (user) {
      localStorage.setItem('susi_user', JSON.stringify(user));
      if (user.guest_id) {
        fetchUserVotes(user.guest_id);
      }
    } else {
      localStorage.removeItem('susi_user');
      setUserVotes([]);
    }
  }, [user]);

  const fetchPosts = () => {
    fetch(`${BACKEND_URL}/api/posts`)
      .then(res => res.json())
      .then(data => setAllData(data))
      .catch(err => {
        console.error('Error fetching posts:', err);
        // Fallback to static data if backend is not reachable
        setAllData(AllData);
      });
  };

  // Fetch initial posts on mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Connect socket.io and handle real-time events
  useEffect(() => {
    const socket = io(BACKEND_URL);

    socket.on('post:new', (newPost) => {
      setAllData(prev => [newPost, ...prev]);
    });

    socket.on('post:vote', ({ id, vote }) => {
      setAllData(prev => prev.map(p => p.id === id ? { ...p, vote } : p));
    });

    socket.on('post:unvote', ({ id, vote }) => {
      setAllData(prev => prev.map(p => p.id === id ? { ...p, vote } : p));
    });

    socket.on('reply:new', ({ post_id, reply }) => {
      setAllData(prev => prev.map(p => p.id === post_id ? {
        ...p,
        replies: [...(p.replies || []), reply]
      } : p));
    });

    socket.on('reply:vote', ({ post_id, reply_id, vote }) => {
      setAllData(prev => prev.map(p => p.id === post_id ? {
        ...p,
        replies: (p.replies || []).map(r => r.id === reply_id ? { ...r, vote } : r)
      } : p));
    });

    socket.on('poll:vote', ({ post_id, option_id, currentVotes, total_votes }) => {
      setAllData(prev => prev.map(p => p.id === post_id ? {
        ...p,
        vote: total_votes,
        options: (p.options || []).map(o => o.id === option_id ? { ...o, currentVotes } : o)
      } : p));
    });

    socket.on('poll:unvote', ({ post_id, option_id, currentVotes, total_votes }) => {
      setAllData(prev => prev.map(p => p.id === post_id ? {
        ...p,
        vote: total_votes,
        options: (p.options || []).map(o => o.id === option_id ? { ...o, currentVotes } : o)
      } : p));
    });

    socket.on('post:delete', ({ id }) => {
      setAllData(prev => prev.filter(p => p.id !== id));
    });

    socket.on('reply:delete', ({ post_id, reply_id }) => {
      setAllData(prev => prev.map(p => p.id === post_id ? {
        ...p,
        replies: (p.replies || []).filter(r => r.id !== reply_id)
      } : p));
    });

    socket.on('db:reset', () => {
      fetchPosts();
      if (user && user.guest_id) {
        fetchUserVotes(user.guest_id);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const activeCard = useMemo(() => {
    if (!cardData) return null;
    return allData.find(c => c.id === cardData.id) || cardData;
  }, [allData, cardData]);

  const setPageFunc = (value) => {
    setPage(value);
    // Immediately reset overflow when navigating away from mading
    if (value !== 'mading') setOverflow('visible');
  };

  const pageMapping = {
    mading: <Mading allData={allData} setPageFunc={setPageFunc} setCardData={setCardData} user={user} setShowLogin={setShowLogin} userVotes={userVotes} />,
    forum: <Forum allData={allData} setPageFunc={setPageFunc} setCardData={setCardData} user={user} setShowLogin={setShowLogin} userVotes={userVotes} />,
    diskusi: <Diskusi card={activeCard} setPageFunc={setPageFunc} user={user} setShowLogin={setShowLogin} userVotes={userVotes} fetchUserVotes={fetchUserVotes} />,
    musyawarah: <Musyawarah card={activeCard} setPageFunc={setPageFunc} user={user} setShowLogin={setShowLogin} userVotes={userVotes} fetchUserVotes={fetchUserVotes} />,
    demos: <Demos card={activeCard} setPageFunc={setPageFunc} user={user} setShowLogin={setShowLogin} userVotes={userVotes} fetchUserVotes={fetchUserVotes} />,
    laporan: <Laporan card={activeCard} setPageFunc={setPageFunc} user={user} setShowLogin={setShowLogin} userVotes={userVotes} fetchUserVotes={fetchUserVotes} />,
    form: <Form setPageFunc={setPageFunc} user={user} setShowLogin={setShowLogin} />,
    admin_dashboard: <AdminDashboard user={user} setPageFunc={setPageFunc} />
  };

  useGSAP(() => {
    const madingContainer = document.querySelector('#mading-container');
    gsap.from('.page-container', { opacity: 0 });
    if (madingContainer) {
      setOverflow('hidden');
      gsap.set('#mading-container', { x: -(madingContainer.offsetWidth / 2 - window.innerWidth / 2), y: -(madingContainer.offsetHeight / 2 - window.innerHeight / 2) });
      const draggables = Draggable.create(madingContainer, { bounds: 'body' });
      gsap.from('.card-container', { scale: 2, delay: 0.15 });
      gsap.from('.card-container', { rotate: 0, stagger: 0.15 });
      return () => {
        draggables.forEach(d => d.kill());
      };
    } else {
      setOverflow('visible');
    }
  }, [page]);

  return (
    <div
      style={{ overflow: overflow }}
      className={`w-full bg-light ${page === 'mading' ? 'h-svh' : 'min-h-svh'}`}
    >
      <Navbar showLogin={showLogin} setShowLogin={setShowLogin} setPageFunc={setPageFunc} page={page} user={user} setUser={setUser} />
      {pageMapping[page]}
      {/* <Form /> */}
    </div>
  );
}

export default App;