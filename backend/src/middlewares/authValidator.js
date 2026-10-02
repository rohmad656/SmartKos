import { check } from 'express-validator';
import { handleValidationErrors } from './validate.js';

export const validateRegister = [
  check('nama').notEmpty().withMessage('Nama wajib diisi'),
  check('email').isEmail().withMessage('Format email tidak valid'),
  check('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  check('role').optional().isIn(['admin', 'penghuni', 'calon_penghuni']).withMessage('Role tidak valid'),
  check('penghuniId').optional({ nullable: true }).isInt().withMessage('Penghuni ID harus integer'),
  handleValidationErrors
];

export const validateLogin = [
  check('email').isEmail().withMessage('Format email tidak valid'),
  check('password').notEmpty().withMessage('Password wajib diisi'),
  handleValidationErrors
];
