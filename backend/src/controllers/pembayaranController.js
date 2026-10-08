import { PembayaranModel } from '../models/pembayaranModel.js';
import { supabase } from '../config/db.js';
import crypto from 'crypto';

const checkOwnership = async (req, pembayaranId) => {
  if (req.user.role === 'admin') return true;
  const pembayaran = await PembayaranModel.getById(pembayaranId);
  if (!pembayaran) return null;
  if (pembayaran.penghuni_id !== req.user.penghuni_id) return false;
  return true;
};

export const getPembayarans = async (req, res) => {
  try {
    const { penghuni_id, status } = req.query;
    let penghuniId = penghuni_id;

    if (req.user.role === 'penghuni') {
      penghuniId = req.user.penghuni_id;
    }

    const pembayarans = await PembayaranModel.getAll(penghuniId, status);
    return res.json({ data: pembayarans, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getPembayaranSaya = async (req, res) => {
  try {
    if (!req.user.penghuni_id) {
      return res.status(400).json({ data: null, error: 'User tidak terhubung ke data penghuni' });
    }
    const pembayarans = await PembayaranModel.getAll(req.user.penghuni_id);
    return res.json({ data: pembayarans, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getPembayaranTerlambat = async (req, res) => {
  try {
    const data = await PembayaranModel.getTerlambat();
    return res.json({ data, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getPembayaranById = async (req, res) => {
  try {
    const access = await checkOwnership(req, req.params.id);
    if (access === null) return res.status(404).json({ data: null, error: 'Pembayaran tidak ditemukan' });
    if (access === false) return res.status(403).json({ data: null, error: 'Akses ditolak' });
    const pembayaran = await PembayaranModel.getById(req.params.id);
    return res.json({ data: pembayaran, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const createPembayaran = async (req, res) => {
  try {
    const newPembayaran = await PembayaranModel.create(req.body);
    return res.status(201).json({ data: newPembayaran, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const updatePembayaran = async (req, res) => {
  try {
    const updatedPembayaran = await PembayaranModel.update(req.params.id, req.body);
    if (!updatedPembayaran) return res.status(404).json({ data: null, error: 'Pembayaran tidak ditemukan' });
    return res.json({ data: updatedPembayaran, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const uploadBuktiPembayaran = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ data: null, error: 'File bukti transfer wajib diunggah', field: 'bukti' });
    }

    const pembayaran = await PembayaranModel.getById(id);
    if (!pembayaran) return res.status(404).json({ data: null, error: 'Pembayaran tidak ditemukan' });

    if (req.user.role === 'penghuni' && pembayaran.penghuni_id !== req.user.penghuni_id) {
      return res.status(403).json({ data: null, error: 'Akses ditolak: bukan tagihan milik Anda' });
    }

    if (!['belum_lunas', 'terlambat'].includes(pembayaran.status)) {
      return res.status(400).json({ data: null, error: `Tidak dapat upload bukti, status saat ini: ${pembayaran.status}` });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${id}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('bukti-bayar')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600'
      });

    if (uploadError) {
      return res.status(500).json({ data: null, error: 'Upload gagal: ' + uploadError.message });
    }

    const { data: publicData } = supabase.storage.from('bukti-bayar').getPublicUrl(fileName);
    const updated = await PembayaranModel.uploadBukti(id, publicData.publicUrl);
    return res.json({ data: updated, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const verifikasiPembayaran = async (req, res) => {
  try {
    const { id } = req.params;
    const { setuju, keterangan } = req.body;

    if (typeof setuju !== 'boolean') {
      return res.status(400).json({ data: null, error: 'Field setuju harus boolean', field: 'setuju' });
    }

    const pembayaran = await PembayaranModel.getById(id);
    if (!pembayaran) return res.status(404).json({ data: null, error: 'Pembayaran tidak ditemukan' });

    if (pembayaran.status !== 'menunggu_verifikasi') {
      return res.status(400).json({ data: null, error: `Status harus menunggu_verifikasi, saat ini: ${pembayaran.status}` });
    }

    const updated = await PembayaranModel.verifikasi(id, { setuju, keterangan });
    return res.json({ data: updated, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const payPembayaran = async (req, res) => {
  try {
    const access = await checkOwnership(req, req.params.id);
    if (access === null) return res.status(404).json({ data: null, error: 'Pembayaran tidak ditemukan' });
    if (access === false) return res.status(403).json({ data: null, error: 'Akses ditolak' });
    const updated = await PembayaranModel.markAsPaid(req.params.id);
    return res.json({ data: updated, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const deletePembayaran = async (req, res) => {
  try {
    const deletedPembayaran = await PembayaranModel.delete(req.params.id);
    if (!deletedPembayaran) return res.status(404).json({ data: null, error: 'Pembayaran tidak ditemukan' });
    return res.json({ data: deletedPembayaran, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};