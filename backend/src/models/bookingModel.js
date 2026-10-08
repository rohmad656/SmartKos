import { supabase } from '../config/db.js';

export const BookingModel = {
  async getAll(status = null) {
    let query = supabase
      .from('booking')
      .select('booking.*, kamar.nomor_kamar, kamar.harga, kamar.status as kamar_status')
      .leftJoin('kamar', 'booking.kamar_id', 'kamar.id');
    
    if (status) {
      query = query.eq('booking.status', status);
    }
    
    const { data, error } = await query.order('booking.created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('booking')
      .select('booking.*, kamar.nomor_kamar, kamar.harga')
      .leftJoin('kamar', 'booking.kamar_id', 'kamar.id')
      .eq('booking.id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async create(data) {
    const { nama_calon, kontak, kamar_id, tanggal_survei } = data;
    const batas_waktu = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: result, error } = await supabase
      .from('booking')
      .insert([{
        nama_calon,
        kontak,
        kamar_id,
        tanggal_survei: tanggal_survei || null,
        status: 'menunggu',
        batas_waktu
      }])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async updateStatus(id, status) {
    const { data: result, error } = await supabase
      .from('booking')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async uploadDPProof(id, bukti_dp) {
    const { data: result, error } = await supabase
      .from('booking')
      .update({
        status: 'dp_terkirim',
        bukti_dp
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async getPendingVerification() {
    const { data, error } = await supabase
      .from('booking')
      .select('booking.*, kamar.nomor_kamar, kamar.harga')
      .leftJoin('kamar', 'booking.kamar_id', 'kamar.id')
      .eq('booking.status', 'dp_terkirim')
      .order('booking.created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async getExpiredBookings() {
    const { data, error } = await supabase
      .from('booking')
      .select('booking.*, kamar.id as kamar_id_ref')
      .leftJoin('kamar', 'booking.kamar_id', 'kamar.id')
      .in('booking.status', ['menunggu', 'dp_terkirim'])
      .lt('booking.batas_waktu', new Date().toISOString());
    if (error) throw error;
    return data || [];
  },

  async getConversionAnalytics() {
    const { data, error } = await supabase.rpc('get_booking_analytics');
    if (error) {
      const { data: fallback, error: fallbackError } = await supabase
        .from('booking')
        .select('status');
      if (fallbackError) throw fallbackError;
      
      const analytics = {
        total_booking: fallback.length,
        konversi_sukses: fallback.filter(b => b.status === 'aktif').length,
        kedaluwarsa: fallback.filter(b => b.status === 'kedaluwarsa').length,
        ditolak: fallback.filter(b => b.status === 'ditolak').length,
        pending: fallback.filter(b => ['menunggu', 'dp_terkirim'].includes(b.status)).length
      };
      return analytics;
    }
    return data?.[0] || {
      total_booking: 0,
      konversi_sukses: 0,
      kedaluwarsa: 0,
      ditolak: 0,
      pending: 0
    };
  }
};
