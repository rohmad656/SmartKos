import express from 'express';
import {
  getPerbaikans,
  getPerbaikanById,
  createPerbaikan,
  updatePerbaikan
} from '../controllers/perbaikanController.js';
import { validatePerbaikan, validatePerbaikanUpdate } from '../middlewares/kosValidator.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect(['admin', 'penghuni']), getPerbaikans);
router.get('/:id', protect(['admin', 'penghuni']), getPerbaikanById);
router.post('/', protect(['penghuni']), validatePerbaikan, createPerbaikan);
router.put('/:id', protect(['admin']), validatePerbaikanUpdate, updatePerbaikan);

export default router;
