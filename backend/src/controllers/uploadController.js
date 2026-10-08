import { supabase } from '../config/db.js';
import crypto from 'crypto';
import { validateMagicBytes } from '../middlewares/upload.js';

export const uploadFotoKamar = async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      mimetype: req.file?.mimetype,
      size: req.file?.size,
      originalname: req.file?.originalname
    });

    if (!req.file) {
      return res.status(400).json({ 
        data: null, 
        error: 'File tidak ditemukan',
        field: 'file'
      });
    }

    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ 
        data: null, 
        error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.',
        field: 'file'
      });
    }

    if (!validateMagicBytes(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({ 
        data: null, 
        error: 'File tidak valid atau rusak',
        field: 'file'
      });
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
      console.error('Supabase upload error:', error);
      throw new Error(error.message);
    }

    const { data: publicData } = supabase.storage
      .from('kamar-fotos')
      .getPublicUrl(fileName);

    console.log('Upload success:', publicData.publicUrl);

    return res.json({
      data: {
        url: publicData.publicUrl
      },
      error: null
    });
  } catch (error) {
    console.error('Upload controller error:', error);
    return res.status(500).json({
      data: null,
      error: error.message
    });
  }
};
