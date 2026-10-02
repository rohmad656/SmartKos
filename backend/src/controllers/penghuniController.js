import { PenghuniModel } from '../models/penghuniModel.js';

export const getPenghunis = async (req, res) => {
  try {
    const { kamar_id } = req.query;
    const penghunis = await PenghuniModel.getAll(kamar_id);
    return res.json({ data: penghunis, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getPenghuniById = async (req, res) => {
  try {
    const penghuni = await PenghuniModel.getById(req.params.id);
    if (!penghuni) {
      return res.status(404).json({ data: null, error: 'Penghuni not found' });
    }
    return res.json({ data: penghuni, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const createPenghuni = async (req, res) => {
  try {
    const newPenghuni = await PenghuniModel.create(req.body);
    return res.status(201).json({ data: newPenghuni, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const updatePenghuni = async (req, res) => {
  try {
    const updatedPenghuni = await PenghuniModel.update(req.params.id, req.body);
    if (!updatedPenghuni) {
      return res.status(404).json({ data: null, error: 'Penghuni not found' });
    }
    return res.json({ data: updatedPenghuni, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const deletePenghuni = async (req, res) => {
  try {
    const deletedPenghuni = await PenghuniModel.delete(req.params.id);
    if (!deletedPenghuni) {
      return res.status(404).json({ data: null, error: 'Penghuni not found' });
    }
    return res.json({ data: deletedPenghuni, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};
