import { supabase } from '../config/db.js';

export const PengumumanModel = {
  async getAll() {
    const { data, error } = await supabase
      .from('pengumuman')
      .select('pengumuman.*, users.nama as dibuat_oleh_nama')
      .leftJoin('users', 'pengumuman.dibuat_oleh', 'users.id')
      .order('pengumuman.created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('pengumuman')
      .select('pengumuman.*, users.nama as dibuat_oleh_nama')
      .leftJoin('users', 'pengumuman.dibuat_oleh', 'users.id')
      .eq('pengumuman.id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(data) {
    const { judul, isi, dibuatOleh } = data;
    const { data: result, error } = await supabase
      .from('pengumuman')
      .insert([{
        judul,
        isi,
        dibuat_oleh: dibuatOleh
      }])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async delete(id) {
    const { data: result, error } = await supabase
      .from('pengumuman')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  }
};
