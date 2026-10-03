-- Migration: Add booking lifecycle columns and users.is_active
-- Created: 2026-10-03

-- Add is_active to users table if not exists
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Drop old booking table and recreate with new schema
-- WARNING: This will delete existing booking data
-- For production, create new table and migrate data

DROP TABLE IF EXISTS booking CASCADE;

CREATE TABLE booking (
  id SERIAL PRIMARY KEY,
  nama_calon VARCHAR(255) NOT NULL,
  kontak VARCHAR(20) NOT NULL,
  kamar_id INTEGER NOT NULL REFERENCES kamar(id) ON DELETE CASCADE,
  tanggal_survei DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'menunggu' 
    CHECK (status IN ('menunggu', 'dp_terkirim', 'aktif', 'kedaluwarsa', 'ditolak')),
  bukti_dp VARCHAR(255),
  batas_waktu TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '3 days'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on batas_waktu for cron job queries
CREATE INDEX idx_booking_batas_waktu ON booking(batas_waktu);
CREATE INDEX idx_booking_status ON booking(status);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_booking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_booking_updated_at ON booking;
CREATE TRIGGER trigger_booking_updated_at
  BEFORE UPDATE ON booking
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_updated_at();
