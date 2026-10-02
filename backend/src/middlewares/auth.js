import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

export const protect = (roles = []) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    try {
      let token;

      if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
      } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({ data: null, error: 'No token provided' });
      }

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
