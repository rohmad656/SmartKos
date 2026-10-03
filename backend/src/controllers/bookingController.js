import { BookingModel } from '../models/bookingModel.js';
import { KamarModel } from '../models/kamarModel.js';
import { PenghuniModel } from '../models/penghuniModel.js';
import { PembayaranModel } from '../models/pembayaranModel.js';
import { UserModel } from '../models/userModel.js';
import pool from '../config/db.js';

export const getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const bookings = await BookingModel.getAll(status);
    return res.json({ data: bookings, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { nama_calon, kontak, kamar_id, tanggal_survei } = req.body;
    
    const kamar = await KamarModel.getById(kamar_id);
    if (!kamar || kamar.status !== 'kosong') {
      return res.status(400).json({ data: null, error: 'Kamar tidak tersedia' });
    }

    const booking = await BookingModel.create({
      nama_calon,
      kontak,
      kamar_id,
      tanggal_survei
    });

    return res.status(201).json({ data: booking, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const uploadDPProof = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ data: null, error: 'Bukti DP harus diunggah' });
    }

    const booking = await BookingModel.getById(id);
    if (!booking) {
      return res.status(404).json({ data: null, error: 'Booking tidak ditemukan' });
    }

    if (booking.status !== 'menunggu') {
      return res.status(400).json({ data: null, error: 'Booking tidak dalam status menunggu' });
    }

    const bukti_dp = req.file.originalname;
    const updated = await BookingModel.uploadDPProof(id, bukti_dp);

    return res.json({ data: updated, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const verifyBooking = async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { approve } = req.body;

    const booking = await BookingModel.getById(id);
    if (!booking) {
      return res.status(404).json({ data: null, error: 'Booking tidak ditemukan' });
    }

    if (booking.status !== 'dp_terkirim') {
      return res.status(400).json({ data: null, error: 'Booking harus berstatus dp_terkirim' });
    }

    if (!approve) {
      const rejected = await BookingModel.updateStatus(id, 'ditolak');
      await KamarModel.update(booking.kamar_id, { status: 'kosong' });
      return res.json({ data: rejected, error: null });
    }

    await client.query('BEGIN');

    try {
      const bulanTagihan = new Date().toISOString().slice(0, 7);
      
      const penghuniResult = await client.query(
        `INSERT INTO penghuni (nama, kontak, kamar_id, tanggal_mulai)
         VALUES ($1, $2, $3, CURRENT_DATE) RETURNING *`,
        [booking.nama_calon, booking.kontak, booking.kamar_id]
      );
      const penghuni = penghuniResult.rows[0];

      const userResult = await client.query(
        `INSERT INTO users (nama, email, password_hash, role, penghuni_id, is_active)
         VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
        [
          booking.nama_calon,
          `penghuni_${booking.id}@smartkos.local`,
          'temp_pass',
          'penghuni',
          penghuni.id
        ]
      );

      await client.query(
        `UPDATE kamar SET status = $1 WHERE id = $2`,
        ['terisi', booking.kamar_id]
      );

      await client.query(
        `INSERT INTO pembayaran (penghuni_id, bulan_tagihan, jumlah, status)
         VALUES ($1, $2, $3, $4)`,
        [penghuni.id, bulanTagihan, booking.harga, 'belum_lunas']
      );

      await client.query(
        `UPDATE booking SET status = $1 WHERE id = $2`,
        ['aktif', id]
      );

      await client.query('COMMIT');

      const updated = await BookingModel.getById(id);
      return res.json({ data: updated, error: null });
    } catch (txnError) {
      await client.query('ROLLBACK');
      throw txnError;
    }
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  } finally {
    client.release();
  }
};

export const getPendingVerification = async (req, res) => {
  try {
    const bookings = await BookingModel.getPendingVerification();
    return res.json({ data: bookings, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getConversionAnalytics = async (req, res) => {
  try {
    const analytics = await BookingModel.getConversionAnalytics();
    return res.json({ data: analytics, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const expireBookings = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const expiredBookings = await BookingModel.getExpiredBookings();

    for (const booking of expiredBookings) {
      await client.query(
        `UPDATE booking SET status = $1 WHERE id = $2`,
        ['kedaluwarsa', booking.id]
      );

      await client.query(
        `UPDATE kamar SET status = $1 WHERE id = $2`,
        ['kosong', booking.kamar_id_ref]
      );
    }

    await client.query('COMMIT');
    console.log(`[CRON] Expired ${expiredBookings.length} bookings`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[CRON] Error expiring bookings:', error);
  } finally {
    client.release();
  }
};
