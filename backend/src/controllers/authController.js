import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

export const register = async (req, res) => {
  try {
    const { nama, email, password, role, penghuniId } = req.body;

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ data: null, error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      nama,
      email,
      passwordHash,
      role: role || 'calon_penghuni',
      penghuniId: penghuniId || null
    });

    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    setTokenCookie(res, token);

    return res.status(201).json({
      data: { user: newUser },
      error: null
    });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(400).json({ data: null, error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ data: null, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    setTokenCookie(res, token);

    const { password_hash, ...userWithoutPassword } = user;

    return res.json({
      data: { user: userWithoutPassword },
      error: null
    });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};

export const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  return res.json({ data: { message: 'Logged out successfully' }, error: null });
};

export const getMe = async (req, res) => {
  try {
    return res.json({
      data: req.user,
      error: null
    });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
};
