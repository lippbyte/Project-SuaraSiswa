import { useRef, useState, useEffect, useMemo } from "react";
import { motion as Motion } from "motion/react";
import Card from "../components/Card";
import Polaroid from "../components/Polaroid";
import News from "../components/News";
import Book from "../components/Book";

function InstructionPill() {
    return (
        <div className="px-4 py-2 text-sm text-dark bg-light-100/80 border border-dark/15 rounded-2xl shadow-sm">
            Drag Untuk Melihat
        </div>
    );
}

export default function Mading({ allData = [], setPageFunc, transitionTo, setCardData }) {
    const canvasRef = useRef(null);
    const navFunc = transitionTo || setPageFunc;

    // Hitung posisi awal dan batasan drag berdasarkan viewport & canvas
    const [bounds, setBounds] = useState(() => {
        if (typeof window === "undefined") {
            return {
                initial: { x: -500, y: -500 },
                constraints: { left: -1000, right: 0, top: -1000, bottom: 0 }
            };
        }
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const isLg = vw >= 1024;
        const isMd = vw >= 768;
        const isSm = vw >= 640;

        // Dimensi proporsional: mobile membutuhkan vertikal yang jauh lebih panjang (4.2x) karena kolom lebih sedikit
        const canvasW = isLg ? vw * 1.25 : isMd ? vw * 1.5 : isSm ? vw * 1.9 : vw * 2.4;
        const canvasH = isLg ? vh * 2.6 : isMd ? vh * 3.0 : isSm ? vh * 3.5 : vh * 4.2;

        return {
            initial: {
                x: -(canvasW / 2 - vw / 2),
                y: -(canvasH / 2 - vh / 2)
            },
            constraints: {
                left: -(canvasW - vw),
                right: 0,
                top: -(canvasH - vh),
                bottom: 0
            }
        };
    });

    useEffect(() => {
        const updateBounds = () => {
            if (!canvasRef.current) return;
            // Gunakan scrollWidth/scrollHeight agar selalu mencakup seluruh kartu tanpa terpotong
            const canvasW = Math.max(canvasRef.current.offsetWidth, canvasRef.current.scrollWidth);
            const canvasH = Math.max(canvasRef.current.offsetHeight, canvasRef.current.scrollHeight);
            const vw = window.innerWidth;
            const vh = window.innerHeight;

            setBounds({
                initial: {
                    x: -(canvasW / 2 - vw / 2),
                    y: -(canvasH / 2 - vh / 2)
                },
                constraints: {
                    left: -(canvasW - vw),
                    right: 0,
                    top: -(canvasH - vh),
                    bottom: 0
                }
            });
        };

        updateBounds();
        window.addEventListener("resize", updateBounds);
        return () => window.removeEventListener("resize", updateBounds);
    }, []);

    const sortedCards = useMemo(() => {
        const descCards = [...allData].sort((a, b) => b.vote - a.vote);
        const result = [];
        descCards.forEach((card, index) => {
            if (index % 2 === 0) {
                result.push(card);
            } else {
                result.unshift(card);
            }
        });
        return result;
    }, [allData]);

    return (
        <div className="w-full h-svh overflow-hidden relative bg-light">
            <Motion.div
                ref={canvasRef}
                id="mading-container"
                drag
                dragConstraints={bounds.constraints}
                dragElastic={0.04}
                dragMomentum={true}
                dragTransition={{
                    power: 0.1,
                    timeConstant: 200,
                    bounceStiffness: 400,
                    bounceDamping: 40
                }}
                initial={bounds.initial}
                style={{
                    backgroundImage: `linear-gradient(to right, #cccccc 1px, transparent 1px), linear-gradient(to bottom, #cccccc 1px, transparent 1px)`,
                    backgroundSize: "40px 40px"
                }}
                className="page-container w-[240svw] sm:w-[190svw] md:w-[150svw] lg:w-[125svw] min-h-[420svh] sm:min-h-[350svh] md:min-h-[300svh] lg:min-h-[260svh] p-8 sm:p-12 md:p-16 lg:p-20 bg-light flex flex-col justify-center items-center cursor-grab active:cursor-grabbing will-change-transform"
            >
                <div className="w-full max-w-[95%] flex flex-wrap justify-center items-center gap-6 sm:gap-8 lg:gap-10 text-xs md:text-lg py-12">
                    {sortedCards.slice(0, 8).map((card, index) => {
                        // Variasi acak tapi stabil berbasis ID kartu (~35% Book, ~65% Card)
                        const isBook = (Number(card.id) + index) % 3 === 0;
                        return isBook ? (
                            <Book key={card.id} card={card} setPageFunc={navFunc} setCardData={setCardData} />
                        ) : (
                            <Card key={card.id} card={card} setPageFunc={navFunc} setCardData={setCardData} />
                        );
                    })}
                    <Polaroid />
                    <News setPageFunc={navFunc} />
                </div>
            </Motion.div>
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none select-none">
                <InstructionPill />
            </div>
        </div>
    );
}
