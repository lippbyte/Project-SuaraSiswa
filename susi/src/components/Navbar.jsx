import { MdClose } from "react-icons/md";
import { BiLogOut } from "react-icons/bi";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import Login from './Login';

function switchPage(setPage, setShowLogin, pageString) {
    setShowLogin(false);
    if (typeof setPage === 'function') {
        setPage(pageString);
    }
}

export default function Navbar({ showLogin, setShowLogin, setPageFunc, user, setUser }) {
    const location = useLocation();
    const pathname = location.pathname;

    const isMading = pathname === '/' || pathname === '/mading';
    const isForum = pathname === '/forum' || ['diskusi', 'musyawarah', 'demos', 'laporan'].some(t => pathname.startsWith('/' + t));
    const isKirim = pathname === '/kirim' || pathname === '/form';
    const isAdmin = pathname === '/admin' || pathname === '/admin_dashboard';

    const handleLogout = () => {
        setUser(null);
        setShowLogin(false);
    };

    const handleLoginClick = () => {
        setShowLogin(prev => !prev);
    };

    return (
        <div className="fixed top-0 left-0 w-full z-[100] p-3 sm:p-4 md:px-8 md:pt-6 pointer-events-none flex flex-col gap-4">
            <div className="flex items-center justify-between relative">
                {/* Left: Brand Initial Pill (SS - Suara Siswa) */}
                <button
                    onClick={() => switchPage(setPageFunc, setShowLogin, '/mading')}
                    title="Suara Siswa - Kembali ke Mading"
                    className="pointer-events-auto h-9 md:h-10 px-3.5 sm:px-4 bg-[#ebebeb]/95 backdrop-blur-md text-[#1a1a1a] font-bold text-sm md:text-base tracking-tight rounded-full shadow-sm flex items-center justify-center hover:bg-[#dfdfdf] active:scale-95 transition-all cursor-pointer select-none border border-dark/15"
                >
                    SUSI
                </button>

                {/* Center: Navigation Links Pill */}
                <div className="pointer-events-auto md:absolute md:left-1/2 md:-translate-x-1/2 h-9 md:h-10 px-4 sm:px-6 md:px-8 bg-[#ebebeb]/95 backdrop-blur-md rounded-full border shadow-sm flex items-center gap-4 sm:gap-6 md:gap-7 select-none whitespace-nowrap border-dark/15">
                    <button
                        onClick={() => switchPage(setPageFunc, setShowLogin, '/mading')}
                        className={`text-xs md:text-sm tracking-tight cursor-pointer transition-colors ${
                            isMading
                                ? 'font-bold text-[#1a1a1a]'
                                : 'font-medium text-neutral-600 hover:text-[#1a1a1a]'
                        }`}
                    >
                        Mading
                    </button>
                    <button
                        onClick={() => switchPage(setPageFunc, setShowLogin, '/forum')}
                        className={`text-xs md:text-sm tracking-tight cursor-pointer transition-colors ${
                            isForum
                                ? 'font-bold text-[#1a1a1a]'
                                : 'font-medium text-neutral-600 hover:text-[#1a1a1a]'
                        }`}
                    >
                        Forum
                    </button>
                    <button
                        onClick={() => switchPage(setPageFunc, setShowLogin, '/kirim')}
                        className={`text-xs md:text-sm tracking-tight cursor-pointer transition-colors ${
                            isKirim
                                ? 'font-bold text-[#1a1a1a]'
                                : 'font-medium text-neutral-600 hover:text-[#1a1a1a]'
                        }`}
                    >
                        Kirim
                    </button>
                    {user && user.role === 'admin' && (
                        <button
                            onClick={() => switchPage(setPageFunc, setShowLogin, '/admin')}
                            className={`text-xs md:text-sm tracking-tight cursor-pointer transition-colors ${
                                isAdmin
                                    ? 'font-bold text-[#b58319]'
                                    : 'font-medium text-[#b58319]/80 hover:text-[#b58319]'
                            }`}
                        >
                            Dashboard
                        </button>
                    )}
                </div>

                {/* Right: Action Pill Button (Login / Logout) */}
                <div className="pointer-events-auto flex items-center gap-2">
                    {user ? (
                        <>
                            <span className="hidden sm:inline-flex h-9 md:h-10 px-3.5 sm:px-4 bg-[#ebebeb]/95 backdrop-blur-md text-[#1a1a1a] font-medium text-xs md:text-sm rounded-full border shadow-sm items-center select-none truncate max-w-[120px] md:max-w-[150px] border-light/15">
                                {user.role === 'admin' ? (
                                    <span className="text-[#a37920] font-bold">Admin</span>
                                ) : (
                                    <span className="truncate">Halo, {user.name}</span>
                                )}
                            </span>
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                className="h-9 md:h-10 px-4 sm:px-5 bg-[#1a1a1a] text-white text-xs md:text-sm font-medium rounded-full shadow-xs hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                            >
                                <BiLogOut className="text-sm md:text-base" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={handleLoginClick}
                            title={showLogin ? 'Tutup' : 'Login'}
                            className="h-9 md:h-10 px-4 sm:px-6 bg-[#1a1a1a] text-white text-xs md:text-sm font-medium rounded-full shadow-xs hover:bg-neutral-800 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                            {showLogin ? (
                                <>
                                    <MdClose className="text-base" />
                                    <span>Tutup</span>
                                </>
                            ) : (
                                <span>Login</span>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Login Modal dengan Animasi In/Out Motion.dev */}
            <AnimatePresence>
                {showLogin && (
                    <Login setUser={setUser} setShowLogin={setShowLogin} />
                )}
            </AnimatePresence>
        </div>
    );
}