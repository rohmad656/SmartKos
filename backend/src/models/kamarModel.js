import { supabase } from '../config/db.js';

export const KamarModel = {
  async getAll(status = null) {
    let query = supabase.from('kamar').select('*');
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query.order('id', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('kamar')
      .select('*')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async findByNomorKamar(nomorKamar) {
    const { data, error } = await supabase
      .from('kamar')
      .select('*')
      .eq('nomor_kamar', nomorKamar)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(data) {
    const { nomorKamar, tipe, harga, status, deskripsi, fotoUrl } = data;
    const { data: result, error } = await supabase
      .from('kamar')
      .insert([{
        nomor_kamar: nomorKamar,
        tipe,
        harga,
        status: status || 'kosong',
        deskripsi,
        foto_url: fotoUrl
      }])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async update(id, data) {
    const { nomorKamar, tipe, harga, status, deskripsi, fotoUrl } = data;
    const { data: result, error } = await supabase
      .from('kamar')
      .update({
        nomor_kamar: nomorKamar,
        tipe,
        harga,
        status,
        deskripsi,
        foto_url: fotoUrl,
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
      .from('kamar')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  }
};
