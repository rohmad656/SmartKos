import express from 'express';
import {
  getPembayarans,
  getPembayaranById,
  getPembayaranSaya,
  getPembayaranTerlambat,
  createPembayaran,
  updatePembayaran,
  deletePembayaran,
  payPembayaran,
  uploadBuktiPembayaran,
  verifikasiPembayaran
} from '../controllers/pembayaranController.js';
import { validatePembayaran, validatePembayaranUpdate } from '../middlewares/kosValidator.js';
import { protect } from '../middlewares/auth.js';
import { uploadMiddleware, handleUploadError } from '../middlewares/upload.js';

const router = express.Router();

router.get('/saya', protect(['penghuni']), getPembayaranSaya);
router.get('/terlambat', protect(['admin']), getPembayaranTerlambat);
router.get('/', protect(['admin', 'penghuni']), getPembayarans);
router.get('/:id', protect(['admin', 'penghuni']), getPembayaranById);

router.post('/:id/bukti', protect(['penghuni', 'admin']), uploadMiddleware.single('bukti'), handleUploadError, uploadBuktiPembayaran);
router.put('/:id/verifikasi', protect(['admin']), verifikasiPembayaran);
router.post('/:id/bayar', protect(['admin', 'penghuni']), payPembayaran);

router.post('/', protect(['admin']), validatePembayaran, createPembayaran);
router.put('/:id', protect(['admin']), validatePembayaranUpdate, updatePembayaran);
router.delete('/:id', protect(['admin']), deletePembayaran);

export default router;