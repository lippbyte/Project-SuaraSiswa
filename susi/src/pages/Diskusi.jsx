import { FaAngleLeft } from "react-icons/fa";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

function Comment({ comment, onVote, user, onDelete, hasVoted }) {
    const isOwner = user && (user.role === 'admin' || (user.name === comment.sender && user.class === comment.class));
    return (
        <div className="bg-neutral-50 flex flex-col gap-1 p-4 rounded-lg border border-accent-100 shadow-sm relative text-dark">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-sm">{comment.sender}</p>
                    <p className="text-xs text-dark-100">{comment.class}</p>
                </div>
                {isOwner && (
                    <button 
                        onClick={onDelete}
                        className="text-red-600 hover:text-red-800 transition-colors font-bold cursor-pointer text-xs"
                    >
                        {user.role === 'admin' ? 'Hapus' : '🗑️ Hapus Milik Saya'}
                    </button>
                )}
            </div>
            <p className="pr-12">{comment.text}</p>
            <div 
                className={`absolute right-4 bottom-4 flex gap-1 items-center cursor-pointer transition-colors ${hasVoted ? 'text-green-700 font-bold' : 'hover:text-green-700 text-dark-100'}`}
                onClick={onVote}
            >
                <FaRegArrowAltCircleUp />
                {hasVoted ? `✓ ${comment.vote}` : comment.vote}
            </div>
        </div>
    );
}

export default function Diskusi({ card, setPageFunc, user, setShowLogin, userVotes, fetchUserVotes }) {
    if (!card) {
        return (
            <div className="page-container bg-light pl-4 pr-4 pb-18 pt-20 md:pt-24 lg:pl-12 lg:pr-12 lg:pt-26 flex flex-col justify-center items-center gap-4 text-dark min-h-[60vh]">
                <p className="text-lg font-bold text-dark-100">Data postingan tidak ditemukan atau halaman di-refresh.</p>
                <button 
                    onClick={() => setPageFunc('forum')}
                    className="px-6 py-2 bg-[#5C7A6B] text-light font-bold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer text-sm"
                >
                    Kembali ke Forum
                </button>
            </div>
        );
    }

    const [commentText, setCommentText] = useState('');
    const replies = card.replies || [];
    const repliesCount = replies.length;

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

    const handleReplyVote = async (replyId) => {
        if (!checkUser()) return;
        const hasVotedReply = userVotes && userVotes.some(v => v.reply_id === replyId);
        const method = hasVotedReply ? 'DELETE' : 'POST';
        const url = `${BACKEND_URL}/api/posts/${card.id}/replies/${replyId}/vote`;
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
                alert(data.error || 'Gagal mengubah suara komentar');
            }
        } catch (error) {
            console.error('Error voting reply:', error);
        }
    };

    const handleSendComment = async () => {
        if (!checkUser()) return;
        if (!commentText.trim()) return;
        try {
            const response = await fetch(`${BACKEND_URL}/api/posts/${card.id}/replies`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sender: user.role === 'admin' ? 'Admin Mading' : user.name,
                    class: user.role === 'admin' ? 'Staf' : user.class,
                    text: commentText,
                    guest_id: user.guest_id
                })
            });
            if (response.ok) {
                setCommentText('');
            }
        } catch (error) {
            console.error('Error sending reply:', error);
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

    const handleDeleteReply = async (replyId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return;
        try {
            const params = new URLSearchParams({
                guest_id: user.guest_id,
                role: user.role,
                guest_name: user.name,
                guest_class: user.class
            });
            const response = await fetch(`${BACKEND_URL}/api/posts/${card.id}/replies/${replyId}?${params}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Gagal menghapus komentar.');
            }
        } catch (error) {
            console.error('Error deleting reply:', error);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSendComment();
        }
    };

    const isPostOwner = user && (user.role === 'admin' || (user.name === card.sender && user.class === card.class));

    return (
        <div className="page-container bg-light pl-4 pr-4 pb-18 pt-20 md:pt-24 lg:pl-12 lg:pr-12 lg:pt-26 text-[10px] md:text-sm">
            <div className="flex gap-2 items-center font-bold pb-4">
                <div className="bg-light-100 rounded-full p-2 cursor-pointer" onClick={() => setPageFunc('forum')}><FaAngleLeft /></div>
                <span className="text-sm">Detail Diskusi</span>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                <div className="flex flex-col gap-4 flex-1">
                    <div className="bg-[#5C7A6B] p-4 rounded-lg flex flex-col gap-2 text-light relative">
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
                            <p>Suara</p>
                        </div>
                        <p 
                            className={`pl-4 pr-4 text-sm md:text-xl flex gap-2 items-center rounded-lg font-bold cursor-pointer transition-all active:scale-95 ${hasVoted ? 'bg-[#3b6d11] text-light' : 'bg-[#5C7A6B] text-light hover:brightness-110'}`}
                            onClick={handlePostVote}
                        >
                            <FaRegArrowAltCircleUp /> {hasVoted ? '✓ Batalkan' : 'Suarakan'}
                        </p>
                    </div>
                    <div className="fixed lg:static bottom-4 z-100 p-2 flex bg-dark-100/25 items-center text-sm rounded-xl border border-accent-100 left-4 right-4 lg:left-12 lg:right-12 backdrop-blur-sm">
                        <input 
                            type="text" 
                            className="flex-1 outline-none text-dark px-2 bg-transparent" 
                            placeholder={user ? "Tulis tanggapan Anda..." : "Masuk dengan Buku Tamu untuk menanggapi..."}
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <IoMdSend className="cursor-pointer hover:text-green-700 text-lg text-dark" onClick={handleSendComment} />
                    </div>
                </div>
                <div className="flex flex-col gap-4 flex-1">
                    <p className="text-sm font-bold text-dark-100">{repliesCount} Komentar</p>
                    {replies.map((reply) => {
                        const hasVotedReply = userVotes && userVotes.some(v => v.reply_id === reply.id);
                        return (
                            <Comment 
                                key={reply.id} 
                                comment={reply} 
                                onVote={() => handleReplyVote(reply.id)} 
                                user={user}
                                onDelete={() => handleDeleteReply(reply.id)}
                                hasVoted={hasVotedReply}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
