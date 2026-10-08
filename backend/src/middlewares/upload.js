import multer from 'multer';

const storage = multer.memoryStorage();

const MAGIC_BYTES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/jpg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46]
};

const validateMagicBytes = (buffer, mimeType) => {
  const bytes = MAGIC_BYTES[mimeType];
  if (!bytes) return false;
  
  for (let i = 0; i < bytes.length; i++) {
    if (buffer[i] !== bytes[i]) return false;
  }
  return true;
};

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, atau WebP.'), false);
  }
  
  cb(null, true);
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ 
        data: null, 
        error: 'File terlalu besar (max 5MB)',
        field: 'file'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        data: null, 
        error: 'Hanya 1 file yang diperbolehkan',
        field: 'file'
      });
    }
    return res.status(400).json({ 
      data: null, 
      error: err.message,
      field: 'file'
    });
  }
  if (err) {
    return res.status(400).json({ 
      data: null, 
      error: err.message,
      field: 'file'
    });
  }
  next();
};

export { validateMagicBytes };
