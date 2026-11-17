import { useMediaQuery } from "usehooks-ts";
import { FaRegArrowAltCircleUp, FaUser } from "react-icons/fa";
import { FiArrowUpRight, FiImage } from "react-icons/fi";
import Pin from "./Pin";

export default function Card({ card, setPageFunc, setCardData }) {
    const { type, title, text, sender, vote, image } = card;

    const isMedium = useMediaQuery("(min-width: 768px)");
    const isLarge = useMediaQuery("(min-width: 1024px)");

    // Warna tema kartu sesuai tipe aspirasi (Tingkat kecerahan & vibransi diselaraskan dengan News.jsx #F25724)
    const bgColors = {
        diskusi: "#1E9A68",
        laporan: "#F25724",
        musyawarah: "#8E44AD",
        demos: "#F59E0B"
    };
    const bgColor = bgColors[type] || "#1E9A68";

    // Sistem pemilihan font acak tapi stabil berbasis ID kartu
    // Separuh kartu menggunakan Plus Jakarta Sans (--font-sans), separuh menggunakan Space Grotesk (--font-alt)
    const cardId = Number(card.id) || 1;
    const isAltFont = cardId % 2 === 0;
    const fontClass = isAltFont
        ? "font-[family-name:var(--font-alt)]"
        : "font-[family-name:var(--font-sans)]";

    // Sudut rotasi deterministik dan stabil
    const rotation = ((cardId * 7) % 9) - 4; // Rentang -4deg s.d. +4deg
    const photoRotation = -rotation * 1.5 + (cardId % 2 === 0 ? 5 : -5);

    const aligns = ["flex-start", "center", "flex-end"];
    const randomAlign = aligns[cardId % aligns.length];

    // Ukuran kartu proporsional dengan vote scaling halus
    const baseWidth = isLarge ? 360 : isMedium ? 290 : 230;
    const width = baseWidth * Math.min(1 + (vote / 150), 1.25);

    const handleOpenCard = (e) => {
        if (e) e.stopPropagation();
        if (typeof setCardData === "function") setCardData(card);
        if (typeof setPageFunc === "function") {
            setPageFunc(`/${type}/${card.id}`, card);
        }
    };

    const btnCircle =
        "w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1e1e1e] hover:bg-black active:scale-95 text-white/90 border border-white/15 flex items-center justify-center shadow-xl transition-all cursor-pointer relative group/btn";

    return (
        <div
            style={{
                alignSelf: randomAlign,
                rotate: `${rotation}deg`,
                width: `${width}px`
            }}
            className="card-container group relative pr-12 my-3 select-none"
        >
            {/* Konten Utama 1: Kertas Teks Aspirasi */}
            <div
                style={{ backgroundColor: bgColor }}
                className={`w-full relative flex flex-col justify-between rounded-2xl shadow-xl p-4 sm:p-5 text-light group-hover:scale-[1.03] group-hover:shadow-2xl transition-all duration-200 border-2 border-white/15 min-h-[220px] sm:min-h-[250px] overflow-visible ${fontClass}`}
            >
                {/* Judul & Teks Preview */}
                <div className={`flex flex-col gap-1.5 relative z-0 ${image ? "pr-14 sm:pr-20" : ""}`}>
                    <h2 className="font-bold text-base sm:text-xl lg:text-2xl leading-snug tracking-tight text-white line-clamp-2">
                        {title}
                    </h2>

                    <p className="text-light/80 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {text}
                    </p>
                </div>

                {/* Bagian Bawah Kertas Teks: Pengirim & Perolehan Suara */}
                <div className="flex justify-between items-center pt-2.5 border-t border-white/15 text-xs font-bold relative z-0">
                    <div className="flex items-center gap-1.5 truncate max-w-[140px] sm:max-w-[180px]">
                        <FaUser className="text-[11px] opacity-80 shrink-0" />
                        <span className="truncate capitalize text-light">{sender}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/25 px-2.5 py-1 rounded-lg border border-white/15">
                        <FaRegArrowAltCircleUp className="text-xs text-amber-300" />
                        <span className="text-light">{vote}</span>
                    </div>
                </div>

                {/* Konten Utama 2: Foto Menimpa Kertas Teks (Jika Ada Gambar) */}
                {image && (
                    <div
                        style={{ rotate: `${photoRotation}deg` }}
                        className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 w-28 sm:w-36 aspect-square p-1.5 bg-white rounded-xl shadow-xl border border-black/10 z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-0"
                    >
                        {/* Potongan Selotip Bening (Washi Tape Effect) */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 sm:w-10 h-3 bg-white/75 border border-white/50 shadow-xs rotate-[-3deg] rounded-xs pointer-events-none"></div>

                        <div className="w-full h-full overflow-hidden rounded-lg bg-neutral-900 relative">
                            <img
                                src={image}
                                alt={title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-black/75 text-[9px] text-white flex items-center gap-0.5">
                                <FiImage className="text-[8px]" />
                                <span>Foto</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pin Mading */}
                <div className="absolute -top-2.5 -right-2.5 z-20 scale-110 pointer-events-none">
                    <Pin />
                </div>
            </div>

            {/* Toolbar Tombol CTA Vertikal di Kanan (Hover-Reveal Tanpa Jeda/Gap) */}
            <div className="absolute right-0 top-6 flex flex-col gap-2.5 z-30 invisible opacity-0 translate-x-1 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
                {/* CTA 1: Buka Pembahasan */}
                <button
                    onClick={handleOpenCard}
                    className={btnCircle}
                    aria-label="Buka pembahasan"
                >
                    <FiArrowUpRight className="text-base sm:text-lg text-amber-300" />
                    <span className="pointer-events-none absolute right-11 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-40">
                        Buka Pembahasan
                    </span>
                </button>

                {/* CTA 2: Indikator Suara */}
                <button
                    onClick={handleOpenCard}
                    className={btnCircle}
                    aria-label="Suara / Vote"
                >
                    <FaRegArrowAltCircleUp className="text-sm sm:text-base text-white" />
                    <span className="pointer-events-none absolute right-11 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-40">
                        {vote} Suara
                    </span>
                </button>
            </div>
        </div>
    );
}
