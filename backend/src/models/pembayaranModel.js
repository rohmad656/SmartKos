import pool from '../config/db.js';

export const PembayaranModel = {
  async getAll(penghuniId = null) {
    let query = `SELECT p.*, penghuni.nama as nama_penghuni 
                 FROM pembayaran p
                 LEFT JOIN penghuni ON p.penghuni_id = penghuni.id`;
    const params = [];

    if (penghuniId) {
      query += ' WHERE p.penghuni_id = $1';
      params.push(penghuniId);
    }

    query += ' ORDER BY p.bulan_tagihan DESC, p.id DESC';
    const result = await pool.query(query, params);
    return result.rows;
  },

  async getById(id) {
    const result = await pool.query(
      `SELECT p.*, penghuni.nama as nama_penghuni 
       FROM pembayaran p
       LEFT JOIN penghuni ON p.penghuni_id = penghuni.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async create(data) {
    const { penghuniId, bulanTagihan, jumlah, status } = data;
    const result = await pool.query(
      `INSERT INTO pembayaran (penghuni_id, bulan_tagihan, jumlah, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [penghuniId, bulanTagihan, jumlah, status || 'belum_lunas']
    );
    return result.rows[0];
  },

  async update(id, data) {
    const { bulanTagihan, jumlah, status } = data;
    const result = await pool.query(
      `UPDATE pembayaran
       SET bulan_tagihan = $1, jumlah = $2, status = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [bulanTagihan, jumlah, status, id]
    );
    return result.rows[0];
  },

  async markAsPaid(id) {
    const result = await pool.query(
      `UPDATE pembayaran
       SET status = 'lunas', tanggal_bayar = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query('DELETE FROM pembayaran WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
};
