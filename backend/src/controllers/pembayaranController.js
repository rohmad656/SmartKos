import { PembayaranModel } from '../models/pembayaranModel.js';

const checkOwnership = async (req, pembayaranId) => {
  if (req.user.role === 'admin') return true;
  
  const pembayaran = await PembayaranModel.getById(pembayaranId);
  if (!pembayaran) return null;
  
  const userPenghuniId = req.user.penghuni_id;
  if (pembayaran.penghuni_id !== userPenghuniId) {
    return false;
  }
  return true;
};

export const getPembayarans = async (req, res) => {
  try {
    const { penghuni_id } = req.query;
    
    let penghuniId = penghuni_id;
    
    if (req.user.role === 'penghuni') {
      if (penghuniId && parseInt(penghuniId) !== req.user.penghuni_id) {
        return res.status(403).json({ data: null, error: 'Access denied: cannot view other penghuni payments' });
      }
      penghuniId = req.user.penghuni_id;
    }
    
    const pembayarans = await PembayaranModel.getAll(penghuniId);
    return res.json({ data: pembayarans, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getPembayaranById = async (req, res) => {
  try {
    const access = await checkOwnership(req, req.params.id);
    if (access === null) {
      return res.status(404).json({ data: null, error: 'Pembayaran not found' });
    }
    if (access === false) {
      return res.status(403).json({ data: null, error: 'Access denied' });
    }
    
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
    if (!updatedPembayaran) {
      return res.status(404).json({ data: null, error: 'Pembayaran not found' });
    }
    return res.json({ data: updatedPembayaran, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const payPembayaran = async (req, res) => {
  try {
    const access = await checkOwnership(req, req.params.id);
    if (access === null) {
      return res.status(404).json({ data: null, error: 'Pembayaran not found' });
    }
    if (access === false) {
      return res.status(403).json({ data: null, error: 'Access denied' });
    }

    const updated = await PembayaranModel.markAsPaid(req.params.id);
    return res.json({ data: updated, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const deletePembayaran = async (req, res) => {
  try {
    const deletedPembayaran = await PembayaranModel.delete(req.params.id);
    if (!deletedPembayaran) {
      return res.status(404).json({ data: null, error: 'Pembayaran not found' });
    }
    return res.json({ data: deletedPembayaran, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};
