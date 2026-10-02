import express from 'express';
import {
  getKamars,
  getKamarById,
  createKamar,
  updateKamar,
  deleteKamar
} from '../controllers/kamarController.js';
import { validateKamar } from '../middlewares/kosValidator.js';

const router = express.Router();

router.get('/', getKamars);
router.get('/:id', getKamarById);
router.post('/', validateKamar, createKamar);
router.put('/:id', validateKamar, updateKamar);
router.delete('/:id', deleteKamar);

export default router;
