import pool from '../config/db.js';

export const PesanModel = {
  async getConversation(userId) {
    const result = await pool.query(
      `SELECT p.*, pengirim.nama as pengirim_nama, penerima.nama as penerima_nama
       FROM pesan p
       LEFT JOIN users pengirim ON p.pengirim_id = pengirim.id
       LEFT JOIN users penerima ON p.penerima_id = penerima.id
       WHERE p.pengirim_id = $1 OR p.penerima_id = $1
       ORDER BY p.created_at ASC`,
      [userId]
    );
    return result.rows;
  },

  async create(data) {
    const { pengirimId, penerimaId, isi } = data;
    const result = await pool.query(
      `INSERT INTO pesan (pengirim_id, penerima_id, isi)
       VALUES ($1, $2, $3) RETURNING *`,
      [pengirimId, penerimaId, isi]
    );
    return result.rows[0];
  },

  async markAsRead(id, penerimaId) {
    const result = await pool.query(
      `UPDATE pesan SET dibaca_pada = CURRENT_TIMESTAMP
       WHERE id = $1 AND penerima_id = $2 AND dibaca_pada IS NULL
       RETURNING *`,
      [id, penerimaId]
    );
    return result.rows[0];
  }
};