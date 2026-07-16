import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { MdPeopleAlt } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import { useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function Login({ setUser, setShowLogin }) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [tab, setTab] = useState('guest');
    const [nama, setNama] = useState('');
    const [kelas, setKelas] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Helper: restore page visibility (remove blur + re-enable pointer events)
    const clearPageBlur = () => {
        const page = document.querySelector('.page-container');
        if (page) {
            page.style.pointerEvents = 'auto';
            gsap.to('.page-container', { filter: 'blur(0px)' });
        }
    };

    useGSAP(() => {
        gsap.to('.page-container', { filter: 'blur(10px)' })
        gsap.from('.login-container', { yPercent: -100, opacity: 0, duration: 0.4, ease: "back.out" })
    }, []);

    const handleGuestSubmit = async (e) => {
        e.preventDefault();
        if (!nama.trim() || !kelas.trim()) {
            alert('Mohon lengkapi Nama dan Kelas!');
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/api/guest/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: nama.trim(), class: kelas.trim() })
            });
            const data = await res.json();
            if (res.ok) {
                setUser({
                    guest_id: data.guest_id,
                    name: data.name,
                    class: data.class,
                    role: 'guest'
                });
                
                // Re-enable page pointer events and remove blur
                const page = document.querySelector('.page-container');
                if (page) {
                    page.style.pointerEvents = 'auto';
                    gsap.to('.page-container', { filter: 'blur(0px)' });
                }
                setShowLogin(false);
            } else {
                alert(data.error || 'Gagal mendaftar buku tamu.');
            }
        } catch (err) {
            console.error(err);
            // Restore page visibility so user can still interact
            clearPageBlur();
            setShowLogin(false);
            alert('Gagal menghubungi backend server. Pastikan koneksi internet Anda stabil.');
        }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            alert('Mohon lengkapi Username dan Password!');
            return;
        }
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                
                // Re-enable page pointer events and remove blur
                const page = document.querySelector('.page-container');
                if (page) {
                    page.style.pointerEvents = 'auto';
                    gsap.to('.page-container', { filter: 'blur(0px)' });
                }
                setShowLogin(false);
            } else {
                alert(data.error || 'Kredensial salah!');
            }
        } catch (err) {
            console.error(err);
            // Restore page visibility so user can still interact
            clearPageBlur();
            setShowLogin(false);
            alert('Gagal menghubungi backend server. Pastikan koneksi internet Anda stabil.');
        }
    };

    return (
        <div className="login-container md:w-1/2 md:fixed md:left-1/2 md:-translate-x-1/2 md:top-1/2 md:-translate-y-1/2 p-6 bg-light-100 rounded-md shadow-lg flex flex-col gap-4 border border-accent-100 text-dark z-[110]">
            <h2 className="text-2xl md:text-3xl text-center font-bold">Login</h2>
            
            {/* Tab Header */}
            <div className="flex border-b border-accent-100">
                <button 
                    type="button"
                    className={`flex-1 py-2 font-bold cursor-pointer transition-all ${tab === 'guest' ? 'border-b-2 border-[#5C7A6B] text-[#5C7A6B]' : 'text-dark-100 opacity-60'}`}
                    onClick={() => setTab('guest')}
                >
                    Guest
                </button>
                <button 
                    type="button"
                    className={`flex-1 py-2 font-bold cursor-pointer transition-all ${tab === 'admin' ? 'border-b-2 border-[#5C7A6B] text-[#5C7A6B]' : 'text-dark-100 opacity-60'}`}
                    onClick={() => setTab('admin')}
                >
                    Admin
                </button>
            </div>

            {tab === 'guest' ? (
                <form onSubmit={handleGuestSubmit} className="flex flex-col gap-4 mt-2">
                    <p className="text-xs text-dark-100">Silakan isi Guest terlebih dahulu untuk dapat berpartisipasi.</p>
                    <div className="flex justify-between items-center bg-light p-2 rounded-sm shadow-sm border border-accent-100">
                        <input 
                            type="text" 
                            placeholder="Nama Lengkap" 
                            className="outline-none w-full text-dark px-2 bg-transparent text-sm"
                            value={nama}
                            onChange={(e) => setNama(e.target.value)}
                        />
                        <MdPeopleAlt className="text-dark-100" />
                    </div>
                    <div className="flex justify-between items-center bg-light p-2 rounded-sm shadow-sm border border-accent-100">
                        <input 
                            type="text" 
                            placeholder="Kelas / Gugus (contoh: XII-IPA-1)" 
                            className="outline-none w-full text-dark px-2 bg-transparent text-sm"
                            value={kelas}
                            onChange={(e) => setKelas(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="w-full py-2 bg-[#5C7A6B] text-light font-bold shadow-sm rounded-lg hover:brightness-110 active:scale-95 transition-all mt-2 cursor-pointer">
                        Login
                    </button>
                </form>
            ) : (
                <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4 mt-2">
                    <div className="flex justify-between items-center bg-light p-2 rounded-sm shadow-sm border border-accent-100">
                        <input 
                            type="text" 
                            placeholder="Username Admin" 
                            className="outline-none w-full text-dark px-2 bg-transparent text-sm"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <MdPeopleAlt className="text-dark-100" />
                    </div>
                    <div className="flex justify-between items-center bg-light p-2 rounded-sm shadow-sm border border-accent-100">
                        <input 
                            type={passwordVisible ? 'text' : 'password'} 
                            placeholder="Password Admin" 
                            className="outline-none w-full text-dark px-2 bg-transparent text-sm"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="cursor-pointer text-dark-100" onClick={() => setPasswordVisible(!passwordVisible)}>
                            {passwordVisible ? <FaRegEye /> : <FaRegEyeSlash />}
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 bg-[#6B3F72] text-light font-bold shadow-sm rounded-lg hover:brightness-110 active:scale-95 transition-all mt-2 cursor-pointer">
                        Login Admin
                    </button>
                </form>
            )}
        </div>
    )
}