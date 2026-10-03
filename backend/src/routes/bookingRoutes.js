import express from 'express';
import {
  getBookings,
  createBooking,
  uploadDPProof,
  verifyBooking,
  getPendingVerification,
  getConversionAnalytics
} from '../controllers/bookingController.js';
import { protect } from '../middlewares/auth.js';
import { validateBooking, validateBookingStatusUpdate } from '../middlewares/kosValidator.js';
import { uploadMiddleware, handleUploadError } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', protect(['admin', 'calon_penghuni']), getBookings);
router.post('/', protect(['calon_penghuni']), validateBooking, createBooking);

router.post(
  '/:id/bayar-dp',
  protect(['calon_penghuni']),
  uploadMiddleware.single('bukti_dp'),
  handleUploadError,
  uploadDPProof
);

router.put('/:id/verifikasi', protect(['admin']), verifyBooking);

router.get('/admin/pending', protect(['admin']), getPendingVerification);
router.get('/admin/analitik-konversi', protect(['admin']), getConversionAnalytics);

export default router;
