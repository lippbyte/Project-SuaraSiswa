import { useState, useMemo, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import Navbar from './components/Navbar';
import Mading from './pages/Mading';
import Forum from './pages/Forum';
import Diskusi from './pages/Diskusi';
import Musyawarah from './pages/Musyawarah';
import Demos from './pages/Demos';
import Laporan from './pages/Laporan';
import Form from './pages/Form';
import AdminDashboard from './pages/AdminDashboard';
import AllData from './data/data.json';
import { PageTransitionProvider, usePageTransition } from './context/PageTransitionContext';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { io } from 'socket.io-client';

gsap.registerPlugin(ScrollTrigger);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function DetailRoute(props) {
  const { Component, allData, setPageFunc, user, setShowLogin, userVotes, fetchUserVotes } = props;
  const { id } = useParams();
  const card = useMemo(() => {
    if (id) {
      const found = allData.find((c) => String(c.id) === String(id));
      if (found) return found;
    }
    return allData[0] || null;
  }, [allData, id]);

  return (
    <Component
      card={card}
      setPageFunc={setPageFunc}
      user={user}
      setShowLogin={setShowLogin}
      userVotes={userVotes}
      fetchUserVotes={fetchUserVotes}
    />
  );
}

function AppContent() {
  const [allData, setAllData] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('susi_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [userVotes, setUserVotes] = useState([]);

  const location = useLocation();
  const { transitionTo } = usePageTransition();

  const isMading = location.pathname === '/' || location.pathname === '/mading';

  const navigateFunc = (target, data) => {
    if (data) setCardData(data);
    if (!target) return;
    if (target.startsWith('/')) {
      transitionTo(target);
    } else if (target === 'mading') {
      transitionTo('/mading');
    } else if (target === 'forum') {
      transitionTo('/forum');
    } else if (target === 'form' || target === 'kirim') {
      transitionTo('/kirim');
    } else if (target === 'admin_dashboard' || target === 'admin') {
      transitionTo('/admin');
    } else if (['diskusi', 'musyawarah', 'demos', 'laporan'].includes(target)) {
      const targetId = data?.id || cardData?.id;
      if (targetId) transitionTo(`/${target}/${targetId}`);
      else transitionTo(`/${target}`);
    } else {
      transitionTo(target);
    }
  };

  const fetchUserVotes = (guestId) => {
    if (!guestId) {
      setUserVotes([]);
      return;
    }
    fetch(`${BACKEND_URL}/api/guest/votes?guest_id=${guestId}`)
      .then((res) => res.json())
      .then((data) => setUserVotes(data))
      .catch((err) => console.error('Error fetching user votes:', err));
  };

  // Sync user state with localStorage and fetch votes
  useEffect(() => {
    if (user) {
      localStorage.setItem('susi_user', JSON.stringify(user));
      if (user.guest_id) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUserVotes(user.guest_id);
      }
    } else {
      localStorage.removeItem('susi_user');
      setUserVotes([]);
    }
  }, [user]);

  const fetchPosts = () => {
    fetch(`${BACKEND_URL}/api/posts`)
      .then((res) => res.json())
      .then((data) => setAllData(data))
      .catch((err) => {
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
      setAllData((prev) => [newPost, ...prev]);
    });

    socket.on('post:vote', ({ id, vote }) => {
      setAllData((prev) => prev.map((p) => (p.id === id ? { ...p, vote } : p)));
    });

    socket.on('post:unvote', ({ id, vote }) => {
      setAllData((prev) => prev.map((p) => (p.id === id ? { ...p, vote } : p)));
    });

    socket.on('reply:new', ({ post_id, reply }) => {
      setAllData((prev) =>
        prev.map((p) =>
          p.id === post_id
            ? {
                ...p,
                replies: [...(p.replies || []), reply]
              }
            : p
        )
      );
    });

    socket.on('reply:vote', ({ post_id, reply_id, vote }) => {
      setAllData((prev) =>
        prev.map((p) =>
          p.id === post_id
            ? {
                ...p,
                replies: (p.replies || []).map((r) => (r.id === reply_id ? { ...r, vote } : r))
              }
            : p
        )
      );
    });

    socket.on('poll:vote', ({ post_id, option_id, currentVotes, total_votes }) => {
      setAllData((prev) =>
        prev.map((p) =>
          p.id === post_id
            ? {
                ...p,
                vote: total_votes,
                options: (p.options || []).map((o) => (o.id === option_id ? { ...o, currentVotes } : o))
              }
            : p
        )
      );
    });

    socket.on('poll:unvote', ({ post_id, option_id, currentVotes, total_votes }) => {
      setAllData((prev) =>
        prev.map((p) =>
          p.id === post_id
            ? {
                ...p,
                vote: total_votes,
                options: (p.options || []).map((o) => (o.id === option_id ? { ...o, currentVotes } : o))
              }
            : p
        )
      );
    });

    socket.on('post:delete', ({ id }) => {
      setAllData((prev) => prev.filter((p) => p.id !== id));
    });

    socket.on('reply:delete', ({ post_id, reply_id }) => {
      setAllData((prev) =>
        prev.map((p) =>
          p.id === post_id
            ? {
                ...p,
                replies: (p.replies || []).filter((r) => r.id !== reply_id)
              }
            : p
        )
      );
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

  useGSAP(() => {
    const madingContainer = document.querySelector('#mading-container');
    // Use fromTo with clearProps to guarantee page is always visible after animation
    gsap.fromTo('.page-container', { opacity: 0 }, { opacity: 1, duration: 0.4, clearProps: 'opacity,filter' });
    if (madingContainer) {
      gsap.from('.card-container', { scale: 2, delay: 0.15 });
      gsap.from('.card-container', { rotate: 0, stagger: 0.15 });
    }
  }, [location.pathname]);

  return (
    <div
      className={`w-full bg-light ${isMading ? 'h-svh overflow-hidden' : 'min-h-svh overflow-visible'}`}
    >
      <Navbar
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        setPageFunc={navigateFunc}
        user={user}
        setUser={setUser}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/mading" replace />} />
        <Route
          path="/mading"
          element={
            <Mading
              allData={allData}
              setPageFunc={navigateFunc}
              transitionTo={navigateFunc}
              setCardData={setCardData}
              user={user}
              setShowLogin={setShowLogin}
              userVotes={userVotes}
            />
          }
        />
        <Route
          path="/forum"
          element={
            <Forum
              allData={allData}
              setPageFunc={navigateFunc}
              setCardData={setCardData}
              user={user}
              setShowLogin={setShowLogin}
              userVotes={userVotes}
            />
          }
        />
        <Route
          path="/kirim"
          element={<Form setPageFunc={navigateFunc} user={user} setShowLogin={setShowLogin} />}
        />
        <Route path="/form" element={<Navigate to="/kirim" replace />} />
        <Route
          path="/admin"
          element={<AdminDashboard user={user} setPageFunc={navigateFunc} />}
        />
        <Route path="/admin_dashboard" element={<Navigate to="/admin" replace />} />

        {/* Detail Aspirasi dengan Dukungan Parameter ID */}
        <Route
          path="/diskusi/:id?"
          element={
            <DetailRoute
              Component={Diskusi}
              allData={allData}
              setPageFunc={navigateFunc}
              user={user}
              setShowLogin={setShowLogin}
              userVotes={userVotes}
              fetchUserVotes={fetchUserVotes}
            />
          }
        />
        <Route
          path="/musyawarah/:id?"
          element={
            <DetailRoute
              Component={Musyawarah}
              allData={allData}
              setPageFunc={navigateFunc}
              user={user}
              setShowLogin={setShowLogin}
              userVotes={userVotes}
              fetchUserVotes={fetchUserVotes}
            />
          }
        />
        <Route
          path="/demos/:id?"
          element={
            <DetailRoute
              Component={Demos}
              allData={allData}
              setPageFunc={navigateFunc}
              user={user}
              setShowLogin={setShowLogin}
              userVotes={userVotes}
              fetchUserVotes={fetchUserVotes}
            />
          }
        />
        <Route
          path="/laporan/:id?"
          element={
            <DetailRoute
              Component={Laporan}
              allData={allData}
              setPageFunc={navigateFunc}
              user={user}
              setShowLogin={setShowLogin}
              userVotes={userVotes}
              fetchUserVotes={fetchUserVotes}
            />
          }
        />

        {/* Fallback ke /mading */}
        <Route path="*" element={<Navigate to="/mading" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <PageTransitionProvider>
      <AppContent />
    </PageTransitionProvider>
  );
}
