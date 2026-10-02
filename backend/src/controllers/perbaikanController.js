import { PerbaikanModel } from '../models/perbaikanModel.js';

export const getPerbaikans = async (req, res) => {
  try {
    const penghuniId = req.user.role === 'penghuni' ? req.user.penghuni_id : null;
    const perbaikans = await PerbaikanModel.getAll(penghuniId);
    return res.json({ data: perbaikans, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getPerbaikanById = async (req, res) => {
  try {
    const perbaikan = await PerbaikanModel.getById(req.params.id);
    if (!perbaikan) {
      return res.status(404).json({ data: null, error: 'Perbaikan not found' });
    }
    
    if (req.user.role === 'penghuni' && perbaikan.penghuni_id !== req.user.penghuni_id) {
      return res.status(403).json({ data: null, error: 'Access denied' });
    }
    
    return res.json({ data: perbaikan, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const createPerbaikan = async (req, res) => {
  try {
    const { deskripsi, kamarId } = req.body;
    const penghuniId = req.user.penghuni_id;

    const newPerbaikan = await PerbaikanModel.create({
      penghuniId,
      kamarId,
      deskripsi
    });
    return res.status(201).json({ data: newPerbaikan, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const updatePerbaikan = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedPerbaikan = await PerbaikanModel.update(req.params.id, status);
    if (!updatedPerbaikan) {
      return res.status(404).json({ data: null, error: 'Perbaikan not found' });
    }
    return res.json({ data: updatedPerbaikan, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};
