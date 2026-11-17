import { useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

const LayeredWaveTransition = forwardRef(function LayeredWaveTransition(
    { setIsTransitioning },
    ref
) {
    const navigate = useNavigate();
    const [active, setActive] = useState(false);

    const containerRef = useRef(null);
    const layer1Ref = useRef(null); // Crimson (#C0392B - Laporan)
    const layer2Ref = useRef(null); // Plum Purple (#6B3F72 - Musyawarah)
    const layer3Ref = useRef(null); // Sage Green (#5C7A6B - Diskusi)
    const layer4Ref = useRef(null); // Golden Amber (#D4A843 - Demos)
    const textRef = useRef(null);

    useImperativeHandle(ref, () => ({
        trigger: (targetPath) => {
            if (!containerRef.current) {
                navigate(targetPath);
                return;
            }

            setActive(true);
            if (typeof setIsTransitioning === 'function') {
                setIsTransitioning(true);
            }

            const layers = [
                layer1Ref.current,
                layer2Ref.current,
                layer3Ref.current,
                layer4Ref.current
            ];

            // Reset initial positions to bottom off-screen
            gsap.set(containerRef.current, { display: 'block', pointerEvents: 'auto' });
            gsap.set(layers, { y: '120%' });
            gsap.set(textRef.current, { opacity: 0, scale: 0.92 });

            const tl = gsap.timeline({
                onComplete: () => {
                    gsap.set(containerRef.current, { display: 'none', pointerEvents: 'none' });
                    gsap.set(layers, { y: '120%' });
                    setActive(false);
                    if (typeof setIsTransitioning === 'function') {
                        setIsTransitioning(false);
                    }
                }
            });

            // Fase 1: Gelombang 4 warna kategori naik santai menutup layar (Cover Phase)
            tl.to(layers, {
                y: '0%',
                duration: 0.65,
                ease: 'power2.inOut',
                stagger: 0.09
            })
            // Teks branding muncul di lapisan gold saat layar tertutup penuh
            .to(
                textRef.current,
                {
                    opacity: 1,
                    scale: 1,
                    duration: 0.28,
                    ease: 'power2.out'
                },
                '-=0.25'
            )
            // Di puncak penutupan layar: Ganti rute di balik tirai
            .add(() => {
                navigate(targetPath);
                window.scrollTo({ top: 0, behavior: 'instant' });
            })
            // Jeda santai di tengah (Hold Phase) agar branding terbaca jelas dan render selesai
            .to({}, { duration: 0.22 })
            // Teks memudar keluar
            .to(textRef.current, {
                opacity: 0,
                scale: 0.96,
                duration: 0.2,
                ease: 'power2.in'
            })
            // Fase 2: Gelombang meluncur ke atas mengungkap halaman baru (Reveal Phase)
            .to(layers, {
                y: '-120%',
                duration: 0.65,
                ease: 'power2.inOut',
                stagger: 0.09
            }, '-=0.1');
        }
    }), [navigate, setIsTransitioning]);

    const layerStyle =
        'absolute w-[180vw] h-[175vh] -left-[40vw] -top-[37.5vh] rounded-[100%] will-change-transform pointer-events-none shadow-2xl';

    return (
        <div
            ref={containerRef}
            style={{ display: active ? 'block' : 'none' }}
            className="fixed inset-0 z-[9999] overflow-hidden pointer-events-none select-none"
            aria-hidden="true"
        >
            {/* Lapisan 1: Vermilion Orange (Laporan - Leading Crest ala News.jsx) */}
            <div
                ref={layer1Ref}
                style={{ backgroundColor: '#F25724' }}
                className={layerStyle}
            />

            {/* Lapisan 2: Vibrant Violet (Musyawarah) */}
            <div
                ref={layer2Ref}
                style={{ backgroundColor: '#8E44AD' }}
                className={layerStyle}
            />

            {/* Lapisan 3: Vibrant Emerald (Diskusi) */}
            <div
                ref={layer3Ref}
                style={{ backgroundColor: '#1E9A68' }}
                className={layerStyle}
            />

            {/* Lapisan 4: Warm Amber Gold (Demos - Fullscreen Base Layer) */}
            <div
                ref={layer4Ref}
                style={{ backgroundColor: '#F59E0B' }}
                className={layerStyle}
            />

            {/* Konten Teks Branding Tengah Saat Layar Tertutup Penuh */}
            <div
                ref={textRef}
                className="absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none z-10"
            >
                <h1 className="font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-tight text-[#1a1a1a] uppercase drop-shadow-xs font-[family-name:var(--font-sans)]">
                    Suara Siswa
                </h1>
                <p className="text-xs sm:text-sm font-bold tracking-widest text-[#1a1a1a]/75 uppercase mt-2">
                    Aspirasi & Karya Siswa
                </p>
            </div>
        </div>
    );
});

export default LayeredWaveTransition;
