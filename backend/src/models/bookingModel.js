import pool from '../config/db.js';

export const BookingModel = {
  async getAll(kamarId = null) {
    let query = `SELECT b.*, k.nomor_kamar, k.tipe, k.harga
                 FROM booking b
                 LEFT JOIN kamar k ON b.kamar_id = k.id`;
    const params = [];

    if (kamarId) {
      query += ' WHERE b.kamar_id = $1';
      params.push(kamarId);
    }

    query += ' ORDER BY b.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT b.*, k.nomor_kamar, k.tipe, k.harga
       FROM booking b
       LEFT JOIN kamar k ON b.kamar_id = k.id
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { namaCalon, kontak, kamarId } = data;
    const result = await pool.query(
      `INSERT INTO booking (nama_calon, kontak, kamar_id, status)
       VALUES ($1, $2, $3, 'menunggu') RETURNING *`,
      [namaCalon, kontak, kamarId]
    );
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      `UPDATE booking SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  async setSurveiDate(id, tanggalSurvei) {
    const result = await pool.query(
      `UPDATE booking SET tanggal_survei = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [tanggalSurvei, id]
    );
    return result.rows[0];
  }
};
