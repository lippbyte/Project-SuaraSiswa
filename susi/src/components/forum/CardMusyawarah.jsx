import { memo, useMemo } from "react";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { FiArrowUpRight, FiTrash2 } from "react-icons/fi";

const CardMusyawarah = memo(({ card, onClick, onDelete, user }) => {
    // 3 butir agenda bersih dari card.agenda atau inisiatif musyawarah
    const agendaItems = useMemo(() => {
        if (Array.isArray(card.agenda) && card.agenda.length > 0) {
            return card.agenda.slice(0, 3);
        }
        return [
            "Pengajuan Inisiatif & Pembahasan Bersama",
            "Konsensus Aspirasi & Suara Siswa",
            "Penetapan Rekomendasi Terbuka"
        ];
    }, [card.agenda]);

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-[#2C2C2A]/10 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(142,68,173,0.18)] hover:border-[#8E44AD]/40 transition-all duration-300 cursor-pointer overflow-hidden min-h-[250px] h-full"
        >
            {/* Top Cutout / Star Badge Bar */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 bg-[#8E44AD] text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-xs">
                    <span className="text-amber-300 text-xs">✦</span>
                    <span className="text-[11px] uppercase tracking-wider">Musyawarah</span>
                </div>

                <div className="flex items-center gap-2.5">
                    {user && user.role === "admin" && (
                        <button
                            type="button"
                            onClick={onDelete}
                            title="Hapus musyawarah"
                            className="p-1 rounded-full text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <FiTrash2 className="text-sm" />
                        </button>
                    )}
                    <span className="text-[11px] font-bold text-[#8E44AD] tracking-wider uppercase">
                        {card.category || "Umum"}
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2C2C2A] text-white flex items-center justify-center text-xs group-hover:bg-[#8E44AD] group-hover:scale-105 transition-all shadow-sm">
                        <FiArrowUpRight className="text-sm" />
                    </div>
                </div>
            </div>

            {/* Title & Headline */}
            <div className="mt-3 mb-2">
                <h3 className="text-base sm:text-lg font-bold text-[#2C2C2A] group-hover:text-[#8E44AD] transition-colors line-clamp-1 leading-snug">
                    {card.title}
                </h3>
                <p className="text-xs text-[#6B6B68] line-clamp-1 mt-0.5 font-normal">
                    {card.text}
                </p>
            </div>

            {/* Clean Numbered List (Directly Matching Ref Image 1: 01/ 02/ 03/ with hairlines) */}
            <div className="my-2 divide-y divide-black/5">
                {agendaItems.map((item, idx) => (
                    <div
                        key={idx}
                        className="flex items-center justify-between py-1.5 text-xs"
                    >
                        <span className="font-mono font-bold text-[#8E44AD] text-[11px] mr-2.5 shrink-0">
                            0{idx + 1}/
                        </span>
                        <span className="text-[#2C2C2A] font-medium truncate flex-1 text-[11px] sm:text-xs">
                            {item}
                        </span>
                    </div>
                ))}
            </div>

            {/* Bottom: Inisiator & Clean Suara Text */}
            <div className="border-t border-black/5 pt-3.5 mt-auto flex items-center justify-between gap-3 text-xs text-[#6B6B68]">
                <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[#8E44AD] text-xs">✦</span>
                    <span className="font-semibold text-[#2C2C2A] truncate max-w-[130px] sm:max-w-[160px]">
                        {card.sender}
                    </span>
                    {card.class && (
                        <span className="text-[11px] text-[#8C8C88] truncate hidden sm:inline">
                            · {card.class}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 font-bold text-[#8E44AD] text-[11px] shrink-0">
                    <FaRegArrowAltCircleUp className="text-xs" />
                    <span>{card.vote} suara</span>
                </div>
            </div>
        </div>
    );
});

CardMusyawarah.displayName = "CardMusyawarah";

export default CardMusyawarah;
