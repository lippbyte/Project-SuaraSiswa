# SuaraSiswa (SUSI)

Platform diskusi digital siswa berbasis web — Forum, Musyawarah, Polling, dan Laporan.

## Struktur Project

```
Project-SuaraSiswa/
├── susi/       # Frontend (React + Vite + TailwindCSS)
└── backend/    # Backend (Express + MySQL + Socket.io)
```

## Setup Lokal

### Backend
```bash
cd backend
cp .env.example .env   # isi dengan kredensial MySQL kamu
npm install
npm run dev
```

### Frontend
```bash
cd susi
cp .env.example .env   # isi VITE_BACKEND_URL=http://localhost:3000
npm install
npm run dev
```

## Deploy

- **Frontend** → [Vercel](https://vercel.com) (Root directory: `susi/`)
- **Backend** → [Railway](https://railway.app) (Root directory: `backend/`)

### Environment Variables

#### Frontend (Vercel)
| Key | Value |
|-----|-------|
| `VITE_BACKEND_URL` | URL backend Railway production |

#### Backend (Railway)
| Key | Value |
|-----|-------|
| `PORT` | 3000 |
| `DB_HOST` | host MySQL Railway |
| `DB_USER` | user MySQL |
| `DB_PASSWORD` | password MySQL |
| `DB_NAME` | susi |
| `ADMIN_USER` | admin |
| `ADMIN_PASSWORD` | password admin |

## Teknologi

- React 19, Vite 8, TailwindCSS 4, GSAP
- Express.js, MySQL2, Socket.io
- Railway (backend), Vercel (frontend)
