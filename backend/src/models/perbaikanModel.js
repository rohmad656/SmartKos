import { supabase } from '../config/db.js';

export const PerbaikanModel = {
  async getAll(penghuniId = null) {
    let query = supabase
      .from('perbaikan')
      .select('perbaikan.*, penghuni.nama as nama_penghuni, kamar.nomor_kamar')
      .leftJoin('penghuni', 'perbaikan.penghuni_id', 'penghuni.id')
      .leftJoin('kamar', 'perbaikan.kamar_id', 'kamar.id');
    
    if (penghuniId) {
      query = query.eq('perbaikan.penghuni_id', penghuniId);
    }
    
    const { data, error } = await query.order('perbaikan.created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('perbaikan')
      .select('perbaikan.*, penghuni.nama as nama_penghuni, kamar.nomor_kamar')
      .leftJoin('penghuni', 'perbaikan.penghuni_id', 'penghuni.id')
      .leftJoin('kamar', 'perbaikan.kamar_id', 'kamar.id')
      .eq('perbaikan.id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(data) {
    const { penghuniId, kamarId, deskripsi } = data;
    const { data: result, error } = await supabase
      .from('perbaikan')
      .insert([{
        penghuni_id: penghuniId,
        kamar_id: kamarId,
        deskripsi,
        status: 'pending'
      }])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async update(id, status) {
    const { data: result, error } = await supabase
      .from('perbaikan')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  }
};
