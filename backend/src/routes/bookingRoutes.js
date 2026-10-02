import express from 'express';
import {
  getBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  setSurveiDate
} from '../controllers/bookingController.js';
import { validateBooking, validateBookingStatusUpdate, validateSurveiDate } from '../middlewares/kosValidator.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect(['admin']), getBookings);
router.get('/:id', protect(['admin', 'calon_penghuni']), getBookingById);
router.post('/', protect(['calon_penghuni']), validateBooking, createBooking);
router.put('/:id', protect(['admin']), validateBookingStatusUpdate, updateBookingStatus);
router.put('/:id/survei', protect(['admin']), validateSurveiDate, setSurveiDate);

export default router;
