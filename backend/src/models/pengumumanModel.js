import pool from '../config/db.js';

export const PengumumanModel = {
  async getAll() {
    const result = await pool.query(
      `SELECT p.*, u.nama as dibuat_oleh_nama
       FROM pengumuman p
       LEFT JOIN users u ON p.dibuat_oleh = u.id
       ORDER BY p.created_at DESC`
    );
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT p.*, u.nama as dibuat_oleh_nama
       FROM pengumuman p
       LEFT JOIN users u ON p.dibuat_oleh = u.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { judul, isi, dibuatOleh } = data;
    const result = await pool.query(
      `INSERT INTO pengumuman (judul, isi, dibuat_oleh)
       VALUES ($1, $2, $3) RETURNING *`,
      [judul, isi, dibuatOleh]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM pengumuman WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
};
