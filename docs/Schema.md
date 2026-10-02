# Database Schema

## Tables

### 1. `kamar`
- `id` (PK, INT / UUID)
- `nomor_kamar` (VARCHAR)
- `tipe` (VARCHAR)
- `harga` (DECIMAL)
- `status` (ENUM: 'kosong', 'terisi', 'maintenance')
- `deskripsi` (TEXT)
- `foto_url` (VARCHAR)

### 2. `penghuni`
- `id` (PK, INT / UUID)
- `nama` (VARCHAR)
- `kontak` (VARCHAR)
- `email` (VARCHAR)
- `kamar_id` (FK -> kamar.id)
- `tanggal_mulai` (DATE)
- `tanggal_selesai` (DATE)

### 3. `pembayaran`
- `id` (PK, INT / UUID)
- `penghuni_id` (FK -> penghuni.id)
- `bulan_tagihan` (VARCHAR)
- `jumlah` (DECIMAL)
- `status` (ENUM: 'lunas', 'belum_lunas', 'terlambat')
- `tanggal_bayar` (TIMESTAMP)

### 4. `perbaikan`
- `id` (PK, INT / UUID)
- `penghuni_id` (FK -> penghuni.id)
- `kamar_id` (FK -> kamar.id)
- `deskripsi` (TEXT)
- `status` (ENUM: 'pending', 'proses', 'selesai')
- `created_at` (TIMESTAMP)

### 5. `booking`
- `id` (PK, INT / UUID)
- `nama_calon` (VARCHAR)
- `kontak` (VARCHAR)
- `kamar_id` (FK -> kamar.id)
- `tanggal_survei` (DATE)
- `status` (ENUM: 'menunggu', 'disetujui', 'dibatalkan')

### 6. `users`
- `id` (PK, INT / UUID)
- `nama` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `role` (ENUM: 'admin', 'penghuni', 'calon_penghuni')
- `penghuni_id` (FK -> penghuni.id, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 7. `pengumuman`
- `id` (PK, INT / UUID)
- `judul` (VARCHAR)
- `isi` (TEXT)
- `dibuat_oleh` (FK -> users.id)
- `created_at` (TIMESTAMP)

### 8. `pesan`
- `id` (PK, INT / UUID)
- `pengirim_id` (FK -> users.id)
- `penerima_id` (FK -> users.id)
- `isi` (TEXT)
- `dibaca_pada` (TIMESTAMP, nullable)
- `created_at` (TIMESTAMP)
