import express from 'express';
import {
  getPenghunis,
  getPenghuniById,
  createPenghuni,
  updatePenghuni,
  deletePenghuni
} from '../controllers/penghuniController.js';
import { validatePenghuni } from '../middlewares/kosValidator.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect(['admin']), getPenghunis);
router.get('/:id', protect(['admin', 'penghuni']), getPenghuniById);
router.post('/', protect(['admin']), validatePenghuni, createPenghuni);
router.put('/:id', protect(['admin']), validatePenghuni, updatePenghuni);
router.delete('/:id', protect(['admin']), deletePenghuni);

export default router;
