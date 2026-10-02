import { BookingModel } from '../models/bookingModel.js';

export const getBookings = async (req, res) => {
  try {
    const { kamar_id } = req.query;
    const bookings = await BookingModel.getAll(kamar_id);
    return res.json({ data: bookings, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await BookingModel.getById(req.params.id);
    if (!booking) {
      return res.status(404).json({ data: null, error: 'Booking not found' });
    }
    return res.json({ data: booking, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { namaCalon, kontak, kamarId } = req.body;

    const newBooking = await BookingModel.create({
      namaCalon,
      kontak,
      kamarId
    });
    return res.status(201).json({ data: newBooking, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedBooking = await BookingModel.updateStatus(req.params.id, status);
    if (!updatedBooking) {
      return res.status(404).json({ data: null, error: 'Booking not found' });
    }
    return res.json({ data: updatedBooking, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const setSurveiDate = async (req, res) => {
  try {
    const { tanggalSurvei } = req.body;
    const updatedBooking = await BookingModel.setSurveiDate(req.params.id, tanggalSurvei);
    if (!updatedBooking) {
      return res.status(404).json({ data: null, error: 'Booking not found' });
    }
    return res.json({ data: updatedBooking, error: null });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};
