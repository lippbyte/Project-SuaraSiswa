import { FaRegArrowAltCircleUp, FaUser } from "react-icons/fa";
import { FiArrowUpRight, FiBookOpen } from "react-icons/fi";
import Pin from "./Pin";

export default function Book({ card, setPageFunc, setCardData }) {
    // Fallback card data jika props card belum diberikan
    const currentCard = card || {
        id: 99,
        type: "musyawarah",
        category: "kegiatan",
        title: "Buku Catatan Musyawarah Siswa",
        text: "Ruang bertukar gagasan, evaluasi kegiatan bersama, dan penyaluran ide antar kelas.",
        sender: "OSIS / Tim Mading",
        vote: 85
    };

    const { type, title, text, sender, vote } = currentCard;

    // Warna tema cover buku sesuai tipe aspirasi (sinkron dengan kecerahan News.jsx #F25724)
    const bgColors = {
        diskusi: "#1E9A68",
        laporan: "#F25724",
        musyawarah: "#8E44AD",
        demos: "#F59E0B"
    };

    const spineColors = {
        diskusi: "#156e4a",
        laporan: "#bf3e15",
        musyawarah: "#672d80",
        demos: "#b87504"
    };

    const bgColor = bgColors[type] || "#1E9A68";
    const spineColor = spineColors[type] || "#156e4a";

    // Rotasi & alignment stabil berbasis ID agar tampak organik tanpa impure function
    const cardId = Number(currentCard.id) || 1;
    const rotation = ((cardId * 7) % 7) - 3; // Rentang -3deg s.d. +3deg
    const aligns = ["flex-start", "center", "flex-end"];
    const randomAlign = aligns[cardId % aligns.length];

    // Fungsionalitas navigasi persis seperti Card.jsx
    const handleOpenCard = () => {
        if (typeof setCardData === "function") setCardData(currentCard);
        if (typeof setPageFunc === "function") {
            setPageFunc(`/${type}/${currentCard.id}`, currentCard);
        }
    };

    const btnCircle =
        "w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1e1e1e] hover:bg-black active:scale-95 text-white/90 border border-white/15 flex items-center justify-center shadow-lg transition-all cursor-pointer relative group/btn";

    return (
        <div
            style={{ alignSelf: randomAlign, rotate: `${rotation}deg` }}
            className="card-container group relative pr-12 my-3 select-none"
        >

            {/* Bodi Buku (Varian Card dengan Gaya Jurnal / Buku Mading) */}
            <div
                style={{ backgroundColor: bgColor }}
                className="group relative w-60 sm:w-64 h-[320px] sm:h-[340px] rounded-r-2xl rounded-l-xs shadow-2xl border-r-[7px] border-r-[#e7dfcf] border-y border-y-black/15 hover:scale-105 transition-all duration-200 flex flex-col justify-between p-4"
            >
                {/* Punggung Buku (Left Spine dengan aksen jilid kulit) */}
                <div
                    style={{ backgroundColor: spineColor }}
                    className="absolute top-0 bottom-0 left-0 w-4 rounded-l-xs border-r border-r-white/10 shadow-inner flex flex-col justify-around py-3"
                >
                    <div className="w-full h-1 bg-white/20"></div>
                    <div className="w-full h-1 bg-white/20"></div>
                    <div className="w-full h-1 bg-white/20"></div>
                </div>

                {/* Label Kertas di Bagian Depan Buku (Menampilkan Judul & Teks Aspirasi) */}
                <div className="ml-3 p-3.5 bg-[#fbf8f0] border border-[#d6c7b2] rounded-lg shadow-md flex flex-col gap-2 relative">
                    <div className="border border-dashed border-[#b8a68d]/70 p-2.5 flex flex-col">
                        <h2 className="font-bold text-base sm:text-lg text-[#2c241c] leading-tight mt-1 line-clamp-2">
                            {title}
                        </h2>
                        <div className="w-8 h-0.5 bg-[#8b6f4e]/40 my-2"></div>
                        <p className="text-xs text-[#524438] leading-relaxed line-clamp-3">
                            {text}
                        </p>
                    </div>
                </div>

                {/* Footer Buku: Pengirim, Vote, & Aksi Masuk */}
                <div className="ml-3 pt-2 border-t border-white/20 flex items-center justify-between text-light text-xs font-bold">
                    <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                        <FaUser className="text-[11px] opacity-80 shrink-0" />
                        <span className="truncate capitalize">{sender}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/25 px-2 py-0.5 rounded-md border border-white/15">
                        <FaRegArrowAltCircleUp className="text-xs text-amber-300" />
                        <span>{vote}</span>
                    </div>
                </div>

                {/* Pita Pembatas Buku (Bookmark Ribbon) */}
                <div className="absolute -bottom-4 left-9 w-3.5 h-7 bg-[#a3282c] shadow-md rounded-b-xs"></div>

                {/* Pin Mading */}
                <div className="absolute -right-2 -top-2 z-10 scale-110 pointer-events-none">
                    <Pin />
                </div>
            </div>

            {/* Toolbar Tombol CTA Vertikal di Kanan (Hover-Reveal Tanpa Jeda/Gap) */}
            <div className="absolute right-0 top-10 flex flex-col gap-2.5 z-20 invisible opacity-0 translate-x-1 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
                {/* CTA 1: Buka Halaman Aspirasi */}
                <button
                    onClick={handleOpenCard}
                    className={btnCircle}
                    aria-label="Buka pembahasan"
                >
                    <FiArrowUpRight className="text-base sm:text-lg text-amber-300" />
                    <span className="pointer-events-none absolute right-11 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-30">
                        Buka Pembahasan
                    </span>
                </button>

                {/* CTA 2: Indikator Dukungan / Vote */}
                <button
                    onClick={handleOpenCard}
                    className={btnCircle}
                    aria-label="Suara / Vote"
                >
                    <FaRegArrowAltCircleUp className="text-sm sm:text-base text-white" />
                    <span className="pointer-events-none absolute right-11 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-30">
                        {vote} Suara
                    </span>
                </button>
            </div>
        </div>
    );
}
