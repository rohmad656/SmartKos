import express from 'express';
import {
  getPembayarans,
  getPembayaranById,
  createPembayaran,
  updatePembayaran,
  deletePembayaran,
  payPembayaran
} from '../controllers/pembayaranController.js';
import { validatePembayaran, validatePembayaranUpdate } from '../middlewares/kosValidator.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect(['admin', 'penghuni']), getPembayarans);
router.get('/:id', protect(['admin', 'penghuni']), getPembayaranById);
router.post('/:id/bayar', protect(['admin', 'penghuni']), payPembayaran);
router.post('/', protect(['admin']), validatePembayaran, createPembayaran);
router.put('/:id', protect(['admin']), validatePembayaranUpdate, updatePembayaran);
router.delete('/:id', protect(['admin']), deletePembayaran);

export default router;
