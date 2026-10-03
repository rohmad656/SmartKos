import express from 'express';
import { uploadFotoKamar } from '../controllers/uploadController.js';
import { protect } from '../middlewares/auth.js';
import { uploadMiddleware, handleUploadError } from '../middlewares/upload.js';

const router = express.Router();

router.post(
  '/foto-kamar',
  protect(['admin']),
  uploadMiddleware.single('file'),
  handleUploadError,
  uploadFotoKamar
);

export default router;
