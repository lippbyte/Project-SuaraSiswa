import { useState } from "react";
import { FiArrowUpRight, FiBookmark, FiImage, FiCheck } from "react-icons/fi";
import Pin from "./Pin";
import dummyjpg from "../assets/images/dummy.jpg";

export default function News({ news, setPageFunc }) {
    const [bookmarked, setBookmarked] = useState(false);

    // Fallback data berita sekolah jika props belum diberikan
    const currentNews = news || {
        id: "news-01",
        frameColor: "#F25724", // Oranye vermilion tebal sesuai referensi poster
        headlinePrefix: "sebuah kabar",
        highlightWord: "aspirasi & karya",
        headlineSuffix: "siswa yang didengar sekolah dan menghasilkan perubahan nyata",
        text: "Pembaruan mingguan seputar program perbaikan fasilitas, kegiatan kolaborasi antarkelas, dan karya terbaik siswa terpilih di mading SuaraSiswa.",
        presentedBy: "Presented by Redaksi SuaraSiswa",
        subText: "(OSIS SMAN 1, DIVISI INFORMASI & MADING)",
        date: "16 Nov 2026",
        image: dummyjpg // Sistem opsional gambar (bisa diisi URL gambar atau null/undefined)
    };

    const {
        frameColor = "#F25724",
        headlinePrefix = "sebuah kabar",
        highlightWord = "aspirasi & karya",
        headlineSuffix = "siswa yang didengar sekolah dan menghasilkan perubahan nyata",
        text,
        presentedBy = "Presented by Redaksi SuaraSiswa",
        subText = "(OSIS SMAN 1, DIVISI INFORMASI & MADING)",
        image
    } = currentNews;

    const handleOpenNews = () => {
        if (typeof setPageFunc === "function") {
            setPageFunc("/forum");
        }
    };

    const handleBookmark = (e) => {
        if (e) e.stopPropagation();
        setBookmarked((prev) => !prev);
    };

    const btnCircle =
        "w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1e1e1e] hover:bg-black active:scale-95 text-white/90 border border-white/15 flex items-center justify-center shadow-lg transition-all cursor-pointer relative group/btn";

    return (
        <div className="card-container group relative pr-12 pb-4 my-3 select-none overflow-visible">
            {/* Bingkai Luar Berwarna Tebal (Bold Frame Sesuai Referensi Gambar) */}
            <div
                style={{ backgroundColor: frameColor }}
                className="w-80 sm:w-96 md:w-[410px] p-5 sm:p-6 md:p-7 rounded-3xl shadow-2xl relative border border-black/10 transition-transform duration-200 group-hover:scale-[1.02] overflow-visible"
            >
                {/* Lembaran Kertas Krem di Bagian Dalam (Ultra-Readable Poster Layout) */}
                <div className="bg-[#ede7da] rounded-xl p-5 sm:p-6 shadow-inner flex flex-col justify-between min-h-[380px] sm:min-h-[420px] relative border border-black/5 overflow-visible">
                    {/* Bagian Headline Utama: Tipografi Kontras Sans-Serif Bold & Serif Italic */}
                    <div className={`flex flex-col gap-3 relative z-0 ${image ? "pr-10 sm:pr-14" : ""}`}>
                        <h2 className="font-extrabold text-2xl sm:text-3xl md:text-[32px] tracking-tight leading-[1.12] text-[#111111] font-[family-name:var(--font-sans)]">
                            {headlinePrefix}
                            {" "}
                            <span className="font-serif italic font-normal text-3xl sm:text-4xl md:text-[38px] text-[#1a1a1a] tracking-normal lowercase">
                                {highlightWord}
                            </span>
                            {" "}
                            {headlineSuffix}
                        </h2>

                        {text && (
                            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed line-clamp-3 mt-1 font-medium">
                                {text}
                            </p>
                        )}
                    </div>

                    {/* Footer Poster Sesuai Referensi Gambar */}
                    <div className="pt-4 border-t border-black/10 flex items-end justify-between text-neutral-800 relative z-0">
                        {/* Info Penerbit / OSIS di Kiri Bawah */}
                        <div className="flex flex-col gap-0.5 max-w-[200px] sm:max-w-[240px]">
                            <p className="font-bold text-[11px] sm:text-xs text-neutral-900 tracking-tight">
                                {presentedBy}
                            </p>
                            <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-wider">
                                {subText}
                            </p>
                        </div>

                        {/* Graphic Badges di Kanan Bawah Sesuai Referensi (3 Bulatan Berwarna) */}
                        <div className="flex items-center gap-1.5 shrink-0 pb-0.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-white border border-black/20 shadow-2xs"></span>
                            <span className="w-3.5 h-3.5 rounded-full bg-[#fcd34d] border border-black/15 shadow-2xs"></span>
                            <span
                                style={{ backgroundColor: frameColor }}
                                className="w-4 h-4 rounded-full border border-black/20 flex items-center justify-center text-[7px] text-white font-bold rotate-12 shadow-2xs"
                            >
                                ★
                            </span>
                        </div>
                    </div>
                </div>

                {/* Konten Opsional: Foto Menimpa Kertas & Bingkai Overlap Keluar Bebas dari Klip */}
                {image && (
                    <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-32 sm:w-40 aspect-square p-1.5 bg-white rounded-xl shadow-2xl border border-black/15 z-30 rotate-[5deg] transition-all duration-300 group-hover:scale-110 group-hover:rotate-0 pointer-events-auto">
                        {/* Potongan Selotip Washi Bening di Atas Foto */}
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-10 sm:w-12 h-3.5 bg-white/80 border border-white/60 shadow-xs rotate-[-3deg] rounded-xs pointer-events-none"></div>

                        <div className="w-full h-full overflow-hidden rounded-lg bg-neutral-900 relative">
                            <img
                                src={image}
                                alt="Foto Berita Sekolah"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-full bg-black/75 text-[9px] text-white flex items-center gap-0.5">
                                <FiImage className="text-[8px]" />
                                <span>Foto</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pin Mading di Sudut Kiri Atas */}
                <div className="absolute top-2 left-2 z-40 scale-110 pointer-events-none">
                    <Pin />
                </div>
            </div>

            {/* Toolbar Tombol CTA Vertikal di Kanan (Hover-Reveal Seragam dengan Card, Book, Polaroid) */}
            <div className="absolute right-0 top-8 flex flex-col gap-2.5 z-30 invisible opacity-0 translate-x-1 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out">
                {/* CTA 1: Buka Berita */}
                <button
                    onClick={handleOpenNews}
                    className={btnCircle}
                    aria-label="Buka forum berita"
                >
                    <FiArrowUpRight className="text-base sm:text-lg text-amber-300" />
                    <span className="pointer-events-none absolute right-11 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-40">
                        Buka Berita
                    </span>
                </button>

                {/* CTA 2: Simpan Kliping Berita */}
                <button
                    onClick={handleBookmark}
                    className={btnCircle}
                    aria-label="Simpan kliping berita"
                >
                    {bookmarked ? (
                        <FiCheck className="text-sm sm:text-base text-green-400" />
                    ) : (
                        <FiBookmark className="text-sm sm:text-base text-white" />
                    )}
                    <span className="pointer-events-none absolute right-11 px-2 py-1 bg-neutral-900 text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity shadow-md z-40">
                        {bookmarked ? "Tersimpan" : "Simpan Berita"}
                    </span>
                </button>
            </div>
        </div>
    );
}
