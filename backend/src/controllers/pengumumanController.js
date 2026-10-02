import { PengumumanModel } from '../models/pengumumanModel.js';

export const getPengumumans = async (req, res) => {
  try {
    const pengumumans = await PengumumanModel.getAll();
    return res.json({ data: pengumumans, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getPengumumanById = async (req, res) => {
  try {
    const pengumuman = await PengumumanModel.getById(req.params.id);
    if (!pengumuman) {
      return res.status(404).json({ data: null, error: 'Pengumuman not found' });
    }
    return res.json({ data: pengumuman, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const createPengumuman = async (req, res) => {
  try {
    const { judul, isi } = req.body;
    const dibuatOleh = req.user.id;

    const newPengumuman = await PengumumanModel.create({
      judul,
      isi,
      dibuatOleh
    });
    return res.status(201).json({ data: newPengumuman, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const deletePengumuman = async (req, res) => {
  try {
    const deletedPengumuman = await PengumumanModel.delete(req.params.id);
    if (!deletedPengumuman) {
      return res.status(404).json({ data: null, error: 'Pengumuman not found' });
    }
    return res.json({ data: deletedPengumuman, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};
