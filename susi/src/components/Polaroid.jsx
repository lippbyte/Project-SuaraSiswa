import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion as Motion, AnimatePresence } from "motion/react";
import dummyjpg from "../assets/images/dummy.jpg";
import Pin from "./Pin";
import {
    FiHeart,
    FiMaximize2,
    FiDownload,
    FiSliders,
    FiX,
    FiImage
} from "react-icons/fi";

export default function Polaroid() {
    const [liked, setLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(24);
    const [activeFilter, setActiveFilter] = useState("normal");
    const [isZoomed, setIsZoomed] = useState(false);

    useEffect(() => {
        if (!isZoomed) return;
        const handleKeyDown = (e) => {
            if (e.key === "Escape") setIsZoomed(false);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isZoomed]);

    const filterStyles = {
        normal: "none",
        vintage: "sepia(0.45) contrast(1.1) brightness(0.95)",
        bw: "grayscale(1) contrast(1.2)"
    };

    const filterList = [
        { id: "normal", label: "NORMAL" },
        { id: "vintage", label: "VINTAGE" },
        { id: "bw", label: "B&W" }
    ];

    const handleLike = () => {
        if (liked) {
            setLikesCount((prev) => prev - 1);
            setLiked(false);
        } else {
            setLikesCount((prev) => prev + 1);
            setLiked(true);
        }
    };

    const handleCycleFilter = () => {
        const currentIndex = filterList.findIndex((f) => f.id === activeFilter);
        const nextIndex = (currentIndex + 1) % filterList.length;
        setActiveFilter(filterList[nextIndex].id);
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = dummyjpg;
        link.download = `kegiatan_mading_susi_${activeFilter}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const btnCircle =
        "w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1e1e1e] hover:bg-black active:scale-95 text-white/90 border border-white/15 flex items-center justify-center shadow-lg transition-all cursor-pointer relative group/btn";

    return (
        <div className="relative group pr-12 sm:pr-14 my-4 select-none">
            {/* Top Bar Badges (Matching Reference Layout) */}
            <div className="flex items-center justify-between mb-2">
                {/* Top-Left: Dimensions / Metadata Badge */}
                <div className="bg-neutral-800 text-white/80 font-mono text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-md border border-white/10 shadow-sm flex items-center gap-1.5">
                    <span>W 320</span>
                    <span className="opacity-40">|</span>
                    <span>H 395</span>
                </div>

                {/* Top-Right: Preset Filter / Format Selector Pill */}
                <div className="bg-neutral-800 rounded-full border border-white/10 p-0.5 flex items-center gap-1 text-[10px] text-neutral-300 shadow-sm">
                    {filterList.map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setActiveFilter(f.id)}
                            className={`px-2 py-0.5 rounded-full font-medium transition-all cursor-pointer ${
                                activeFilter === f.id
                                    ? "bg-white/20 text-white shadow-xs font-semibold"
                                    : "hover:text-white text-neutral-400"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                    <button
                        onClick={handleCycleFilter}
                        title="Ganti Filter"
                        className="px-1.5 py-0.5 text-neutral-400 hover:text-white cursor-pointer"
                    >
                        <FiSliders className="text-[11px]" />
                    </button>
                </div>
            </div>

            {/* Polaroid Main Card */}
            <div className="p-3 pb-5 flex flex-col gap-3 bg-neutral-100 w-80 sm:w-[340px] rounded-2xl shadow-xl relative border border-neutral-300/60 overflow-hidden">
                {/* Photo with dynamic visual filter */}
                <div className="relative overflow-hidden rounded-xl bg-neutral-900 group/img">
                    <img
                        src={dummyjpg}
                        alt="Dokumentasi Kegiatan"
                        style={{ filter: filterStyles[activeFilter] }}
                        className="aspect-video w-full object-cover transition-all duration-300 group-hover/img:scale-105"
                    />
                    {/* Badge Filter Aktif */}
                    {activeFilter !== "normal" && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-black/75 text-[10px] text-white/90 font-mono uppercase border border-white/10">
                            {activeFilter}
                        </span>
                    )}
                </div>

                {/* Caption Polaroid */}
                <div className="px-1">
                    <p className="text-center text-xs sm:text-sm text-neutral-700 leading-snug">
                        Dokumentasi pembukaan Porseni 2026 — suara aspirasi dan karya siswa SuaraSiswa.
                    </p>
                    <p className="text-center text-[10px] text-neutral-400 mt-1 font-mono">
                        16 Nov 2026 · OSIS SMAN 1
                    </p>
                </div>

                {/* Pin Mading */}
                <div className="absolute -right-2 -top-2 z-10 scale-110 pointer-events-none">
                    <Pin />
                </div>
            </div>

            {/* Right Vertical Action Buttons Column (Hover-Reveal Tanpa Jeda/Gap) */}
            <div className="absolute right-0 top-10 flex flex-col gap-2.5 z-20 invisible opacity-0 translate-x-1 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
                {/* Button 1: Like / Suka */}
                <button
                    onClick={handleLike}
                    className={btnCircle}
                    aria-label="Suka foto"
                >
                    <FiHeart
                        className={`text-sm sm:text-base transition-colors ${
                            liked ? "text-red-500 fill-red-500 scale-110" : "text-white"
                        }`}
                    />
                    <span className="pointer-events-none absolute right-11 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-30">
                        {liked ? `Disukai (${likesCount})` : `Suka (${likesCount})`}
                    </span>
                </button>

                {/* Button 2: Fullscreen / Zoom Preview */}
                <button
                    onClick={() => setIsZoomed(true)}
                    className={btnCircle}
                    aria-label="Perbesar foto"
                >
                    <FiMaximize2 className="text-sm sm:text-base" />
                    <span className="pointer-events-none absolute right-11 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-30">
                        Perbesar Foto
                    </span>
                </button>

                {/* Button 3: Filter Presets */}
                <button
                    onClick={handleCycleFilter}
                    className={btnCircle}
                    aria-label="Ganti filter"
                >
                    <FiSliders className="text-sm sm:text-base" />
                    <span className="pointer-events-none absolute right-11 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-30">
                        Filter: {activeFilter.toUpperCase()}
                    </span>
                </button>

                {/* Button 4: Unduh / Download */}
                <button
                    onClick={handleDownload}
                    className={btnCircle}
                    aria-label="Unduh gambar"
                >
                    <FiDownload className="text-sm sm:text-base" />
                    <span className="pointer-events-none absolute right-11 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-30">
                        Unduh Foto
                    </span>
                </button>
            </div>

            {/* Modal Pratinjau Layar Penuh dengan Animasi In/Out Motion.dev (Portal ke document.body) */}
            {typeof document !== "undefined" && createPortal(
                <AnimatePresence>
                    {isZoomed && (
                        <Motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeOut" }}
                            className="fixed inset-0 z-[9999] pointer-events-auto flex items-center justify-center p-4 sm:p-6 select-none"
                        >
                            {/* Backdrop Blur Overlay yang menangkap seluruh klik background agar konten belakang terhalang */}
                            <div
                                onClick={() => setIsZoomed(false)}
                                className="absolute inset-0 bg-black/85 backdrop-blur-md cursor-pointer pointer-events-auto"
                            />

                            {/* Modal Dialog Card dengan Spring In/Out Motion.dev */}
                            <Motion.div
                                initial={{ opacity: 0, scale: 0.92, y: 18 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92, y: 14 }}
                                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative max-w-4xl w-full max-h-[90vh] bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 flex flex-col gap-3 sm:gap-4 border border-white/10 z-10 pointer-events-auto select-auto"
                            >
                                <div className="flex justify-between items-center text-white pb-3 border-b border-white/10">
                                    <div className="flex items-center gap-2 text-xs sm:text-sm font-mono text-neutral-300">
                                        <FiImage />
                                        <span>kegiatan_porseni_2026.jpg</span>
                                        <span className="text-neutral-500">({activeFilter.toUpperCase()})</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsZoomed(false);
                                        }}
                                        title="Tutup (Esc)"
                                        className="p-1.5 rounded-full hover:bg-white/15 active:scale-95 text-neutral-400 hover:text-white cursor-pointer transition-all shrink-0 z-20 pointer-events-auto"
                                    >
                                        <FiX className="text-xl" />
                                    </button>
                                </div>

                                <div className="flex justify-center items-center bg-black/60 rounded-xl overflow-hidden p-2 flex-1 min-h-0">
                                    <img
                                        src={dummyjpg}
                                        alt="Dokumentasi Fullscreen"
                                        style={{ filter: filterStyles[activeFilter] }}
                                        className="max-h-[68vh] max-w-full w-auto object-contain rounded-lg shadow-2xl"
                                    />
                                </div>

                                <div className="flex justify-between items-center pt-2 text-xs text-neutral-400">
                                    <span>Dokumentasi Porseni — Suara Siswa</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleLike}
                                            className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white rounded-full flex items-center gap-1.5 cursor-pointer transition-all text-xs font-medium"
                                        >
                                            <FiHeart className={liked ? "text-red-500 fill-red-500" : ""} />
                                            <span>{likesCount} Suka</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDownload}
                                            className="px-3.5 py-1.5 bg-white text-black font-medium hover:bg-neutral-200 active:scale-95 rounded-full flex items-center gap-1.5 cursor-pointer transition-all text-xs"
                                        >
                                            <FiDownload />
                                            <span>Unduh</span>
                                        </button>
                                    </div>
                                </div>
                            </Motion.div>
                        </Motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
