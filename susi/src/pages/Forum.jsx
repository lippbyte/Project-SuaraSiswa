import { useState, useMemo } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ForumCard from "../components/forum/ForumCard";

export default function Forum({ allData = [], setPageFunc, setCardData, user }) {
    const [categoryActive, setCategoryActive] = useState("semua");

    const filteredAndSortedData = useMemo(() => {
        let data = allData;
        if (categoryActive !== "semua") {
            data = allData.filter((card) => card.category === categoryActive);
        }
        return [...data].sort((a, b) => b.vote - a.vote);
    }, [allData, categoryActive]);

    const categories = useMemo(() => {
        return [...new Set(allData.map((card) => card.category).filter(Boolean))];
    }, [allData]);

    useGSAP(() => {
        gsap.from(".forum-card-container", {
            y: 25,
            opacity: 0,
            stagger: 0.04,
            duration: 0.45,
            ease: "power2.out",
            overwrite: "auto"
        });
    }, [filteredAndSortedData]);

    return (
        <div
            id="forum-container"
            className="page-container w-full min-h-svh bg-light pt-20 md:pt-24 lg:pt-26 pl-4 pr-4 lg:pl-12 lg:pr-12 pb-16 flex flex-col gap-6 md:gap-8 scrollbar-minimal text-xs md:text-sm overflow-x-hidden"
        >
            {/* Header Section Terpadu & Minimalis */}
            <div className="detail-container flex flex-col gap-3 max-w-4xl">
                {/* Upper Tag */}
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8B7355] self-start tracking-wider uppercase">
                    <span className="text-[#8B7355] text-xs">✦</span>
                    <span className="text-[11px] font-bold">
                        Forum Aspirasi Online · SuaraSiswa
                    </span>
                </div>

                {/* Main Title & Subtitle */}
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#2C2C2A] font-[family-name:var(--font-sans)]">
                        Forum Diskusi.
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-[#6B6B68] leading-relaxed max-w-2xl font-normal">
                        Ruang musyawarah dan keterbukaan suara siswa. Sampaikan gagasan, pantau tindak lanjut laporan fasilitas, dan dukung inisiatif bersama secara transparan.
                    </p>
                </div>

                {/* Clean Filter Tabs & Counter */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex overflow-x-auto scrollbar-minimal gap-1.5 pb-1 sm:pb-0">
                        <button
                            type="button"
                            onClick={() => setCategoryActive("semua")}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                categoryActive === "semua"
                                    ? "bg-[#2C2C2A] text-white shadow-xs"
                                    : "bg-white/80 hover:bg-white text-[#6B6B68] hover:text-[#2C2C2A] border border-black/5"
                            }`}
                        >
                            Semua
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setCategoryActive(category)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                                    categoryActive === category
                                        ? "bg-[#2C2C2A] text-white shadow-xs"
                                        : "bg-white/80 hover:bg-white text-[#6B6B68] hover:text-[#2C2C2A] border border-black/5"
                                }}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Kartu Forum: 3 Kolom di Layar Desktop (lg:grid-cols-3) */}
            {filteredAndSortedData.length > 0 ? (
                <div className="card-scroll-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
                    {filteredAndSortedData.map((card) => (
                        <ForumCard
                            card={card}
                            key={card.id}
                            setPageFunc={setPageFunc}
                            setCardData={setCardData}
                            user={user}
                        />
                    ))}
                </div>
            ) : (
                <div className="w-full py-16 flex flex-col items-center justify-center text-center bg-white/60 border border-black/10 rounded-2xl p-6">
                    <span className="text-3xl mb-2">📋</span>
                    <h3 className="font-bold text-[#2C2C2A] text-base">Belum Ada Aspirasi</h3>
                    <p className="text-xs text-[#6B6B68] mt-1 max-w-sm">
                        Belum ada aspirasi terdaftar untuk kategori ini. Jadilah yang pertama menyuarakan aspirasi!
                    </p>
                </div>
            )}
        </div>
    );
}
