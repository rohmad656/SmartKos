import pool from '../config/db.js';

export const KamarModel = {
  async getAll() {
    const result = await pool.query('SELECT * FROM kamar ORDER BY id DESC');
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query('SELECT * FROM kamar WHERE id = $1', [id]);
    return result.rows[0];
  },

  async create(data) {
    const { nomorKamar, tipe, harga, status, deskripsi, fotoUrl } = data;
    const result = await pool.query(
      `INSERT INTO kamar (nomor_kamar, tipe, harga, status, deskripsi, foto_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [nomorKamar, tipe, harga, status || 'kosong', deskripsi, fotoUrl]
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { nomorKamar, tipe, harga, status, deskripsi, fotoUrl } = data;
    const result = await pool.query(
      `UPDATE kamar
       SET nomor_kamar = $1, tipe = $2, harga = $3, status = $4, deskripsi = $5, foto_url = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [nomorKamar, tipe, harga, status, deskripsi, fotoUrl, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM kamar WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};
