import pool from '../config/db.js';

export const PerbaikanModel = {
  async getAll(penghuniId = null) {
    let query = `SELECT p.*, penghuni.nama as nama_penghuni, k.nomor_kamar
                 FROM perbaikan p
                 LEFT JOIN penghuni ON p.penghuni_id = penghuni.id
                 LEFT JOIN kamar k ON p.kamar_id = k.id`;
    const params = [];

    if (penghuniId) {
      query += ' WHERE p.penghuni_id = $1';
      params.push(penghuniId);
    }

    query += ' ORDER BY p.created_at DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT p.*, penghuni.nama as nama_penghuni, k.nomor_kamar
       FROM perbaikan p
       LEFT JOIN penghuni ON p.penghuni_id = penghuni.id
       LEFT JOIN kamar k ON p.kamar_id = k.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { penghuniId, kamarId, deskripsi } = data;
    const result = await pool.query(
      `INSERT INTO perbaikan (penghuni_id, kamar_id, deskripsi, status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`,
      [penghuniId, kamarId, deskripsi]
    );
    return result.rows[0];
  },

  async update(id, status) {
    const result = await pool.query(
      `UPDATE perbaikan SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  }
};
