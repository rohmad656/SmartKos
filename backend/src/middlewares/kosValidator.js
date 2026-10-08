import { check } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validate.js';
import { KamarModel } from '../models/kamarModel.js';

export const validateKamarCreate = [
  check('nomorKamar')
    .notEmpty().withMessage('Nomor kamar wajib diisi')
    .custom(async (value) => {
      const existing = await KamarModel.findByNomorKamar(value);
      if (existing) {
        throw new Error('Nomor kamar sudah terdaftar');
      }
    }),
  check('tipe').notEmpty().withMessage('Tipe kamar wajib diisi'),
  check('harga')
    .notEmpty().withMessage('Harga wajib diisi')
    .isFloat({ gt: 0 }).withMessage('Harga harus berupa angka lebih dari 0'),
  check('status').optional().isIn(['kosong', 'terisi', 'maintenance']).withMessage('Status tidak valid'),
  handleValidationErrors
];

export const validateKamarUpdate = [
  check('nomorKamar').notEmpty().withMessage('Nomor kamar wajib diisi'),
  check('tipe').notEmpty().withMessage('Tipe kamar wajib diisi'),
  check('harga')
    .notEmpty().withMessage('Harga wajib diisi')
    .isFloat({ gt: 0 }).withMessage('Harga harus berupa angka lebih dari 0'),
  check('status').optional().isIn(['kosong', 'terisi', 'maintenance']).withMessage('Status tidak valid'),
  handleValidationErrors
];

export const validateKamar = validateKamarCreate;

export const validatePenghuni = [
  check('nama').notEmpty().withMessage('Nama penghuni wajib diisi'),
  check('kontak').notEmpty().withMessage('Kontak wajib diisi'),
  check('email').optional().isEmail().withMessage('Format email tidak valid'),
  check('kamarId')
    .optional({ nullable: true })
    .isInt().withMessage('ID kamar harus integer')
    .custom(async (value) => {
      if (value) {
        const kamar = await KamarModel.getById(value);
        if (!kamar) {
          throw new Error('Kamar tidak ditemukan');
        }
      }
      return true;
    }),
  check('tanggalMulai').notEmpty().withMessage('Tanggal mulai wajib diisi').isISO8601().withMessage('Format tanggal mulai harus YYYY-MM-DD'),
  check('tanggalSelesai').optional({ nullable: true }).isISO8601().withMessage('Format tanggal selesai harus YYYY-MM-DD'),
  handleValidationErrors
];

export const validatePembayaran = [
  check('penghuniId').notEmpty().withMessage('Penghuni ID wajib diisi').isInt().withMessage('ID penghuni harus integer'),
  check('bulanTagihan').notEmpty().withMessage('Bulan tagihan wajib diisi').matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Format bulan tagihan harus YYYY-MM'),
  check('jumlah').isFloat({ gt: 0 }).withMessage('Jumlah harus lebih dari 0'),
  check('status').optional().isIn(['lunas', 'belum_lunas', 'terlambat']).withMessage('Status tidak valid'),
  handleValidationErrors
];

export const validatePembayaranUpdate = [
  check('bulanTagihan').optional().matches(/^\d{4}-(0[1-9]|1[0-2])$/).withMessage('Format bulan tagihan harus YYYY-MM'),
  check('jumlah').optional().isFloat({ gt: 0 }).withMessage('Jumlah harus lebih dari 0'),
  check('status').optional().isIn(['lunas', 'belum_lunas', 'terlambat']).withMessage('Status tidak valid'),
  handleValidationErrors
];

export const validatePerbaikan = [
  check('deskripsi').notEmpty().withMessage('Deskripsi wajib diisi'),
  check('kamarId').optional({ nullable: true }).isInt().withMessage('ID kamar harus integer'),
  handleValidationErrors
];

export const validatePerbaikanUpdate = [
  check('status').notEmpty().withMessage('Status wajib diisi').isIn(['pending', 'proses', 'selesai']).withMessage('Status harus: pending, proses, atau selesai'),
  handleValidationErrors
];

export const validatePengumuman = [
  check('judul').notEmpty().withMessage('Judul wajib diisi'),
  check('isi').notEmpty().withMessage('Isi pengumuman wajib diisi'),
  handleValidationErrors
];

export const validateBooking = [
  check('namaCalon').notEmpty().withMessage('Nama calon penghuni wajib diisi'),
  check('kontak').notEmpty().withMessage('Kontak wajib diisi'),
  check('kamarId').notEmpty().withMessage('ID kamar wajib diisi').isInt().withMessage('ID kamar harus integer')
    .custom(async (value) => {
      const kamar = await KamarModel.getById(value);
      if (!kamar) {
        throw new Error('Kamar tidak ditemukan');
      }
    }),
  handleValidationErrors
];

export const validateBookingStatusUpdate = [
  check('status').notEmpty().withMessage('Status wajib diisi').isIn(['menunggu', 'disetujui', 'dibatalkan']).withMessage('Status harus: menunggu, disetujui, atau dibatalkan'),
  handleValidationErrors
];

export const validateSurveiDate = [
  check('tanggalSurvei').notEmpty().withMessage('Tanggal survei wajib diisi').isISO8601().withMessage('Format tanggal survei harus YYYY-MM-DD'),
  handleValidationErrors
];

export const validatePesan = [
  check('penerimaId').notEmpty().withMessage('Penerima ID wajib diisi').isInt().withMessage('ID penerima harus integer'),
  check('isi').notEmpty().withMessage('Isi pesan wajib diisi'),
  handleValidationErrors
];
