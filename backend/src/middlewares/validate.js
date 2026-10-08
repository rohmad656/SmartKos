import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({ 
      data: null,
      error: firstError.msg,
      field: firstError.path || firstError.param,
      errors: errors.array() 
    });
  }
  next();
};
