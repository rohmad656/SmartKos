import { supabase } from '../config/db.js';

export const UserModel = {
  async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, nama, email, role, penghuni_id, created_at, updated_at')
      .eq('id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(data) {
    const { nama, email, passwordHash, role, penghuniId } = data;
    const { data: result, error } = await supabase
      .from('users')
      .insert([{
        nama,
        email,
        password_hash: passwordHash,
        role,
        penghuni_id: penghuniId || null
      }])
      .select('id, nama, email, role, penghuni_id, created_at, updated_at')
      .single();
    if (error) throw error;
    return result;
  }
};
