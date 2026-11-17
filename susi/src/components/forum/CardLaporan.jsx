import { memo } from "react";
import { FaRegArrowAltCircleUp, FaRegClock, FaMapMarkerAlt } from "react-icons/fa";
import { FiArrowUpRight, FiTrash2 } from "react-icons/fi";

const CardLaporan = memo(({ card, onClick, onDelete, user }) => {
    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col justify-between p-6 rounded-2xl bg-white border border-[#2C2C2A]/10 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_28px_-6px_rgba(242,87,36,0.18)] hover:border-[#F25724]/40 transition-all duration-300 cursor-pointer overflow-hidden min-h-[250px] h-full"
        >
            {/* Top Bar: Clean Urgency Label & Action Buttons */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#F25724] tracking-wider uppercase">
                    {/* <span className="text-xs">⚠️</span> */}
                    <span>Laporan Fasilitas</span>
                </div>

                <div className="flex items-center gap-2.5">
                    {user && user.role === "admin" && (
                        <button
                            type="button"
                            onClick={onDelete}
                            title="Hapus laporan"
                            className="p-1 rounded-full text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                            <FiTrash2 className="text-sm" />
                        </button>
                    )}
                    <span className="text-[11px] font-bold text-[#6B6B68] tracking-wider uppercase">
                        {card.category || "Fasilitas"}
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#2C2C2A] text-white flex items-center justify-center text-xs group-hover:bg-[#F25724] group-hover:scale-105 transition-all shadow-sm">
                        <FiArrowUpRight className="text-sm" />
                    </div>
                </div>
            </div>

            {/* Middle: Title, Description & Clean Inline Metadata (No Heavy Capsule Pills) */}
            <div className="my-3 flex-1 flex flex-col justify-center">
                <h3 className="text-base sm:text-lg font-bold text-[#2C2C2A] group-hover:text-[#F25724] transition-colors line-clamp-1 leading-snug">
                    {card.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6B6B68] line-clamp-2 leading-relaxed mt-1 font-normal">
                    {card.text}
                </p>

                {/* Clean Inline Metadata: Lokasi & Waktu */}
                <div className="flex items-center gap-3 text-xs text-[#6B6B68] mt-2.5">
                    <div className="flex items-center gap-1">
                        <FaMapMarkerAlt className="text-[#F25724] text-[11px]" />
                        <span className="font-medium text-[#2C2C2A]">{card.class || "Area Sekolah"}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                        <FaRegClock className="text-[#8C8C88] text-[11px]" />
                        <span>{card.time || "Hari ini"}</span>
                    </div>
                </div>

                {card.image && (
                    <div className="mt-2.5 rounded-xl overflow-hidden h-20 w-full border border-black/10 bg-neutral-100 relative group/img">
                        <img
                            src={card.image}
                            alt="Bukti Laporan"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-1 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded-md font-semibold">
                            Foto Bukti
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom: Pelapor & Dukungan Clean Text */}
            <div className="border-t border-black/5 pt-3.5 mt-auto flex items-center justify-between gap-3 text-xs text-[#6B6B68]">
                <div className="flex items-center gap-1.5 truncate">
                    <span className="text-[11px] text-[#8C8C88]">Pelapor:</span>
                    <span className="font-semibold text-[#2C2C2A] truncate max-w-[120px] sm:max-w-[150px]">
                        {card.sender}
                    </span>
                </div>

                <div className="flex items-center gap-1 font-bold text-[#F25724] text-[11px] shrink-0">
                    <FaRegArrowAltCircleUp className="text-xs" />
                    <span>{card.vote} dukungan</span>
                </div>
            </div>
        </div>
    );
});

CardLaporan.displayName = "CardLaporan";

export default CardLaporan;
