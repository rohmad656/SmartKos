# SmartKos

Aplikasi web manajemen kos untuk memudahkan pemilik mengelola penghuni, kamar, pembayaran, perbaikan, dan booking — sekaligus menjadi kanal komunikasi antara pemilik dan penghuni lewat pengumuman serta pesan langsung.

## Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18, React Router 6, Vite 5, Tailwind CSS 3, Axios |
| Backend | Node.js 20, Express 4 (RESTful API) |
| Database | PostgreSQL |
| Auth | JWT (bcrypt + jsonwebtoken), role-based access control |
| Validation | express-validator (client & server) |

## Fitur

### Backend (selesai)
- **Auth JWT 3 peran**: `admin`, `penghuni`, `calon_penghuni` — register, login, profil (`GET /api/auth/me`)
- **Middleware `protect(role)`**: guard route berdasarkan role
- **Manajemen Kamar & Penghuni**: CRUD lengkap (`/api/kamar`, `/api/penghuni`)
- **Validasi input** di setiap endpoint POST/PUT via express-validator
- **Respons API konsisten**: format `{ data, error }`

### Database
8 tabel sesuai [docs/Schema.md](docs/Schema.md): `kamar`, `penghuni`, `pembayaran`, `perbaikan`, `booking`, `users`, `pengumuman`, `pesan`

### Roadmap
- [ ] Endpoint `pembayaran`, `perbaikan`, `booking`
- [ ] Endpoint `pengumuman` & `pesan`
- [ ] Frontend: routing per-peran (Admin, Penghuni, Calon Penghuni)
- [ ] Frontend: dashboard, katalog kamar, form booking
- [ ] Deployment (Vercel + backend cloud)

## Peran Pengguna

| Peran | Akses |
|---|---|
| **Admin (Pemilik Kos)** | Kelola kamar, penghuni, pembayaran, perbaikan, booking, pengumuman |
| **Penghuni** | Profil, riwayat tagihan, ajukan perbaikan, baca pengumuman, pesan |
| **Calon Penghuni** | Katalog kamar kosong, booking online, formulir pertanyaan |

## Project Structure

```
SmartKos/
├── backend/
│   └── src/
│       ├── config/        # Koneksi database (pg Pool)
│       ├── controllers/   # auth, kamar, penghuni
│       ├── middlewares/   # auth (JWT + role), validator
│       ├── models/        # query SQL
│       ├── routes/        # rute Express
│       └── server.js
├── frontend/
│   └── src/               # React (components, layouts, pages, services)
├── docs/                  # PRD, Schema, Design, Architecture, Rules
└── AGENTS.md
```

## Setup & Menjalankan

### Prasyarat
- Node.js >= 18
- PostgreSQL

### 1. Database

```sql
CREATE DATABASE smartkos;
```

Lalu jalankan skema:

```bash
psql -U postgres -d smartkos -f docs/migration.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # lalu isi nilai sebenarnya
npm install
npm run dev            # http://localhost:5000
```

Variabel `.env` backend:

```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=***
DB_NAME=smartkos
JWT_SECRET=***
```

> **Penting**: `JWT_SECRET` dan `DB_PASSWORD` wajib diisi dari environment, tidak boleh hardcode. File `.env` sudah masuk `.gitignore`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

## API Reference

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| POST | `/auth/register` | — | Daftar user baru (role: `admin`/`penghuni`/`calon_penghuni`) |
| POST | `/auth/login` | — | Login, balas token JWT + data user |
| GET | `/auth/me` | Bearer token | Profil user login |

### Kamar

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/kamar` | — | Daftar semua kamar |
| GET | `/kamar/:id` | — | Detail kamar |
| POST | `/kamar` | — | Tambah kamar |
| PUT | `/kamar/:id` | — | Ubah kamar |
| DELETE | `/kamar/:id` | — | Hapus kamar |

### Penghuni

| Method | Endpoint | Auth | Deskripsi |
|---|---|---|---|
| GET | `/penghuni` | — | Daftar penghuni + nomor kamar |
| GET | `/penghuni/:id` | — | Detail penghuni |
| POST | `/penghuni` | — | Tambah penghuni |
| PUT | `/penghuni/:id` | — | Ubah data penghuni |
| DELETE | `/penghuni/:id` | — | Hapus penghuni |

Semua payload request/response memakai JSON. Contoh response sukses:

```json
{ "data": { ... }, "error": null }
```

Contoh response error:

```json
{ "data": null, "error": "Email already registered" }
```

## Konvensi Pengembangan

- Payload API: JSON
- Variabel & fungsi JS: `camelCase`
- Kolom & tabel database: `snake_case`
- Secret hanya di `.env`, jangan pernah hardcode
- Validasi input di sisi client **dan** server
- Detail aturan: [docs/Rules.md](docs/Rules.md)

## Dokumen Proyek

| Dokumen | Isi |
|---|---|
| [PRD.md](docs/PRD.md) | Kebutuhan produk & fitur |
| [Schema.md](docs/Schema.md) | Struktur database |
| [Design.md](docs/Design.md) | UI/UX & akses per peran |
| [Architecture.md](docs/Architecture.md) | Arsitektur & rencana integrasi |

## Roadmap Integrasi Masa Depan

- Payment gateway (QRIS / e-wallet)
- Notifikasi WhatsApp
