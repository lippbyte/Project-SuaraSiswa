import { FaAngleLeft } from "react-icons/fa";
import { FaRegArrowAltCircleUp } from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function Demos({ card, setPageFunc, user, setShowLogin, userVotes, fetchUserVotes }) {
    if (!card) {
        return (
            <div className="page-container bg-light pl-4 pr-4 pb-18 pt-20 md:pt-24 lg:pl-12 lg:pr-12 lg:pt-26 flex flex-col justify-center items-center gap-4 text-dark min-h-[60vh]">
                <p className="text-lg font-bold text-dark-100">Data postingan tidak ditemukan atau halaman di-refresh.</p>
                <button 
                    onClick={() => setPageFunc('forum')}
                    className="px-6 py-2 bg-[#d4a843] text-light font-bold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer text-sm"
                >
                    Kembali ke Forum
                </button>
            </div>
        );
    }

    const options = card.options || [];
    const voteTotal = options.reduce((sum, o) => sum + o.currentVotes, 0);
    const maxVotes = options.length > 0 ? Math.max(...options.map(o => o.currentVotes)) : 0;

    const checkUser = () => {
        if (!user) {
            setShowLogin(true);
            return false;
        }
        return true;
    };

    const hasVotedPost = userVotes && userVotes.some(v => v.post_id === card.id && v.option_id === null);

    const getVotedOption = () => {
        if (!userVotes) return null;
        const v = userVotes.find(v => v.post_id === card.id && v.option_id !== null);
        return v ? v.option_id : null;
    };
    const votedOptionId = getVotedOption();

    const handlePostVote = async () => {
        if (!checkUser()) return;
        const method = hasVotedPost ? 'DELETE' : 'POST';
        try {
            const response = await fetch(`${BACKEND_URL}/api/posts/${card.id}/vote`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    guest_id: user?.guest_id,
                    guest_name: user?.name,
                    guest_class: user?.class,
                    role: user?.role
                })
            });
            if (response.ok) {
                if (fetchUserVotes && user?.guest_id) {
                    fetchUserVotes(user.guest_id);
                }
            } else {
                const data = await response.json();
                alert(data.error || 'Gagal mengubah suara');
            }
        } catch (error) {
            console.error('Error voting post:', error);
        }
    };

    const handleOptionVote = async (optionId) => {
        if (!checkUser()) return;
        const isVoted = votedOptionId === optionId;
        const method = isVoted ? 'DELETE' : 'POST';
        const url = `${BACKEND_URL}/api/posts/${card.id}/poll/${optionId}`;
        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    guest_id: user?.guest_id,
                    guest_name: user?.name,
                    guest_class: user?.class,
                    role: user?.role
                })
            });
            if (response.ok) {
                if (fetchUserVotes && user?.guest_id) {
                    fetchUserVotes(user.guest_id);
                }
            } else {
                const data = await response.json();
                alert(data.error || 'Gagal memilih opsi polling');
            }
        } catch (error) {
            console.error('Error voting poll option:', error);
        }
    };

    const handleDeletePost = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus postingan ini?')) return;
        try {
            const params = new URLSearchParams({
                guest_id: user.guest_id,
                role: user.role,
                guest_name: user.name,
                guest_class: user.class
            });
            const response = await fetch(`${BACKEND_URL}/api/posts/${card.id}?${params}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setPageFunc('forum');
            } else {
                const data = await response.json();
                alert(data.error || 'Gagal menghapus postingan.');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };

    const isPostOwner = user && (user.role === 'admin' || (user.name === card.sender && user.class === card.class));

    return (
        <div className="page-container bg-light pl-4 pr-4 pb-18 pt-20 md:pt-24 lg:pl-12 lg:pr-12 lg:pt-26 text-[10px] md:text-sm">
            <div className="flex gap-2 items-center font-bold pb-4">
                <div className="bg-light-100 rounded-full p-2 cursor-pointer" onClick={() => setPageFunc('forum')}><FaAngleLeft /></div>
                <span className="text-sm">Detail Demos</span>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                <div className="flex flex-col gap-4 flex-1">
                    <div className="bg-[#d4a843] p-4 rounded-lg flex flex-col gap-2 text-light relative">
                        {isPostOwner && (
                            <button 
                                onClick={handleDeletePost}
                                className="absolute right-4 top-4 bg-[#C0392B] hover:brightness-110 text-light py-1 px-3 rounded-md text-xs font-bold cursor-pointer transition-all shadow-md"
                            >
                                {user.role === 'admin' ? 'Hapus Post' : '🗑️ Hapus Milik Saya'}
                            </button>
                        )}
                        <div className="bg-neutral-100 pt-1 pb-1 pl-2 pr-2 brightness-95 rounded-lg capitalize w-fit text-accent font-bold">{card.category}</div>
                        <h2 className="font-bold text-sm md:text-xl truncate pr-24">{card.title}</h2>
                        <p className="text-light-100">{card.text}</p>
                        <p className="font-bold capitalize">{card.sender} · {card.class} · {card.type} · {card.time}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 border border-accent-100 rounded-lg flex justify-between shadow-sm">
                        <div className="flex flex-col">
                            <h2 className="font-bold text-xl md:text-2xl">{card.vote}</h2>
                            <p>Total Suara</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 flex-1">
                    <p className="text-sm font-bold text-dark-100">Opsi {votedOptionId ? <span className="text-[#d4a843]">(Klik pilihan Anda untuk membatalkan)</span> : ''}</p>
                    {options.map((option) => {
                        const percent = voteTotal > 0 ? Math.floor((option.currentVotes / voteTotal) * 100) : 0;
                        const isSelected = votedOptionId === option.id;
                        return (
                            <div 
                                key={option.id} 
                                className={`p-4 border rounded-lg flex flex-col shadow-sm gap-2 cursor-pointer transition-all active:scale-[0.99] ${isSelected ? 'bg-[#3b6d11]/10 border-[#3b6d11]/40' : 'bg-neutral-50 border-accent-100 hover:bg-neutral-100/80'}`}
                                onClick={() => handleOptionVote(option.id)}
                            >
                                <div className="w-full flex justify-between items-center">
                                    <p className={`text-sm font-bold ${isSelected ? 'text-[#3b6d11]' : ''}`}>{option.label} {isSelected ? '✓' : ''}</p>
                                    <p className="text-dark-100 font-bold">{percent}%</p>
                                </div>
                                <div className="bg-light-100 w-full h-2 rounded-2xl relative">
                                    <div style={{ width: `${percent}%`, backgroundColor: isSelected ? '#3b6d11' : (option.currentVotes === maxVotes && maxVotes > 0 ? '#3b6d11' : '#d4a843') }} className="absolute h-full rounded-2xl"></div>
                                </div>
                                <p className="text-dark-100">{option.currentVotes} Suara</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
