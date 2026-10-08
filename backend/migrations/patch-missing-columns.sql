-- Add missing columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to booking table
ALTER TABLE booking
ADD COLUMN IF NOT EXISTS bukti_dp VARCHAR(255);

ALTER TABLE booking
ADD COLUMN IF NOT EXISTS batas_waktu TIMESTAMP NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '3 days');

ALTER TABLE booking
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_batas_waktu ON booking(batas_waktu);
CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(status);

-- Verify columns exist
SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='is_active';
SELECT column_name FROM information_schema.columns WHERE table_name='booking' AND column_name IN ('bukti_dp', 'batas_waktu', 'updated_at');
