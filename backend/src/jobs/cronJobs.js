import { supabase } from '../config/db.js';

export const generateTagihanBulanan = async () => {
  try {
    const now = new Date();
    const bulanTagihan = now.toISOString().slice(0, 7);
    const todayStr = now.toISOString().split('T')[0];

    const { data: penghunis, error: errPenghuni } = await supabase
      .from('penghuni')
      .select('id, kamar_id, jatuh_tempo_hari')
      .or(`tanggal_selesai.is.null,tanggal_selesai.gte.${todayStr}`);

    if (errPenghuni) throw errPenghuni;

    const activePenghunis = (penghunis || []).filter(p => {
      if (!p.kamar_id) return false;
      return true;
    });

    let createdCount = 0;

    for (const ph of activePenghunis) {
      const { data: kamar, error: errKamar } = await supabase
        .from('kamar')
        .select('harga')
        .eq('id', ph.kamar_id)
        .single();
      if (errKamar || !kamar) continue;

      const hari = ph.jatuh_tempo_hari || 5;
      const jatuhTempo = new Date(now.getFullYear(), now.getMonth(), hari);
      const jatuhTempoStr = jatuhTempo.toISOString().split('T')[0];

      const { error: errInsert } = await supabase
        .from('pembayaran')
        .insert([{
          penghuni_id: ph.id,
          bulan_tagihan: bulanTagihan,
          jumlah: kamar.harga,
          status: 'belum_lunas',
          jatuh_tempo: jatuhTempoStr
        }])
        .select()
        .single();

      if (errInsert && errInsert.code !== '23505') {
        console.error('Insert tagihan error:', errInsert);
      } else if (!errInsert) {
        createdCount++;
      }
    }

    console.log(`[CRON] generateTagihanBulanan: ${createdCount} tagihan dibuat untuk ${bulanTagihan}`);
    return { bulanTagihan, createdCount };
  } catch (error) {
    console.error('[CRON] generateTagihanBulanan error:', error);
    throw error;
  }
};

export const cekKeterlambatan = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pembayaran')
      .update({ status: 'terlambat', updated_at: new Date().toISOString() })
      .eq('status', 'belum_lunas')
      .lt('jatuh_tempo', today)
      .select();

    if (error) throw error;
    const count = data?.length || 0;
    console.log(`[CRON] cekKeterlambatan: ${count} tagihan diubah jadi terlambat`);
    return { count };
  } catch (error) {
    console.error('[CRON] cekKeterlambatan error:', error);
    throw error;
  }
};

export const pengingatJatuhTempo = async () => {
  try {
    const today = new Date();
    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(today.getDate() + 2);
    const targetStr = twoDaysLater.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('pembayaran')
      .select('pembayaran.*, penghuni.nama as nama_penghuni, kamar.nomor_kamar')
      .eq('status', 'belum_lunas')
      .eq('jatuh_tempo', targetStr);

    if (error) throw error;

    const notifs = (data || []).map(p => ({
      penghuni_id: p.penghuni_id,
      bulan_tagihan: p.bulan_tagihan,
      jatuh_tempo: p.jatuh_tempo,
      jumlah: p.jumlah
    }));

    console.log(`[CRON] pengingatJatuhTempo: ${notifs.length} pengingat dikirim`);
    return notifs;
  } catch (error) {
    console.error('[CRON] pengingatJatuhTempo error:', error);
    throw error;
  }
};