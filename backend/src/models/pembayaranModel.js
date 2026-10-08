import { supabase } from '../config/db.js';

export const PembayaranModel = {
  async getAll(penghuniId = null, status = null) {
    let query = supabase
      .from('pembayaran')
      .select('pembayaran.*, penghuni.nama as nama_penghuni, penghuni.kamar_id, kamar.nomor_kamar')
      .leftJoin('penghuni', 'pembayaran.penghuni_id', 'penghuni.id')
      .leftJoin('kamar', 'penghuni.kamar_id', 'kamar.id');
    
    if (penghuniId) {
      query = query.eq('pembayaran.penghuni_id', penghuniId);
    }

    if (status) {
      query = query.eq('pembayaran.status', status);
    }
    
    const { data, error } = await query
      .order('pembayaran.bulan_tagihan', { ascending: false })
      .order('pembayaran.id', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('pembayaran')
      .select('pembayaran.*, penghuni.nama as nama_penghuni, penghuni.kamar_id, kamar.nomor_kamar')
      .leftJoin('penghuni', 'pembayaran.penghuni_id', 'penghuni.id')
      .leftJoin('kamar', 'penghuni.kamar_id', 'kamar.id')
      .eq('pembayaran.id', id)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  },

  async getTerlambat() {
    const { data, error } = await supabase
      .from('pembayaran')
      .select('pembayaran.*, penghuni.nama as nama_penghuni, penghuni.kontak as kontak_penghuni, kamar.nomor_kamar')
      .leftJoin('penghuni', 'pembayaran.penghuni_id', 'penghuni.id')
      .leftJoin('kamar', 'penghuni.kamar_id', 'kamar.id')
      .eq('pembayaran.status', 'terlambat')
      .order('pembayaran.jatuh_tempo', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async create(data) {
    const { penghuniId, bulanTagihan, jumlah, status, jatuhTempo, keterangan } = data;
    const { data: result, error } = await supabase
      .from('pembayaran')
      .insert([{
        penghuni_id: penghuniId,
        bulan_tagihan: bulanTagihan,
        jumlah,
        status: status || 'belum_lunas',
        jatuh_tempo: jatuhTempo || null,
        keterangan: keterangan || null
      }])
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async update(id, data) {
    const { bulanTagihan, jumlah, status, jatuhTempo, keterangan, buktiBayar, tanggalBayar } = data;
    const updatePayload = {
      updated_at: new Date().toISOString()
    };
    if (bulanTagihan !== undefined) updatePayload.bulan_tagihan = bulanTagihan;
    if (jumlah !== undefined) updatePayload.jumlah = jumlah;
    if (status !== undefined) updatePayload.status = status;
    if (jatuhTempo !== undefined) updatePayload.jatuh_tempo = jatuhTempo;
    if (keterangan !== undefined) updatePayload.keterangan = keterangan;
    if (buktiBayar !== undefined) updatePayload.bukti_bayar = buktiBayar;
    if (tanggalBayar !== undefined) updatePayload.tanggal_bayar = tanggalBayar;

    const { data: result, error } = await supabase
      .from('pembayaran')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async uploadBukti(id, buktiUrl) {
    const { data: result, error } = await supabase
      .from('pembayaran')
      .update({
        bukti_bayar: buktiUrl,
        status: 'menunggu_verifikasi',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  },

  async verifikasi(id, { setuju, keterangan }) {
    const updatePayload = {
      updated_at: new Date().toISOString(),
      keterangan: keterangan || null
    };

    if (setuju) {
      updatePayload.status = 'lunas';
      updatePayload.tanggal_bayar = new Date().toISOString();
    } else {
      updatePayload.status = 'belum_lunas';
    }

    const { data: result, error } = await supabase
      .from('pembayaran')
      .update(updatePayload)
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
