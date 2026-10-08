import { BookingModel } from '../models/bookingModel.js';
import { KamarModel } from '../models/kamarModel.js';
import { supabase } from '../config/db.js';

export const getBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const bookings = await BookingModel.getAll(status);
    return res.json({ data: bookings, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { nama_calon, kontak, kamar_id, tanggal_survei } = req.body;
    
    const kamar = await KamarModel.getById(kamar_id);
    if (!kamar || kamar.status !== 'kosong') {
      return res.status(400).json({ data: null, error: 'Kamar tidak tersedia' });
    }

    const booking = await BookingModel.create({
      nama_calon,
      kontak,
      kamar_id,
      tanggal_survei
    });

    return res.status(201).json({ data: booking, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const uploadDPProof = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ data: null, error: 'Bukti DP harus diunggah' });
    }

    const booking = await BookingModel.getById(id);
    if (!booking) {
      return res.status(404).json({ data: null, error: 'Booking tidak ditemukan' });
    }

    if (booking.status !== 'menunggu') {
      return res.status(400).json({ data: null, error: 'Booking tidak dalam status menunggu' });
    }

    const bukti_dp = req.file.originalname;
    const updated = await BookingModel.uploadDPProof(id, bukti_dp);

    return res.json({ data: updated, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const verifyBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body;

    const booking = await BookingModel.getById(id);
    if (!booking) {
      return res.status(404).json({ data: null, error: 'Booking tidak ditemukan' });
    }

    if (booking.status !== 'dp_terkirim') {
      return res.status(400).json({ data: null, error: 'Booking harus berstatus dp_terkirim' });
    }

    if (!approve) {
      const rejected = await BookingModel.updateStatus(id, 'ditolak');
      await KamarModel.update(booking.kamar_id, { status: 'kosong' });
      return res.json({ data: rejected, error: null });
    }

    const bulanTagihan = new Date().toISOString().slice(0, 7);

    // 1. Create penghuni
    const { data: penghuni, error: errPenghuni } = await supabase
      .from('penghuni')
      .insert([{
        nama: booking.nama_calon,
        kontak: booking.kontak,
        kamar_id: booking.kamar_id,
        tanggal_mulai: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (errPenghuni) throw errPenghuni;

    // 2. Create user for penghuni
    const { error: errUser } = await supabase
      .from('users')
      .insert([{
        nama: booking.nama_calon,
        email: `penghuni_${booking.id}@smartkos.local`,
        password_hash: 'temp_pass',
        role: 'penghuni',
        penghuni_id: penghuni.id,
        is_active: true
      }]);

    if (errUser) throw errUser;

    // 3. Update kamar status
    const { error: errKamar } = await supabase
      .from('kamar')
      .update({ status: 'terisi' })
      .eq('id', booking.kamar_id);

    if (errKamar) throw errKamar;

    // 4. Create pembayaran
    const { error: errPembayaran } = await supabase
      .from('pembayaran')
      .insert([{
        penghuni_id: penghuni.id,
        bulan_tagihan: bulanTagihan,
        jumlah: booking.harga,
        status: 'belum_lunas'
      }]);

    if (errPembayaran) throw errPembayaran;

    // 5. Update booking status
    const { data: updated, error: errBooking } = await supabase
      .from('booking')
      .update({ status: 'aktif' })
      .eq('id', id)
      .select()
      .single();

    if (errBooking) throw errBooking;

    return res.json({ data: updated, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getPendingVerification = async (req, res) => {
  try {
    const bookings = await BookingModel.getPendingVerification();
    return res.json({ data: bookings, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getConversionAnalytics = async (req, res) => {
  try {
    const analytics = await BookingModel.getConversionAnalytics();
    return res.json({ data: analytics, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const expireBookings = async () => {
  try {
    const expiredBookings = await BookingModel.getExpiredBookings();

    for (const booking of expiredBookings) {
      await supabase
        .from('booking')
        .update({ status: 'kedaluwarsa' })
        .eq('id', booking.id);

      await supabase
        .from('kamar')
        .update({ status: 'kosong' })
        .eq('id', booking.kamar_id_ref);
    }

    console.log(`[CRON] Expired ${expiredBookings.length} bookings`);
  } catch (error) {
    console.error('[CRON] Error expiring bookings:', error);
  }
};
