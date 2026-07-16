import { useState } from "react";
import { MdOutlineForum, MdDashboard, MdNewspaper } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { BiLogIn, BiLogOut } from "react-icons/bi";
import { MdClose } from "react-icons/md";
import gsap from "gsap";
import Login from './Login';

function switchPage(setPage, setShowLogin, pageString, page) {
    if (pageString === page) return;
    
    const pageEl = document.querySelector('.page-container');
    if (pageEl) {
        pageEl.style.pointerEvents = 'auto';
        gsap.to('.page-container', { filter: 'blur(0px)' });
    }
    setShowLogin(false);
    setPage(pageString);
}

export default function Navbar({ showLogin, setShowLogin, setPageFunc, page, user, setUser }) {
    const handleLogout = () => {
        setUser(null);
        const pageEl = document.querySelector('.page-container');
        if (pageEl) {
            pageEl.style.pointerEvents = 'auto';
            gsap.to('.page-container', { filter: 'blur(0px)' });
        }
        setShowLogin(false);
    };

    const handleResetDb = async () => {
        if (!confirm('Apakah Anda yakin ingin mereset seluruh database ke bawaan awal? Semua data baru/unggah tamu akan dihapus!')) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/admin/reset`, {
                method: 'POST'
            });
            const data = await res.json();
            if (res.ok) {
                alert('Database berhasil direset ke seed data default!');
            } else {
                alert(data.error || 'Gagal mereset database.');
            }
        } catch (err) {
            console.error(err);
            alert('Gagal terhubung ke server.');
        }
    };

    const handleLoginClick = () => {
        const pageEl = document.querySelector('.page-container');
        if (showLogin) {
            if (pageEl) {
                pageEl.style.pointerEvents = 'auto';
                gsap.to('.page-container', { filter: 'blur(0px)' });
            }
            setShowLogin(false);
        } else {
            if (pageEl) {
                pageEl.style.pointerEvents = 'none';
            }
            setShowLogin(true);
        }
    };

    const btnBase = "bg-light p-2 sm:px-4 rounded-xl shadow-sm cursor-pointer hover:bg-neutral-100 active:scale-95 transition-all flex items-center gap-1.5";
    const btnAdmin = "bg-[#d4a843] text-light p-2 sm:px-4 rounded-xl shadow-sm cursor-pointer hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5";

    return (
        <div className="fixed w-full z-100 p-4 lg:pl-12 lg:pr-12 lg:pt-6 flex flex-col gap-4 font-bold">
            <div className="flex justify-between gap-2 items-center">
                {/* Left nav group */}
                <div className="shrink-0 p-2 bg-dark-100/25 backdrop-blur-sm rounded-2xl flex items-center gap-2 shadow-sm text-sm md:text-base">
                    <button className={btnBase} onClick={() => switchPage(setPageFunc, setShowLogin, 'mading', page)}>
                        <MdNewspaper className="text-base md:text-lg" />
                        <span className="hidden sm:inline">Mading</span>
                    </button>
                    <button className={btnBase} onClick={() => switchPage(setPageFunc, setShowLogin, 'forum', page)}>
                        <MdOutlineForum className="text-base md:text-lg" />
                        <span className="hidden sm:inline">Forum</span>
                    </button>
                    <button className={btnBase} onClick={() => switchPage(setPageFunc, setShowLogin, 'form', page)}>
                        <IoMdSend className="text-base md:text-lg" />
                        <span className="hidden sm:inline">Kirim</span>
                    </button>
                    {user && user.role === 'admin' && (
                        <button className={btnAdmin} onClick={() => switchPage(setPageFunc, setShowLogin, 'admin_dashboard', page)}>
                            <MdDashboard className="text-base md:text-lg" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </button>
                    )}
                </div>

                {/* Right login/user group */}
                <div className="shrink-0 p-2 bg-dark-100/25 backdrop-blur-sm rounded-2xl flex items-center gap-2 shadow-sm text-sm md:text-base">
                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <span className="hidden sm:inline font-bold px-1 select-none text-[#d4a843] whitespace-nowrap text-xs md:text-sm">
                                    Halo, Admin
                                </span>
                            ) : (
                                <span className="hidden sm:inline font-bold px-1 select-none text-light whitespace-nowrap text-xs md:text-sm max-w-[140px] truncate">
                                    Halo, {user.name}
                                </span>
                            )}
                            <button
                                className="bg-light text-dark p-2 sm:px-4 rounded-xl shadow-sm cursor-pointer hover:bg-neutral-100 active:scale-95 transition-all flex items-center gap-1.5"
                                onClick={handleLogout}
                                title="Logout"
                            >
                                <BiLogOut className="text-base md:text-lg" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </>
                    ) : (
                        <button
                            className="bg-light text-dark p-2 sm:px-4 rounded-xl shadow-sm cursor-pointer hover:bg-neutral-100 active:scale-95 transition-all flex items-center gap-1.5"
                            onClick={handleLoginClick}
                            title={showLogin ? 'Tutup' : 'Login'}
                        >
                            {showLogin
                                ? <><MdClose className="text-base md:text-lg" /><span className="hidden sm:inline">Tutup</span></>
                                : <><BiLogIn className="text-base md:text-lg" /><span className="hidden sm:inline">Login</span></>
                            }
                        </button>
                    )}
                </div>
            </div>
            {showLogin && <Login setUser={setUser} setShowLogin={setShowLogin} />}
        </div>
    );
};