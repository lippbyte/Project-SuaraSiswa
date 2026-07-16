import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { FaAngleLeft, FaUsers, FaVoteYea, FaClipboardList, FaSyncAlt } from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function AdminDashboard({ user, setPageFunc }) {
    const [stats, setStats] = useState({ total_guests: 0, total_votes: 0, total_posts: 0 });
    const [guests, setGuests] = useState([]);
    const [logs, setLogs] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Security check: Redirect if not admin
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            setPageFunc('forum');
        }
    }, [user, setPageFunc]);

    const fetchData = async () => {
        setIsRefreshing(true);
        try {
            const [statsRes, guestsRes, logsRes] = await Promise.all([
                fetch(`${BACKEND_URL}/api/admin/stats`),
                fetch(`${BACKEND_URL}/api/admin/guests`),
                fetch(`${BACKEND_URL}/api/admin/logs`)
            ]);

            if (statsRes.ok) setStats(await statsRes.json());
            if (guestsRes.ok) setGuests(await guestsRes.json());
            if (logsRes.ok) setLogs(await logsRes.json());
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();

        // Connect to Socket.io for live activity updates
        const socket = io(BACKEND_URL);

        socket.on('admin:activity', (newLog) => {
            // Prepend new activity log
            setLogs(prev => [newLog, ...prev].slice(0, 50));
            // Trigger refresh of stats and guests list dynamically for maximum reliability
            fetch(`${BACKEND_URL}/api/admin/stats`)
                .then(res => res.json())
                .then(data => setStats(data))
                .catch(err => console.error(err));
            
            if (newLog.action === 'post' && newLog.target === 'Buku Tamu') {
                fetch(`${BACKEND_URL}/api/admin/guests`)
                    .then(res => res.json())
                    .then(data => setGuests(data))
                    .catch(err => console.error(err));
            }
        });

        socket.on('admin:guest_joined', (guest) => {
            // Stats will already update from the activity log event, but let's sync guests
            fetch(`${BACKEND_URL}/api/admin/guests`)
                .then(res => res.json())
                .then(data => setGuests(data))
                .catch(err => console.error(err));
        });

        socket.on('db:reset', () => {
            fetchData();
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const formatTime = (dateStr) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
            return dateStr;
        }
    };

    const getActionBadgeColor = (action) => {
        switch (action) {
            case 'vote':
                return 'bg-[#5C7A6B]/20 text-[#476254] border-[#5C7A6B]/30';
            case 'unvote':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'poll':
                return 'bg-[#d4a843]/20 text-[#a37920] border-[#d4a843]/30';
            case 'unpoll':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'reply':
                return 'bg-[#6b3f72]/20 text-[#542d5b] border-[#6b3f72]/30';
            case 'post':
                return 'bg-[#3b6d11]/20 text-[#3b6d11] border-[#3b6d11]/30';
            case 'delete':
                return 'bg-neutral-200 text-neutral-700 border-neutral-300';
            default:
                return 'bg-neutral-200 text-neutral-700 border-neutral-300';
        }
    };

    const getActionLabel = (action, target) => {
        switch (action) {
            case 'vote':
                return 'Memberikan suara';
            case 'unvote':
                return 'Membatalkan suara';
            case 'poll':
                return 'Memilih opsi polling';
            case 'unpoll':
                return 'Membatalkan opsi polling';
            case 'reply':
                return 'Mengirim tanggapan';
            case 'post':
                return target === 'Buku Tamu' ? 'Mendaftar Buku Tamu' : 'Mengunggah postingan';
            case 'delete':
                return 'Menghapus konten';
            default:
                return action;
        }
    };

    if (!user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="page-container bg-light pl-4 pr-4 pb-12 pt-20 md:pt-24 lg:pl-12 lg:pr-12 lg:pt-26 text-xs md:text-sm text-dark min-h-screen overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center pb-6 border-b border-accent-100/50">
                <div className="flex gap-2 items-center font-bold">
                    <div 
                        className="bg-neutral-50 hover:bg-neutral-100 rounded-full p-2 cursor-pointer border border-accent-100/50 transition-all active:scale-90" 
                        onClick={() => setPageFunc('forum')}
                    >
                        <FaAngleLeft className="text-dark text-lg" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-dark tracking-tight">Dashboard Admin</h1>
                        <p className="text-dark-100 text-xs font-normal">Pemantauan aktivitas secara real-time</p>
                    </div>
                </div>
                <button
                    onClick={fetchData}
                    disabled={isRefreshing}
                    className={`flex items-center gap-2 px-4 py-2 border border-accent-100/80 bg-neutral-50 rounded-lg shadow-sm hover:bg-neutral-100 active:scale-95 transition-all cursor-pointer font-bold ${isRefreshing ? 'opacity-50' : ''}`}
                >
                    <FaSyncAlt className={isRefreshing ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {/* Stat Card 1 */}
                <div className="bg-[#eaf3de] border border-[#3b6d11]/20 rounded-xl p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[#3b6d11] font-bold text-xs uppercase tracking-wider">Siswa Terdaftar (Buku Tamu)</p>
                        <h2 className="text-3xl md:text-4xl font-black text-[#2e550c] mt-1">{stats.total_guests}</h2>
                    </div>
                    <div className="bg-[#3b6d11]/10 p-3.5 rounded-xl text-[#3b6d11] text-2xl">
                        <FaUsers />
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-[#fff9e6] border border-[#d4a843]/20 rounded-xl p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[#a37920] font-bold text-xs uppercase tracking-wider">Total Partisipasi Suara</p>
                        <h2 className="text-3xl md:text-4xl font-black text-[#856116] mt-1">{stats.total_votes}</h2>
                    </div>
                    <div className="bg-[#d4a843]/10 p-3.5 rounded-xl text-[#d4a843] text-2xl">
                        <FaVoteYea />
                    </div>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-[#f2e6f4] border border-[#6b3f72]/20 rounded-xl p-5 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[#542d5b] font-bold text-xs uppercase tracking-wider">Total Postingan Aktif</p>
                        <h2 className="text-3xl md:text-4xl font-black text-[#422247] mt-1">{stats.total_posts}</h2>
                    </div>
                    <div className="bg-[#6b3f72]/10 p-3.5 rounded-xl text-[#6b3f72] text-2xl">
                        <FaClipboardList />
                    </div>
                </div>
            </div>

            {/* Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Guest Book List */}
                <div className="bg-neutral-50 border border-accent-100 rounded-xl p-4 shadow-sm flex flex-col h-[500px]">
                    <h3 className="font-black text-lg text-dark pb-3 border-b border-accent-100/50 flex justify-between items-center">
                        <span>Buku Tamu Digital</span>
                        <span className="bg-[#3b6d11]/10 text-[#3b6d11] px-2 py-0.5 rounded text-xs font-bold">{guests.length} Pengunjung</span>
                    </h3>
                    <div className="overflow-y-auto flex-1 mt-3 scrollbar-minimal">
                        {guests.length === 0 ? (
                            <div className="h-full flex flex-col justify-center items-center text-dark-100 font-bold">
                                Belum ada siswa yang mendaftar Buku Tamu.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-accent-100/60 text-dark-100 font-bold uppercase tracking-wider text-[10px]">
                                        <th className="py-2">No.</th>
                                        <th className="py-2">Nama</th>
                                        <th className="py-2">Kelas/Gugus</th>
                                        <th className="py-2">Waktu Hadir</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {guests.map((g, idx) => (
                                        <tr key={g.id} className="border-b border-accent-100/30 hover:bg-neutral-100/50 transition-colors">
                                            <td className="py-3 font-bold text-dark-100">{guests.length - idx}</td>
                                            <td className="py-3 font-bold text-dark">{g.name}</td>
                                            <td className="py-3 font-bold">{g.class}</td>
                                            <td className="py-3 text-dark-100">{new Date(g.joined_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Live Activity Log */}
                <div className="bg-neutral-50 border border-accent-100 rounded-xl p-4 shadow-sm flex flex-col h-[500px]">
                    <h3 className="font-black text-lg text-dark pb-3 border-b border-accent-100/50 flex justify-between items-center">
                        <span>Live Activity Feed</span>
                        <span className="flex items-center gap-1.5 text-xs text-[#3b6d11] font-bold">
                            <span className="w-2.5 h-2.5 bg-[#3b6d11] rounded-full animate-ping"></span>
                            Live
                        </span>
                    </h3>
                    <div className="overflow-y-auto flex-1 mt-3 scrollbar-minimal flex flex-col gap-3.5">
                        {logs.length === 0 ? (
                            <div className="h-full flex flex-col justify-center items-center text-dark-100 font-bold">
                                Belum ada aktivitas masuk.
                            </div>
                        ) : (
                             logs.map((log) => (
                                <div key={log.id || Math.random()} className="flex items-start gap-3 p-3 bg-neutral-100 border border-accent-100/50 rounded-lg hover:shadow-sm transition-all">
                                    <span className={`px-2 py-0.5 border text-[10px] rounded-md font-bold shrink-0 uppercase ${getActionBadgeColor(log.action)}`}>
                                        {log.action}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-dark font-medium">
                                            <span className="font-black text-[#5C7A6B]">{log.guest_name}</span> 
                                            <span className="text-dark-100 text-xs font-bold"> ({log.guest_class})</span>
                                        </p>
                                        <p className="text-dark-100 text-[11px] mt-0.5 font-semibold">
                                            {getActionLabel(log.action, log.target)}: <span className="italic">"{log.target}"</span>
                                        </p>
                                    </div>
                                    <span className="text-[10px] text-dark-100 whitespace-nowrap">
                                        {formatTime(log.created_at || log.joined_at)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
