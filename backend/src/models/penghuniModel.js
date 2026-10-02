import pool from '../config/db.js';

export const PenghuniModel = {
  async getAll(kamarId = null) {
    let query = `SELECT p.*, k.nomor_kamar FROM penghuni p
                 LEFT JOIN kamar k ON p.kamar_id = k.id`;
    const params = [];

    if (kamarId) {
      query += ' WHERE p.kamar_id = $1';
      params.push(kamarId);
    }

    query += ' ORDER BY p.id DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT p.*, k.nomor_kamar FROM penghuni p
       LEFT JOIN kamar k ON p.kamar_id = k.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { nama, kontak, email, kamarId, tanggalMulai, tanggalSelesai } = data;
    const result = await pool.query(
      `INSERT INTO penghuni (nama, kontak, email, kamar_id, tanggal_mulai, tanggal_selesai)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nama, kontak, email, kamarId, tanggalMulai, tanggalSelesai]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { nama, kontak, email, kamarId, tanggalMulai, tanggalSelesai } = data;
    const result = await pool.query(
      `UPDATE penghuni
       SET nama = $1, kontak = $2, email = $3, kamar_id = $4, tanggal_mulai = $5, tanggal_selesai = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [nama, kontak, email, kamarId, tanggalMulai, tanggalSelesai, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM penghuni WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};
