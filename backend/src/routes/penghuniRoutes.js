import express from 'express';
import {
  getPenghunis,
  getPenghuniById,
  createPenghuni,
  updatePenghuni,
  deletePenghuni
} from '../controllers/penghuniController.js';
import { validatePenghuni } from '../middlewares/kosValidator.js';

const router = express.Router();

router.get('/', getPenghunis);
router.get('/:id', getPenghuniById);
router.post('/', validatePenghuni, createPenghuni);
router.put('/:id', validatePenghuni, updatePenghuni);
router.delete('/:id', deletePenghuni);

export default router;
