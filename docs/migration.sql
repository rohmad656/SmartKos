-- 0. Set search path ke public schema
SET search_path TO public;

-- 1. Create ENUM Types (dengan handle error jika sudah ada)
DO $$ BEGIN
  CREATE TYPE status_kamar_enum AS ENUM ('kosong', 'terisi', 'maintenance');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_pembayaran_enum AS ENUM ('lunas', 'belum_lunas', 'terlambat');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_perbaikan_enum AS ENUM ('pending', 'proses', 'selesai');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE status_booking_enum AS ENUM ('menunggu', 'disetujui', 'dibatalkan');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE role_user_enum AS ENUM ('admin', 'penghuni', 'calon_penghuni');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Table: kamar
CREATE TABLE IF NOT EXISTS kamar (
    id SERIAL PRIMARY KEY,
    nomor_kamar VARCHAR(50) NOT NULL UNIQUE,
    tipe VARCHAR(50) NOT NULL,
    harga NUMERIC(12, 2) NOT NULL,
    status status_kamar_enum DEFAULT 'kosong',
    deskripsi TEXT,
    foto_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: penghuni
CREATE TABLE IF NOT EXISTS penghuni (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kontak VARCHAR(20) NOT NULL,
    email VARCHAR(100) UNIQUE,
    kamar_id INT REFERENCES kamar(id) ON DELETE SET NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_selesai DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table: pembayaran
CREATE TABLE IF NOT EXISTS pembayaran (
    id SERIAL PRIMARY KEY,
    penghuni_id INT NOT NULL REFERENCES penghuni(id) ON DELETE CASCADE,
    bulan_tagihan VARCHAR(20) NOT NULL,
    jumlah NUMERIC(12, 2) NOT NULL,
    status status_pembayaran_enum DEFAULT 'belum_lunas',
    tanggal_bayar TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: perbaikan
CREATE TABLE IF NOT EXISTS perbaikan (
    id SERIAL PRIMARY KEY,
    penghuni_id INT NOT NULL REFERENCES penghuni(id) ON DELETE CASCADE,
    kamar_id INT NOT NULL REFERENCES kamar(id) ON DELETE CASCADE,
    deskripsi TEXT NOT NULL,
    status status_perbaikan_enum DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table: booking
CREATE TABLE IF NOT EXISTS booking (
    id SERIAL PRIMARY KEY,
    nama_calon VARCHAR(100) NOT NULL,
    kontak VARCHAR(20) NOT NULL,
    kamar_id INT REFERENCES kamar(id) ON DELETE SET NULL,
    tanggal_survei DATE,
    status status_booking_enum DEFAULT 'menunggu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table: users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_user_enum NOT NULL,
    penghuni_id INT REFERENCES penghuni(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_penghuni ON users(penghuni_id);

-- 8. Table: pengumuman
CREATE TABLE IF NOT EXISTS pengumuman (
    id SERIAL PRIMARY KEY,
    judul VARCHAR(150) NOT NULL,
    isi TEXT NOT NULL,
    dibuat_oleh INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_pengumuman_dibuat_oleh ON pengumuman(dibuat_oleh);

-- 9. Table: pesan
CREATE TABLE IF NOT EXISTS pesan (
    id SERIAL PRIMARY KEY,
    pengirim_id INT REFERENCES users(id),
    penerima_id INT REFERENCES users(id),
    isi TEXT NOT NULL,
    dibaca_pada TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- PERBAIKAN: Hapus duplikasi idx_pengumuman_dibuat_oleh di sini
CREATE INDEX IF NOT EXISTS idx_pesan_pengirim ON pesan(pengirim_id);
CREATE INDEX IF NOT EXISTS idx_pesan_penerima ON pesan(penerima_id);