import { KamarModel } from '../models/kamarModel.js';

export const getKamars = async (req, res) => {
  try {
    const kamars = await KamarModel.getAll();
    res.json({ data: kamars });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getKamarById = async (req, res) => {
  try {
    const kamar = await KamarModel.getById(req.params.id);
    if (!kamar) return res.status(404).json({ message: 'Kamar not found' });
    res.json({ data: kamar });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const createKamar = async (req, res) => {
  try {
    const newKamar = await KamarModel.create(req.body);
    res.status(201).json({ message: 'Kamar created successfully', data: newKamar });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateKamar = async (req, res) => {
  try {
    const updatedKamar = await KamarModel.update(req.params.id, req.body);
    if (!updatedKamar) return res.status(404).json({ message: 'Kamar not found' });
    res.json({ message: 'Kamar updated successfully', data: updatedKamar });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const deleteKamar = async (req, res) => {
  try {
    const deletedKamar = await KamarModel.delete(req.params.id);
    if (!deletedKamar) return res.status(404).json({ message: 'Kamar not found' });
    res.json({ message: 'Kamar deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
