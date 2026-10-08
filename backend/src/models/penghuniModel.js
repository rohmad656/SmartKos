import { supabase } from '../config/db.js';

export const PenghuniModel = {
  async getAll(kamarId = null) {
    let query = supabase
      .from('penghuni')
      .select('penghuni.*, kamar.nomor_kamar')
      .leftJoin('kamar', 'penghuni.kamar_id', 'kamar.id');
    
    if (kamarId) {
      query = query.eq('penghuni.kamar_id', kamarId);
    }
    
    const { data, error } = await query.order('penghuni.id', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase.rpc('get_penghuni_with_kamar', { penghuni_id: id });
    if (error) {
      const { data: fallback, error: fallbackError } = await supabase
        .from('penghuni')
        .select('*')
        .eq('id', id)
        .single();
      if (fallbackError && fallbackError.code !== 'PGRST116') throw fallbackError;
      return fallback || null;
    }
    return data?.[0] || null;
  },

  async create(data) {
    const { nama, kontak, email, kamarId, tanggalMulai, tanggalSelesai } = data;
    const { data: result, error } = await supabase
      .from('penghuni')
      .insert([{
        nama,
        kontak,
        email,
        kamar_id: kamarId,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai
      }])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async update(id, data) {
    const { nama, kontak, email, kamarId, tanggalMulai, tanggalSelesai } = data;
    const { data: result, error } = await supabase
      .from('penghuni')
      .update({
        nama,
        kontak,
        email,
        kamar_id: kamarId,
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
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
      .from('penghuni')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  }
};
