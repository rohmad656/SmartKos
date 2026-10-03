import pool from '../config/db.js';

export const BookingModel = {
  async getAll(status = null) {
    let query = `
      SELECT b.*, k.nomor_kamar, k.harga, k.status as kamar_status
      FROM booking b
      LEFT JOIN kamar k ON b.kamar_id = k.id
    `;
    const params = [];

    if (status) {
      query += ' WHERE b.status = $1';
      params.push(status);
    }

    query += ' ORDER BY b.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      'SELECT b.*, k.nomor_kamar, k.harga FROM booking b LEFT JOIN kamar k ON b.kamar_id = k.id WHERE b.id = $1',
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { nama_calon, kontak, kamar_id, tanggal_survei } = data;
    const batas_waktu = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    const result = await pool.query(
      `INSERT INTO booking (nama_calon, kontak, kamar_id, tanggal_survei, status, batas_waktu)
       VALUES ($1, $2, $3, $4, 'menunggu', $5) RETURNING *`,
      [nama_calon, kontak, kamar_id, tanggal_survei || null, batas_waktu]
    );
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE booking SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  async uploadDPProof(id, bukti_dp) {
    const result = await pool.query(
      `UPDATE booking SET status = 'dp_terkirim', bukti_dp = $1 WHERE id = $2 RETURNING *`,
      [bukti_dp, id]
    );
    return result.rows[0];
  },

  async getPendingVerification() {
    const result = await pool.query(
      `SELECT b.*, k.nomor_kamar, k.harga 
       FROM booking b
       LEFT JOIN kamar k ON b.kamar_id = k.id
       WHERE b.status = 'dp_terkirim'
       ORDER BY b.created_at ASC`
    );
    return result.rows;
  },

  async getExpiredBookings() {
    const result = await pool.query(
      `SELECT b.*, k.id as kamar_id_ref FROM booking b
       LEFT JOIN kamar k ON b.kamar_id = k.id
       WHERE b.status IN ('menunggu', 'dp_terkirim')
       AND b.batas_waktu < CURRENT_TIMESTAMP`
    );
    return result.rows;
  },

  async getConversionAnalytics() {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_booking,
        SUM(CASE WHEN status = 'aktif' THEN 1 ELSE 0 END) as konversi_sukses,
        SUM(CASE WHEN status = 'kedaluwarsa' THEN 1 ELSE 0 END) as kedaluwarsa,
        SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) as ditolak,
        SUM(CASE WHEN status IN ('menunggu', 'dp_terkirim') THEN 1 ELSE 0 END) as pending
      FROM booking
    `);
    return result.rows[0];
  }
};
