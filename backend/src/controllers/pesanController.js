import { PesanModel } from '../models/pesanModel.js';

export const getPesans = async (req, res) => {
  try {
    const pesans = await PesanModel.getConversation(req.user.id);
    return res.json({ data: pesans, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const createPesan = async (req, res) => {
  try {
    const { penerimaId, isi } = req.body;

    const newPesan = await PesanModel.create({
      pengirimId: req.user.id,
      penerimaId,
      isi
    });
    return res.status(201).json({ data: newPesan, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const markPesanRead = async (req, res) => {
  try {
    const updatedPesan = await PesanModel.markAsRead(req.params.id, req.user.id);
    if (!updatedPesan) {
      return res.status(404).json({ data: null, error: 'Pesan not found or already read' });
    }
    return res.json({ data: updatedPesan, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};