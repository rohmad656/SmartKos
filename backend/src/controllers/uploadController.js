import { supabase } from '../config/supabase.js';
import crypto from 'crypto';

export const uploadFotoKamar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ data: null, error: 'File tidak ditemukan' });
    }

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('kamar-fotos')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        cacheControl: '3600'
      });

    if (error) {
      throw new Error(error.message);
    }

    const { data: publicData } = supabase.storage
      .from('kamar-fotos')
      .getPublicUrl(fileName);

    return res.json({
      data: {
        url: publicData.publicUrl
      },
      error: null
    });
  } catch (error) {
    return res.status(500).json({
      data: null,
      error: error.message
    });
  }
};
