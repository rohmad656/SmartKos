# Aplikasi Web Manajemen Kos

## Konteks Proyek
Aplikasi manajemen kos (penghuni, kamar, pembayaran, perbaikan, booking).
Selalu baca dan patuhi dokumen berikut sebelum menulis kode:
- @docs/PRD.md     -> fitur & scope produk
- @docs/Rules.md   -> aturan development WAJIB
- @docs/Schema.md  -> struktur database (jangan ubah tanpa izin)
- @docs/Design.md  -> UI/UX & peran pengguna

## Aturan Kode (ringkasan, detail lihat docs/Rules.md)
- Payload API selalu JSON.
- Variabel & fungsi JS: camelCase. Kolom & tabel DB: snake_case.
- Secret (DB password, API key) hanya di .env, jangan hardcode.
- Validasi input di client DAN server.

## Stack
- Frontend: React.js + Tailwind CSS (Vite)
- Backend: Node.js + Express, RESTful API
- Database: PostgreSQL (atau MySQL)

## Verifikasi
- Jalankan build/lint setelah mengubah kode.
- Jangan edit file hasil generate langsung.
