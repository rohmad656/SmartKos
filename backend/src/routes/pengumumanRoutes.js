import express from 'express';
import {
  getPengumumans,
  getPengumumanById,
  createPengumuman,
  deletePengumuman
} from '../controllers/pengumumanController.js';
import { validatePengumuman } from '../middlewares/kosValidator.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect(['admin', 'penghuni', 'calon_penghuni']), getPengumumans);
router.get('/:id', protect(['admin', 'penghuni', 'calon_penghuni']), getPengumumanById);
router.post('/', protect(['admin']), validatePengumuman, createPengumuman);
router.delete('/:id', protect(['admin']), deletePengumuman);

export default router;
