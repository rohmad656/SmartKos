import express from 'express';
import { register, login, logout, getMe, createUser } from '../controllers/authController.js';
import { validateRegister, validateLogin } from '../middlewares/authValidator.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', protect(), getMe);
router.post('/create-user', protect('admin'), validateRegister, createUser);

export default router;
