-- Pembayaran otomasi: status baru, kolom tambahan, index unik, jatuh tempo penghuni

-- 1. Tambah status menunggu_verifikasi ke enum
DO $$ BEGIN
  ALTER TYPE status_pembayaran_enum ADD VALUE IF NOT EXISTS 'menunggu_verifikasi';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Fallback jika enum belum ada value (Postgres < 9.6 tidak support IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'menunggu_verifikasi' AND enumtypid = 'status_pembayaran_enum'::regtype) THEN
    ALTER TYPE status_pembayaran_enum ADD VALUE 'menunggu_verifikasi';
  END IF;
END $$;

-- 2. Tambah kolom di pembayaran
ALTER TABLE pembayaran ADD COLUMN IF NOT EXISTS jatuh_tempo DATE;
ALTER TABLE pembayaran ADD COLUMN IF NOT EXISTS bukti_bayar VARCHAR(255);
ALTER TABLE pembayaran ADD COLUMN IF NOT EXISTS keterangan TEXT;
ALTER TABLE pembayaran ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 3. Unique index agar tidak dobel tagihan per penghuni per bulan
CREATE UNIQUE INDEX IF NOT EXISTS idx_pembayaran_unik ON pembayaran(penghuni_id, bulan_tagihan);

-- 4. Tambah jatuh_tempo_hari di penghuni (hari ke-berapa tiap bulan sebagai tenggat)
ALTER TABLE penghuni ADD COLUMN IF NOT EXISTS jatuh_tempo_hari INT DEFAULT 5;

-- 5. Storage bucket untuk bukti bayar (jika belum ada)
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti-bayar', 'bukti-bayar', true)
ON CONFLICT (id) DO NOTHING;
