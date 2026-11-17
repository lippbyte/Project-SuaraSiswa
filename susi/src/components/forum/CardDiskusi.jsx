import { memo } from "react";
import { FaRegArrowAltCircleUp, FaRegCommentDots } from "react-icons/fa";
import { FiArrowUpRight, FiTrash2 } from "react-icons/fi";

const CardDiskusi = memo(({ card, onClick, onDelete, user }) => {
    const repliesCount = Array.isArray(card.replies) ? card.replies.length : 0;
    const initial = card.sender ? card.sender.charAt(0).toUpperCase() : "S";

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-[#2C2C2A]/10 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(30,154,104,0.18)] hover:border-[#1E9A68]/40 transition-all duration-300 cursor-pointer overflow-hidden min-h-[250px] h-full"
        >
            {/* Top Bar: Editorial Quote & Clean Header */}
            <div className="flex items-start justify-between gap-3">
                <span className="text-4xl sm:text-5xl font-serif text-[#1E9A68]/70 leading-none select-none">
                    &ldquo;
                </span>

                <div className="flex items-center gap-2.5">
                    {user && user.role === "admin" && (
                        <button
                            type="button"
                            onClick={onDelete}
                            title="Hapus aspirasi"
                            className="p-1 rounded-full text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <FiTrash2 className="text-sm" />
                        </button>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#1E9A68] tracking-wider uppercase">
                        {/* <span className="w-1.5 h-1.5 rounded-full bg-[#1E9A68]"></span> */}
                        <span>{card.category || "Diskusi"}</span>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2C2C2A] text-white flex items-center justify-center text-xs group-hover:bg-[#1E9A68] group-hover:scale-105 transition-all shadow-sm">
                        <FiArrowUpRight className="text-sm" />
                    </div>
                </div>
            </div>

            {/* Middle: Prominent Editorial Statement */}
            <div className="my-3 flex-1 flex flex-col justify-center">
                <h3 className="text-base sm:text-lg font-bold text-[#2C2C2A] group-hover:text-[#1E9A68] transition-colors line-clamp-2 leading-snug">
                    {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B68] line-clamp-3 leading-relaxed mt-2 font-normal">
                    {card.text}
                </p>
            </div>

            {/* Bottom: Clean Typography-First Metadata (No Heavy Capsules) */}
            <div className="border-t border-black/5 pt-3.5 mt-auto flex items-center justify-between gap-2 text-xs text-[#6B6B68]">
                <div className="flex items-center gap-2 truncate">
                    <div className="w-5 h-5 rounded-full bg-[#1E9A68]/15 text-[#1E9A68] font-bold text-[9px] flex items-center justify-center uppercase shrink-0">
                        {initial}
                    </div>
                    <span className="font-semibold text-[#2C2C2A] truncate max-w-[110px] sm:max-w-[140px]">
                        {card.sender}
                    </span>
                    {card.class && (
                        <span className="text-[11px] text-[#8C8C88] truncate hidden sm:inline">
                            · {card.class}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3 shrink-0 text-[11px]">
                    <div className="flex items-center gap-1 text-[#6B6B68]">
                        <FaRegCommentDots className="text-xs text-[#1E9A68]" />
                        <span>{repliesCount} tanggapan</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[#1E9A68]">
                        <FaRegArrowAltCircleUp className="text-xs" />
                        <span>{card.vote}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

CardDiskusi.displayName = "CardDiskusi";

export default CardDiskusi;
