import { useState } from "react";
import { FaRegArrowAltCircleUp } from "react-icons/fa";
import { FaAngleLeft } from "react-icons/fa";
import { IoIosAddCircleOutline } from "react-icons/io";
import { IoIosRemoveCircleOutline } from "react-icons/io";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function Form({ setPageFunc, user, setShowLogin }) {
    const [type, setType] = useState('diskusi');
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [text, setText] = useState('');
    const [agenda, setAgenda] = useState(['']);
    const [peserta, setPeserta] = useState([{ name: '', role: '', keterangan: false }]);
    const [option, setOption] = useState(['']);
    const [anonim, setAnonim] = useState(true);

    const bgColorMapping = {
        diskusi: '#5C7A6B',
        musyawarah: '#6B3F72',
        demos: '#D4A843',
        laporan: '#C0392B',
    };

    const addAgenda = () => {
        setAgenda(prev => [...prev, '']);
    };

    const subAgenda = () => {
        if (agenda.length === 1) return;
        setAgenda(prev => prev.slice(0, -1));
    };

    const setAgendaItem = (index, value) => {
        setAgenda(prev => prev.map((item, idx) => idx === index ? value : item));
    };

    const addPeserta = () => {
        setPeserta(prev => [...prev, { name: '', role: '', keterangan: false }]);
    };

    const subPeserta = () => {
        if (peserta.length === 1) return;
        setPeserta(prev => prev.slice(0, -1));
    };

    const setPesertaNameItem = (index, value) => {
        setPeserta(prev => prev.map((p, idx) => idx === index ? { ...p, name: value } : p));
    };

    const setPesertaRoleItem = (index, value) => {
        setPeserta(prev => prev.map((p, idx) => idx === index ? { ...p, role: value } : p));
    };

    const setPesertaKetItem = (index) => {
        setPeserta(prev => prev.map((p, idx) => idx === index ? { ...p, keterangan: !p.keterangan } : p));
    };

    const addOption = () => {
        setOption(prev => [...prev, '']);
    };

    const subOption = () => {
        if (option.length === 1) return;
        setOption(prev => prev.slice(0, -1));
    };

    const setOptionItem = (index, value) => {
        setOption(prev => prev.map((item, idx) => idx === index ? value : item));
    };

    const handleReset = () => {
        setType('diskusi');
        setCategory('');
        setTitle('');
        setText('');
        setAgenda(['']);
        setPeserta([{ name: '', role: '', keterangan: false }]);
        setOption(['']);
        setAnonim(true);
    };

    const handleSubmit = async () => {
        if (!user) {
            setShowLogin(true);
            return;
        }

        if (!title.trim() || !category.trim() || !text.trim()) {
            alert('Mohon lengkapi judul, kategori, dan isi unggahan!');
            return;
        }

        const sender = type === 'laporan' && anonim ? 'Anonim' : user.role === 'admin' ? 'Admin Mading' : user.name;
        const senderClass = type === 'laporan' && anonim ? null : user.role === 'admin' ? 'Staf' : user.class;

        const payload = {
            type,
            category,
            title,
            text,
            sender,
            class: senderClass
        };

        if (type === 'musyawarah') {
            payload.agenda = agenda.filter(a => a.trim() !== '');
            payload.peserta = peserta.filter(p => p.name.trim() !== '' && p.role.trim() !== '');
        } else if (type === 'demos') {
            payload.options = option.filter(o => o.trim() !== '');
            if (payload.options.length < 2) {
                alert('Demos membutuhkan minimal 2 opsi polling!');
                return;
            }
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                handleReset();
                if (typeof setPageFunc === 'function') {
                    setPageFunc('forum');
                }
            } else {
                const errorData = await response.json();
                alert(`Gagal membuat unggahan: ${errorData.error || 'Server error'}`);
            }
        } catch (error) {
            console.error('Error submitting post:', error);
            alert('Gagal terhubung ke server backend.');
        }
    };

    if (!user) {
        return (
            <div className="page-container pl-4 pr-4 pb-4 pt-20 md:pt-24 lg:pl-12 lg:pr-12 lg:pt-26 flex flex-col justify-center items-center bg-light text-dark gap-4 min-h-[60vh]">
                <div className="p-6 bg-neutral-50 border border-accent-100 rounded-lg shadow-md flex flex-col items-center text-center max-w-md gap-3">
                    <h2 className="text-xl font-bold text-[#5C7A6B]">Buku Tamu Diperlukan</h2>
                    <p className="text-sm text-dark-100">Anda harus mengisi Buku Tamu atau masuk terlebih dahulu sebelum dapat membuat unggahan baru.</p>
                    <button 
                        onClick={() => setShowLogin(true)}
                        className="mt-2 px-6 py-2 bg-[#5C7A6B] text-light font-bold rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer text-sm"
                    >
                        Isi Buku Tamu / Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container pl-4 pr-4 pb-4 pt-20 md:pt-24 lg:pl-12 lg:pr-12 lg:pt-26 text-[10px] md:text-sm bg-light">
            <div className="flex flex-col gap-2 pb-4">
                <h1 className="text-2xl lg:text-4xl font-bold">Form Unggahan</h1>
                <p className="pb-2">Buat unggahan anda di sini</p>
            </div>
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
                <div className="flex flex-col gap-4 p-4 bg-neutral-50 border border-accent-100 rounded-lg shadow-sm text-light flex-1 h-fit">
                    <div className="flex flex-col gap-2">
                        <p className="text-dark-100 text-sm font-bold">Tipe Unggahan</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div role="button" style={{ backgroundColor: type === 'diskusi' ? '#5C7A6B' : '#ddd8cb', color: type === 'diskusi' ? '#eeeae0' : '#2c2c2a' }} className="p-2 bg-light-100 rounded-md text-center text-sm font-bold text-light border border-accent-100 cursor-pointer" onClick={() => setType('diskusi')}>Diskusi</div>
                            <div role="button" style={{ backgroundColor: type === 'musyawarah' ? '#6B3F72' : '#ddd8cb', color: type === 'musyawarah' ? '#eeeae0' : '#2c2c2a' }} className="p-2 bg-light-100 rounded-md text-center text-sm font-bold text-light border border-accent-100 cursor-pointer" onClick={() => setType('musyawarah')}>Musyawarah</div>
                            <div role="button" style={{ backgroundColor: type === 'demos' ? '#D4A843' : '#ddd8cb', color: type === 'demos' ? '#eeeae0' : '#2c2c2a' }} className="p-2 bg-light-100 rounded-md text-center text-sm font-bold text-light border border-accent-100 cursor-pointer" onClick={() => setType('demos')}>Demos/Polling</div>
                            <div role="button" style={{ backgroundColor: type === 'laporan' ? '#C0392B' : '#ddd8cb', color: type === 'laporan' ? '#eeeae0' : '#2c2c2a' }} className="p-2 bg-light-100 rounded-md text-center text-sm font-bold text-light border border-accent-100 cursor-pointer" onClick={() => setType('laporan')}>Laporan</div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-dark-100 text-sm font-bold">Judul</p>
                        <input type="text" value={title} placeholder="Tulis judul yang menarik…" style={{ backgroundColor: bgColorMapping[type] }} className="rounded-lg text-sm p-2 outline-none" onChange={(event) => setTitle(event.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-dark-100 text-sm font-bold">Kategori</p>
                        <input type="text" value={category} placeholder="Gunakan kategori yang cocok…" style={{ backgroundColor: bgColorMapping[type] }} className="rounded-lg text-sm p-2 outline-none" onChange={(event) => setCategory(event.target.value)} />
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-dark-100 text-sm font-bold">Isi Unggahan</p>
                        <textarea value={text} rows={3} maxLength={300} placeholder="Ceritakan lebih lanjut…" style={{ backgroundColor: bgColorMapping[type] }} className="rounded-lg text-sm p-2 outline-none" onChange={(event) => setText(event.target.value)} />
                        <p className="text-dark-100 font-bold self-end">{text.length}/300</p>
                    </div>
                </div>
                <div className="flex flex-col gap-4 flex-1">
                    {type === 'musyawarah' && (
                        <div className="flex flex-col gap-4 p-4 bg-neutral-50 border border-accent-100 rounded-lg shadow-sm text-light">
                            <div className="flex flex-col gap-2">
                                <p className="text-dark-100 text-sm font-bold flex items-center justify-between">Agenda<span className="flex gap-2 text-lg"><IoIosAddCircleOutline className="cursor-pointer" onClick={addAgenda} /><IoIosRemoveCircleOutline className="cursor-pointer" onClick={subAgenda} /></span></p>
                                {agenda.map((agendaVal, index) => (
                                    <input type="text" key={index} value={agendaVal} placeholder={`Tulis agenda ke-${index + 1}`} style={{ backgroundColor: bgColorMapping[type] }} className="rounded-lg text-sm p-2 outline-none" onChange={(event) => { setAgendaItem(index, event.target.value) }} />
                                ))}
                            </div>
                            <div className="flex flex-col gap-2">
                                <p className="text-dark-100 text-sm font-bold flex items-center justify-between">Peserta<span className="flex gap-2 text-lg"><IoIosAddCircleOutline className="cursor-pointer" onClick={addPeserta} /><IoIosRemoveCircleOutline className="cursor-pointer" onClick={subPeserta} /></span></p>
                                {peserta.map((pesertaVal, index) => (
                                    <div key={index} className="grid grid-cols-3 gap-2 items-center">
                                        <input type="text" value={pesertaVal.name} placeholder='Nama' style={{ backgroundColor: bgColorMapping[type] }} className="rounded-lg text-sm p-2 outline-none flex-1" onChange={(event) => { setPesertaNameItem(index, event.target.value) }} />
                                        <input type="text" value={pesertaVal.role} placeholder='Peran' style={{ backgroundColor: bgColorMapping[type] }} className="rounded-lg text-sm p-2 outline-none flex-1" onChange={(event) => { setPesertaRoleItem(index, event.target.value) }} />
                                        <p style={{ backgroundColor: pesertaVal.keterangan ? '#eaf3de' : '#fcebeb', color: pesertaVal.keterangan ? '#3b6d11' : '#791f1f' }} className="text-sm pl-2 pr-2 h-full flex items-center justify-center rounded-xl border border-accent-100 cursor-pointer" onClick={() => setPesertaKetItem(index)}>{pesertaVal.keterangan ? 'Hadir' : 'Tidak Hadir'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {type === 'demos' && (
                        <div className="flex flex-col gap-2 p-4 bg-neutral-50 border border-accent-100 rounded-lg shadow-sm text-light">
                            <p className="text-dark-100 text-sm font-bold flex items-center justify-between">Opsi<span className="flex gap-2 text-lg"><IoIosAddCircleOutline className="cursor-pointer" onClick={addOption} /><IoIosRemoveCircleOutline className="cursor-pointer" onClick={subOption} /></span></p>
                            {option.map((optionVal, index) => (
                                <input type="text" key={index} value={optionVal} placeholder={`Opsi ke-${index + 1}`} style={{ backgroundColor: bgColorMapping[type] }} className="rounded-lg text-sm p-2 outline-none" onChange={(event) => { setOptionItem(index, event.target.value) }} />
                            ))}
                        </div>
                    )}
                    {type === 'laporan' && (
                        <div className="flex flex-col gap-2 p-4 bg-neutral-50 border border-accent-100 rounded-lg shadow-sm text-light">
                            <p className="text-dark-100 text-sm font-bold flex items-center justify-between">Anonimitas</p>
                            <div className="grid grid-cols-2 gap-4">
                                <p className="text-dark-100 capitalize">Apakah anda ingin mengunggahnya sebagai Anonim?</p>
                                <p style={{ backgroundColor: anonim ? '#eaf3de' : '#fcebeb', color: anonim ? '#3b6d11' : '#791f1f' }} className="text-sm pl-2 pr-2 h-full flex items-center justify-center rounded-xl border border-accent-100 cursor-pointer" onClick={() => setAnonim(!anonim)}>{anonim ? 'Anonim' : 'Tidak Anonim'}</p>
                            </div>
                        </div>
                    )}
                    <div style={{ backgroundColor: bgColorMapping[type] }} className="p-4 rounded-lg border border-accent-100 shadow-sm text-light flex flex-col gap-2 relative">
                        <h2 className="font-bold text-sm md:text-xl truncate">{title ? title : 'Judul'}</h2>
                        <h2 className="absolute right-4 text-light-100 opacity-50">Pratinjau</h2>
                        <p className="text-light-100">{text ? text : 'Isi Unggahan'}</p>
                        <div className="flex items-center justify-between gap-2">
                            <p className="font-bold capitalize text-light">Nama Anda · {type} · 07:00</p>
                            <div className="flex items-center gap-2"><FaRegArrowAltCircleUp />100<div className="bg-neutral-100 pt-1 pb-1 pl-2 pr-2 brightness-95 rounded-lg capitalize text-accent border border-accent-100 font-bold">{category ? category : 'Kategori'}</div></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button className="pl-4 pr-4 pt-2 pb-2 text-sm font-bold bg-[#fcebeb] text-[#791f1f] rounded-lg border border-accent-100 cursor-pointer hover:bg-[#fae1e1] active:scale-95 transition-all" onClick={handleReset}>Reset</button>
                        <button className="pl-4 pr-4 pt-2 pb-2 text-sm font-bold bg-[#eaf3de] text-[#3b6d11] rounded-lg border border-accent-100 cursor-pointer hover:bg-[#e1f0d3] active:scale-95 transition-all" onClick={handleSubmit}>Kirim</button>
                    </div>
                </div>
            </div>
        </div>
    )
}