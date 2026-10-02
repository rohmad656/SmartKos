import { PenghuniModel } from '../models/penghuniModel.js';

export const getPenghunis = async (req, res) => {
  try {
    const penghunis = await PenghuniModel.getAll();
    res.json({ data: penghunis });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getPenghuniById = async (req, res) => {
  try {
    const penghuni = await PenghuniModel.getById(req.params.id);
    if (!penghuni) return res.status(404).json({ message: 'Penghuni not found' });
    res.json({ data: penghuni });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const createPenghuni = async (req, res) => {
  try {
    const newPenghuni = await PenghuniModel.create(req.body);
    res.status(201).json({ message: 'Penghuni created successfully', data: newPenghuni });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updatePenghuni = async (req, res) => {
  try {
    const updatedPenghuni = await PenghuniModel.update(req.params.id, req.body);
    if (!updatedPenghuni) return res.status(404).json({ message: 'Penghuni not found' });
    res.json({ message: 'Penghuni updated successfully', data: updatedPenghuni });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deletePenghuni = async (req, res) => {
  try {
    const deletedPenghuni = await PenghuniModel.delete(req.params.id);
    if (!deletedPenghuni) return res.status(404).json({ message: 'Penghuni not found' });
    res.json({ message: 'Penghuni deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
