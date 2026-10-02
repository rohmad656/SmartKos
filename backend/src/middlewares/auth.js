import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

export const protect = (roles = []) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ data: null, error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

      const user = await UserModel.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ data: null, error: 'User no longer exists' });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        return res.status(403).json({ data: null, error: 'Access denied' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ data: null, error: 'Invalid or expired token' });
    }
  };
};
