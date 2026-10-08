import { supabase } from '../config/db.js';

export const PembayaranModel = {
  async getAll(penghuniId = null) {
    let query = supabase
      .from('pembayaran')
      .select('pembayaran.*, penghuni.nama as nama_penghuni')
      .leftJoin('penghuni', 'pembayaran.penghuni_id', 'penghuni.id');
    
    if (penghuniId) {
      query = query.eq('pembayaran.penghuni_id', penghuniId);
    }
    
    const { data, error } = await query.order('pembayaran.bulan_tagihan', { ascending: false }).order('pembayaran.id', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('pembayaran')
      .select('pembayaran.*, penghuni.nama as nama_penghuni')
      .leftJoin('penghuni', 'pembayaran.penghuni_id', 'penghuni.id')
      .eq('pembayaran.id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(data) {
    const { penghuniId, bulanTagihan, jumlah, status } = data;
    const { data: result, error } = await supabase
      .from('pembayaran')
      .insert([{
        penghuni_id: penghuniId,
        bulan_tagihan: bulanTagihan,
        jumlah,
        status: status || 'belum_lunas'
      }])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async update(id, data) {
    const { bulanTagihan, jumlah, status } = data;
    const { data: result, error } = await supabase
      .from('pembayaran')
      .update({
        bulan_tagihan: bulanTagihan,
        jumlah,
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async markAsPaid(id) {
    const { data: result, error } = await supabase
      .from('pembayaran')
      .update({
        status: 'lunas',
        tanggal_bayar: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async delete(id) {
    const { data: result, error } = await supabase
      .from('pembayaran')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  }
};
