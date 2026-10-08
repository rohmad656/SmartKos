import { KamarModel } from '../models/kamarModel.js';

export const getKamars = async (req, res) => {
  try {
    const { status } = req.query;
    const kamars = await KamarModel.getAll(status);
    return res.json({ data: kamars, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getKamarById = async (req, res) => {
  try {
    const kamar = await KamarModel.getById(req.params.id);
    if (!kamar) {
      return res.status(404).json({ data: null, error: 'Kamar not found' });
    }
    return res.json({ data: kamar, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const createKamar = async (req, res) => {
  try {
    console.log('Create kamar request:', req.body);

    const harga = parseFloat(req.body.harga);
    if (isNaN(harga) || harga <= 0) {
      return res.status(400).json({ 
        data: null, 
        error: 'Harga harus berupa angka positif',
        field: 'harga'
      });
    }

    const newKamar = await KamarModel.create({
      ...req.body,
      harga
    });
    return res.status(201).json({ data: newKamar, error: null });
  } catch (error) {
    console.error('Create kamar error:', error);
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const updateKamar = async (req, res) => {
  try {
    console.log('Update kamar request:', req.params.id, req.body);

    const harga = parseFloat(req.body.harga);
    if (isNaN(harga) || harga <= 0) {
      return res.status(400).json({ 
        data: null, 
        error: 'Harga harus berupa angka positif',
        field: 'harga'
      });
    }

    const updatedKamar = await KamarModel.update(req.params.id, {
      ...req.body,
      harga
    });
    if (!updatedKamar) {
      return res.status(404).json({ data: null, error: 'Kamar not found' });
    }
    return res.json({ data: updatedKamar, error: null });
  } catch (error) {
    console.error('Update kamar error:', error);
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const deleteKamar = async (req, res) => {
  try {
    const deletedKamar = await KamarModel.delete(req.params.id);
    if (!deletedKamar) {
      return res.status(404).json({ data: null, error: 'Kamar not found' });
    }
    return res.json({ data: deletedKamar, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};
