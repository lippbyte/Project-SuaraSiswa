import { FaAngleLeft } from "react-icons/fa";
import { FaRegArrowAltCircleUp } from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function Musyawarah({ card, setPageFunc, user, setShowLogin, userVotes, fetchUserVotes }) {
    if (!card) {
        return (
            <div className="page-container bg-light pl-4 pr-4 pb-18 pt-20 md:pt-24 lg:pl-12 lg:pr-12 lg:pt-26 flex flex-col justify-center items-center gap-4 text-dark min-h-[60vh]">
                <p className="text-lg font-bold text-dark-100">Data postingan tidak ditemukan atau halaman di-refresh.</p>
                <button 
                    onClick={() => setPageFunc('forum')}
                    className="px-6 py-2 bg-[#6b3f72] text-light font-bold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer text-sm"
                >
                    Kembali ke Forum
                </button>
            </div>
        );
    }

    const agendaList = card.agenda || [];
    const pesertaList = card.peserta || [];

    const checkUser = () => {
        if (!user) {
            setShowLogin(true);
            return false;
        }
        return true;
    };

    const hasVoted = userVotes && userVotes.some(v => v.post_id === card.id && v.option_id === null);

    const handlePostVote = async () => {
        if (!checkUser()) return;
        const method = hasVoted ? 'DELETE' : 'POST';
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
                <span className="text-sm">Detail Musyawarah</span>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                <div className="flex flex-col gap-4 flex-1">
                    <div className="bg-[#6b3f72] p-4 rounded-lg flex flex-col gap-2 text-light relative">
                        {isPostOwner && (
                            <button 
                                onClick={handleDeletePost}
                                className="absolute right-4 top-4 bg-[#C0392B] hover:brightness-110 text-light py-1 px-3 rounded-md text-xs font-bold cursor-pointer transition-all shadow-md"
                            >
                                {user.role === 'admin' ? 'Hapus Post' : '🗑️ Hapus Milik Saya'}
                            </button>
                        )}
                        <div className="flex gap-2">
                            <div className="bg-neutral-100 pt-1 pb-1 pl-2 pr-2 brightness-95 rounded-lg capitalize w-fit text-accent font-bold">{card.category}</div>
                            {card.status ? (
                                <div className="bg-[#eaf3de] pt-1 pb-1 pl-2 pr-2 brightness-95 rounded-lg capitalize w-fit text-[#3b6d11] font-bold">Selesai</div>
                            ) : (<div></div>)}
                        </div>
                        <h2 className="font-bold text-sm md:text-xl truncate pr-24">{card.title}</h2>
                        <p className="text-light-100">{card.text}</p>
                        <p className="font-bold capitalize">{card.sender} · {card.class} · {card.type} · {card.time}</p>
                    </div>
                    <div className="bg-neutral-50 p-4 border border-accent-100 rounded-lg flex justify-between shadow-sm">
                        <div className="flex flex-col">
                            <h2 className="font-bold text-xl md:text-2xl">{card.vote}</h2>
                            <p>Suara</p>
                        </div>
                        <p 
                            className={`pl-4 pr-4 text-sm md:text-xl flex gap-2 items-center rounded-lg font-bold cursor-pointer transition-all active:scale-95 ${hasVoted ? 'bg-[#3b6d11] text-light' : 'bg-[#6b3f72] text-light hover:brightness-110'}`}
                            onClick={handlePostVote}
                        >
                            <FaRegArrowAltCircleUp /> {hasVoted ? '✓ Batalkan' : 'Suarakan'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 flex-1">
                    <p className="text-sm font-bold text-dark-100">Agenda</p>
                    <div className="bg-neutral-50 p-4 flex flex-col rounded-lg border border-accent-100 shadow-sm gap-2">
                        {agendaList.map((agenda, index) => (
                            <div key={index} className="flex gap-3 items-center">
                                <p className="p-2 h-7.5 md:h-8.5 w-7.5 md:w-8.5 text-center rounded-full font-bold text-light bg-[#6b3f72]">{index + 1}</p>
                                <p className="text-sm">{agenda}</p>
                            </div>
                        ))}
                    </div>
                    <p className="text-sm font-bold text-dark-100">Peserta</p>
                    <div className="bg-neutral-50 p-4 rounded-lg shadow-sm border border-accent-100 flex flex-col gap-2">
                        {pesertaList.map((peserta, index) => (
                            <div key={index} className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm">{peserta.name}</p>
                                    <p className="text-sm text-dark-100">{peserta.role}</p>
                                </div>
                                <p style={{ backgroundColor: peserta.keterangan ? '#eaf3de' : '#fcebeb', color: peserta.keterangan ? '#3b6d11' : '#791f1f' }} className="text-sm pl-2 pr-2 pt-1 pb-1 rounded-xl border border-accent-100">{peserta.keterangan ? 'Hadir' : 'Tidak Hadir'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
