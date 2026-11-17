import { memo } from "react";
import { FaRegClock } from "react-icons/fa";
import { FiArrowUpRight, FiTrash2 } from "react-icons/fi";

const CardDemos = memo(({ card, onClick, onDelete, user }) => {
    const avatarInitials = ["A", "B", "C"];
    const avatarColors = ["bg-[#FDE68A] text-[#92400E]", "bg-[#A7F3D0] text-[#065F46]", "bg-[#FECDD3] text-[#9F1239]"];

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-[#2C2C2A]/10 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(245,158,11,0.20)] hover:border-[#F59E0B]/40 transition-all duration-300 cursor-pointer overflow-hidden min-h-[250px] h-full"
        >
            {/* Top Bar: Clean Tag & Contributor Avatar Stack */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#D97706] tracking-wider uppercase">
                    {/* <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]"></span> */}
                    <span>Demos · {card.category || "Karya"}</span>
                </div>

                <div className="flex items-center gap-2">
                    {user && user.role === "admin" && (
                        <button
                            type="button"
                            onClick={onDelete}
                            title="Hapus demos"
                            className="p-1 rounded-full text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <FiTrash2 className="text-sm" />
                        </button>
                    )}

                    {/* Stack of Circular Avatars + Subtle Counter */}
                    <div className="flex items-center -space-x-1.5 pl-1">
                        {avatarInitials.map((init, i) => (
                            <div
                                key={i}
                                className={`w-5 h-5 rounded-full border border-white flex items-center justify-center font-bold text-[8px] select-none ${avatarColors[i]}`}
                            >
                                {init}
                            </div>
                        ))}
                        <span className="text-[10px] font-bold text-[#D97706] pl-1.5 select-none">
                            +{card.vote || 0}
                        </span>
                    </div>

                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2C2C2A] text-white flex items-center justify-center text-xs group-hover:bg-[#F59E0B] group-hover:scale-105 transition-all shadow-sm ml-1">
                        <FiArrowUpRight className="text-sm" />
                    </div>
                </div>
            </div>

            {/* Middle: Title, Description & Optional Image */}
            <div className="my-3 flex-1 flex flex-col justify-center">
                <h3 className="text-base sm:text-lg font-bold text-[#2C2C2A] group-hover:text-[#D97706] transition-colors line-clamp-2 leading-snug">
                    {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B68] line-clamp-2 leading-relaxed mt-1.5 font-normal">
                    {card.text}
                </p>

                {card.image && (
                    <div className="mt-2.5 rounded-xl overflow-hidden h-24 w-full border border-black/10 bg-neutral-100">
                        <img
                            src={card.image}
                            alt={card.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>
                )}
            </div>

            {/* Bottom: Clean Breadcrumb (Ref Image 2: Courses • Online • Education) */}
            <div className="border-t border-black/5 pt-3.5 mt-auto flex items-center justify-between gap-3 text-xs text-[#6B6B68]">
                <div className="flex items-center gap-1.5 truncate text-[11px] font-medium text-[#6B6B68]">
                    <span className="capitalize">{card.category || "Inisiatif"}</span>
                    <span>•</span>
                    <span>Demos</span>
                    <span>•</span>
                    <span className="truncate max-w-[100px] sm:max-w-[130px] text-[#2C2C2A] font-semibold">
                        {card.sender}
                    </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-[#8C8C88] shrink-0">
                    <FaRegClock className="text-[10px]" />
                    <span>{card.time || "Hari ini"}</span>
                </div>
            </div>
        </div>
    );
});

CardDemos.displayName = "CardDemos";

export default CardDemos;
