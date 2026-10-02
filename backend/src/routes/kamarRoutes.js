import express from 'express';
import {
  getKamars,
  getKamarById,
  createKamar,
  updateKamar,
  deleteKamar
} from '../controllers/kamarController.js';
import { validateKamar } from '../middlewares/kosValidator.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect(['admin', 'penghuni', 'calon_penghuni']), getKamars);
router.get('/:id', protect(['admin', 'penghuni', 'calon_penghuni']), getKamarById);
router.post('/', protect(['admin']), validateKamar, createKamar);
router.put('/:id', protect(['admin']), validateKamar, updateKamar);
router.delete('/:id', protect(['admin']), deleteKamar);

export default router;
