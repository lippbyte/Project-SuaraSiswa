import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { useMemo } from "react";
import { memo } from "react";
import gsap from "gsap";

const Card = memo(({ card, topCard, setPageFunc, setCardData, user }) => {
    const bgColors = {
        diskusi: '#5c7a6b',
        musyawarah: '#6b3f72',
        demos: '#d4a843',
        laporan: '#c0392b'
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        if (!confirm('Apakah Anda yakin ingin menghapus postingan ini?')) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/posts/${card.id}`, {
                method: 'DELETE'
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data.error || 'Gagal menghapus postingan.');
            }
            // UI update handled by socket event 'post:delete' in App.jsx
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus postingan. Periksa koneksi server.');
        }
    };

    return (
        <div className="forum-card-container" onClick={() => { setCardData(card); setPageFunc(card.type) }}>
            <div style={{ backgroundColor: bgColors[card.type] }} className="w-full h-full flex flex-col gap-2 bg-neutral-100 p-4 rounded-lg cursor-pointer shadow-lg border-2 border-accent-100">
                <div className="flex justify-between items-start gap-4">
                    <h2 style={{ color: '#eeeae0' }} className="font-bold text-dark text-sm md:text-xl truncate flex-1">{card.title}</h2>
                    {user && user.role === 'admin' && (
                        <button 
                            onClick={handleDelete}
                            className="bg-[#C0392B] text-light py-1 px-2.5 rounded-md text-[10px] font-bold cursor-pointer hover:brightness-110 active:scale-95 transition-all shadow-sm"
                        >
                            Hapus
                        </button>
                    )}
                </div>
                <p style={{ color: '#ddd8cb' }} className="text-dark-100">{card.text}</p>
                <div className="flex items-center justify-between gap-2 mt-auto">
                    <p style={{ color: '#ddd8cb' }} className="font-bold capitalize text-accent">{card.sender} · {card.type} · {card.time}</p>
                    <div style={{ color: '#ddd8cb' }} className="flex items-center gap-2"><FaRegArrowAltCircleUp />{card.vote}<div className="bg-neutral-100 pt-1 pb-1 pl-2 pr-2 brightness-95 rounded-lg capitalize text-accent border border-accent-100 font-bold">{card.category}</div></div>
                </div>
            </div>
        </div>
    )
})

export default function Forum({ allData = [], setPageFunc, setCardData, user }) {
    const [categoryActive, setCategoryActive] = useState('semua');
    const filteredAndSortedData = useMemo(() => {
        let data = allData;
        if (categoryActive !== 'semua') data = allData.filter(card => card.category === categoryActive);
        return [...data].sort((a, b) => b.vote - a.vote);
    }, [allData, categoryActive])
    const categories = useMemo(() => {
        return [...new Set(allData.map(card => card.category))];
    }, [allData]);
    let isTopCard = false;

    useGSAP(() => {
        gsap.from('.forum-card-container', { xPercent: 50, opacity: 0, stagger: 0.05, duration: 0.5, overwrite: 'auto' })
    }, [filteredAndSortedData])

    return (
        <div id="forum-container" className="page-container w-full min-h-svh bg-light pt-20 md:pt-24 lg:pt-26 pl-4 pr-4 lg:pl-12 lg:pr-12 pb-6 flex flex-col gap-2 md:gap-4 scrollbar-minimal text-[10px] md:text-sm overflow-x-hidden">
            <div className="detail-container flex flex-col gap-2">
                <h1 className="text-2xl lg:text-4xl font-bold">Forum Online</h1>
                <p className="pb-2">Ruang diskusi terbuka — Jam Kosong Edition</p>
                <div className="flex overflow-x-scroll  scrollbar-minimal gap-2 lg:overflow-hidden">
                    <div style={{ backgroundColor: categoryActive == 'semua' ? '#eaf3de' : '#f5f5f5', color: categoryActive == 'semua' ? '#386810' : '#8b7355' }} className="pt-1 pb-1 pl-2 pr-2 rounded-lg capitalize text-accent border border-accent-100 cursor-pointer" onClick={() => setCategoryActive('semua')}>Semua</div>
                    {categories.map((category) => (
                        <div key={category} style={{ backgroundColor: categoryActive == category ? '#eaf3de' : '#f5f5f5', color: categoryActive == category ? '#386810' : '#8b7355' }} className="bg-neutral-100 pt-1 pb-1 pl-2 pr-2 rounded-lg capitalize text-accent border border-accent-100 cursor-pointer" onClick={() => setCategoryActive(category)}>{category}</div>
                    ))}
                </div>
            </div>
            <div className="card-scroll-container flex flex-col gap-4 md:grid md:grid-cols-2">
                {filteredAndSortedData.map((card, index) => (<Card card={card} key={card.id} topCard={index < 4} setPageFunc={setPageFunc} setCardData={setCardData} user={user} />
                ))}
            </div>
        </div>
    )
}