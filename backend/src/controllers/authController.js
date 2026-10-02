import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

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

    return res.status(201).json({
      data: {
        user: newUser,
        token
      },
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

    const { password_hash, ...userWithoutPassword } = user;

    return res.json({
      data: {
        user: userWithoutPassword,
        token
      },
      error: null
    });
  } catch (error) {
    return res.status(500).json({ data: null, error: error.message });
  }
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
