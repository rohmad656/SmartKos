import express from 'express';
import {
  getPesans,
  createPesan,
  markPesanRead
} from '../controllers/pesanController.js';
import { validatePesan } from '../middlewares/kosValidator.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect(['admin', 'penghuni', 'calon_penghuni']), getPesans);
router.post('/', protect(['admin', 'penghuni', 'calon_penghuni']), validatePesan, createPesan);
router.put('/:id/read', protect(['admin', 'penghuni', 'calon_penghuni']), markPesanRead);

export default router;
