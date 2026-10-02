import { check } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validate.js';

export const validateKamar = [
  check('nomorKamar').notEmpty().withMessage('Nomor kamar wajib diisi'),
  check('tipe').notEmpty().withMessage('Tipe kamar wajib diisi'),
  check('harga').isNumeric().withMessage('Harga harus berupa angka'),
  check('status').optional().isIn(['kosong', 'terisi', 'maintenance']).withMessage('Status tidak valid'),
  handleValidationErrors
];

export const validatePenghuni = [
  check('nama').notEmpty().withMessage('Nama penghuni wajib diisi'),
  check('kontak').notEmpty().withMessage('Kontak wajib diisi'),
  check('email').optional().isEmail().withMessage('Format email tidak valid'),
  check('kamarId').optional({ nullable: true }).isInt().withMessage('ID kamar harus integer'),
  check('tanggalMulai').isISO8601().withMessage('Format tanggal mulai harus YYYY-MM-DD'),
  check('tanggalSelesai').optional({ nullable: true }).isISO8601().withMessage('Format tanggal selesai harus YYYY-MM-DD'),
  handleValidationErrors
];
