import pool from '../config/db.js';

export const UserModel = {
  async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT id, nama, email, role, penghuni_id, created_at, updated_at 
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { nama, email, passwordHash, role, penghuniId } = data;
    const result = await pool.query(
      `INSERT INTO users (nama, email, password_hash, role, penghuni_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nama, email, role, penghuni_id, created_at, updated_at`,
      [nama, email, passwordHash, role, penghuniId || null]
    );
    return result.rows[0];
  }
};
