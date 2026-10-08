import { supabase } from '../config/db.js';

export const PesanModel = {
  async getConversation(userId) {
    const { data, error } = await supabase
      .from('pesan')
      .select('pesan.*, pengirim:users!pengirim_id(nama), penerima:users!penerima_id(nama)')
      .or(`pengirim_id.eq.${userId},penerima_id.eq.${userId}`)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []).map(row => ({
      ...row,
      pengirim_nama: row.pengirim?.nama,
      penerima_nama: row.penerima?.nama
    }));
  },

  async create(data) {
    const { pengirimId, penerimaId, isi } = data;
    const { data: result, error } = await supabase
      .from('pesan')
      .insert([{
        pengirim_id: pengirimId,
        penerima_id: penerimaId,
        isi
      }])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async markAsRead(id, penerimaId) {
    const { data: result, error } = await supabase
      .from('pesan')
      .update({
        dibaca_pada: new Date().toISOString()
      })
      .eq('id', id)
      .eq('penerima_id', penerimaId)
      .is('dibaca_pada', null)
      .select()
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return result || null;
  }
};