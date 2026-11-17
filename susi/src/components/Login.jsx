import { useState } from "react";
import { motion as Motion } from "motion/react";
import { MdPeopleAlt, MdClose } from "react-icons/md";
import { FaRegEye, FaRegEyeSlash, FaGraduationCap, FaShieldAlt } from "react-icons/fa";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function Login({ setUser, setShowLogin }) {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [tab, setTab] = useState("guest"); // 'guest' | 'admin'
    const [nama, setNama] = useState("");
    const [kelas, setKelas] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setShowLogin(false);
    };

    const handleGuestSubmit = async (e) => {
        e.preventDefault();
        if (!nama.trim() || !kelas.trim()) {
            alert("Mohon lengkapi Nama dan Kelas!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/guest/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: nama.trim(), class: kelas.trim() })
            });
            const data = await res.json();
            if (res.ok) {
                setUser({
                    guest_id: data.guest_id,
                    name: data.name,
                    class: data.class,
                    role: "guest"
                });
                setShowLogin(false);
            } else {
                alert(data.error || "Gagal mendaftar buku tamu.");
            }
        } catch (err) {
            console.error(err);
            alert("Gagal menghubungi server. Pastikan server aktif dan stabil.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdminSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            alert("Mohon lengkapi Username dan Password!");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (res.ok) {
                setUser(data.user);
                setShowLogin(false);
            } else {
                alert(data.error || "Kredensial admin salah!");
            }
        } catch (err) {
            console.error(err);
            alert("Gagal menghubungi server. Pastikan server aktif dan stabil.");
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Root container Motion.div dengan pointer-events-auto & full screen fixed overlay */
        <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="fixed inset-0 z-[120] pointer-events-auto flex items-center justify-center p-4 select-none"
        >
            {/* Backdrop Blur Overlay yang menangkap seluruh klik background agar konten belakang terhalang */}
            <div
                onClick={handleClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-md cursor-pointer pointer-events-auto"
            />

            {/* Modal Dialog Card dengan Animasi In/Out Motion.dev */}
            <Motion.div
                initial={{ opacity: 0, scale: 0.92, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 14 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-black/10 text-[#2C2C2A] z-10 overflow-hidden pointer-events-auto select-auto"
            >
                {/* Header & Tombol Tutup */}
                <div className="flex items-start justify-between mb-5">
                    <div>
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#8B7355] uppercase tracking-widest mb-1">
                            <span>✦</span>
                            <span>Buku Tamu Digital · SuaraSiswa</span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#2C2C2A] font-[family-name:var(--font-sans)]">
                            {tab === "guest" ? "Masuk Buku Tamu" : "Portal Admin"}
                        </h2>
                        <p className="text-xs text-[#6B6B68] mt-1 font-normal leading-relaxed">
                            {tab === "guest"
                                ? "Isi identitas untuk berpartisipasi dalam diskusi dan voting aspirasi."
                                : "Login khusus pengurus OSIS dan administrator SuaraSiswa."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleClose();
                        }}
                        title="Tutup Modal"
                        className="p-2 rounded-full hover:bg-neutral-100 active:scale-95 text-[#6B6B68] hover:text-[#2C2C2A] transition-all cursor-pointer shrink-0 z-20 pointer-events-auto"
                    >
                        <MdClose className="text-xl" />
                    </button>
                </div>

                {/* Sliding Segmented Tab Switcher (Motion layoutId) */}
                <div className="flex p-1 bg-neutral-100 rounded-xl mb-5 border border-black/5 relative">
                    <button
                        type="button"
                        onClick={() => setTab("guest")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 relative z-10 ${
                            tab === "guest" ? "text-[#2C2C2A]" : "text-[#6B6B68] hover:text-[#2C2C2A]"
                        }`}
                    >
                        <FaGraduationCap className="text-sm" />
                        <span>Siswa / Tamu</span>
                        {tab === "guest" && (
                            <Motion.div
                                layoutId="activeLoginTab"
                                className="absolute inset-0 bg-white rounded-lg shadow-xs z-[-1]"
                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            />
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => setTab("admin")}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 relative z-10 ${
                            tab === "admin" ? "text-[#2C2C2A]" : "text-[#6B6B68] hover:text-[#2C2C2A]"
                        }`}
                    >
                        <FaShieldAlt className="text-sm" />
                        <span>Admin</span>
                        {tab === "admin" && (
                            <Motion.div
                                layoutId="activeLoginTab"
                                className="absolute inset-0 bg-white rounded-lg shadow-xs z-[-1]"
                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            />
                        )}
                    </button>
                </div>

                {/* Form Tab Siswa / Guest */}
                {tab === "guest" ? (
                    <form onSubmit={handleGuestSubmit} className="flex flex-col gap-3.5">
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#6B6B68] uppercase tracking-wider">
                                Nama Lengkap
                            </label>
                            <div className="flex items-center bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-black/10 focus-within:border-[#1E9A68] focus-within:ring-2 focus-within:ring-[#1E9A68]/20 transition-all">
                                <input
                                    type="text"
                                    placeholder="Contoh: Budi Santoso"
                                    className="outline-none w-full text-dark bg-transparent text-sm placeholder:text-[#A0A09C]"
                                    value={nama}
                                    onChange={(e) => setNama(e.target.value)}
                                    autoFocus
                                />
                                <MdPeopleAlt className="text-[#8C8C88] text-base shrink-0 ml-2" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#6B6B68] uppercase tracking-wider">
                                Kelas / Gugus
                            </label>
                            <div className="flex items-center bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-black/10 focus-within:border-[#1E9A68] focus-within:ring-2 focus-within:ring-[#1E9A68]/20 transition-all">
                                <input
                                    type="text"
                                    placeholder="Contoh: XII RPL 1 / XI MIPA 2"
                                    className="outline-none w-full text-dark bg-transparent text-sm placeholder:text-[#A0A09C]"
                                    value={kelas}
                                    onChange={(e) => setKelas(e.target.value)}
                                />
                            </div>
                        </div>

                        <Motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#1E9A68] hover:bg-[#188056] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all mt-2 cursor-pointer text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? "Menyimpan..." : "Masuk & Berikan Suara"}
                        </Motion.button>
                    </form>
                ) : (
                    /* Form Tab Admin */
                    <form onSubmit={handleAdminSubmit} className="flex flex-col gap-3.5">
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#6B6B68] uppercase tracking-wider">
                                Username Admin
                            </label>
                            <div className="flex items-center bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-black/10 focus-within:border-[#8E44AD] focus-within:ring-2 focus-within:ring-[#8E44AD]/20 transition-all">
                                <input
                                    type="text"
                                    placeholder="Username admin"
                                    className="outline-none w-full text-dark bg-transparent text-sm placeholder:text-[#A0A09C]"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    autoFocus
                                />
                                <FaShieldAlt className="text-[#8C8C88] text-sm shrink-0 ml-2" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-bold text-[#6B6B68] uppercase tracking-wider">
                                Password Admin
                            </label>
                            <div className="flex items-center bg-neutral-50 px-3.5 py-2.5 rounded-xl border border-black/10 focus-within:border-[#8E44AD] focus-within:ring-2 focus-within:ring-[#8E44AD]/20 transition-all">
                                <input
                                    type={passwordVisible ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="outline-none w-full text-dark bg-transparent text-sm placeholder:text-[#A0A09C]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <div
                                    className="cursor-pointer text-[#8C8C88] hover:text-[#2C2C2A] transition-colors ml-2"
                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                >
                                    {passwordVisible ? <FaRegEye /> : <FaRegEyeSlash />}
                                </div>
                            </div>
                        </div>

                        <Motion.button
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-[#8E44AD] hover:bg-[#783693] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all mt-2 cursor-pointer text-sm disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {loading ? "Memverifikasi..." : "Login Administrator"}
                        </Motion.button>
                    </form>
                )}
            </Motion.div>
        </Motion.div>
    );
}
