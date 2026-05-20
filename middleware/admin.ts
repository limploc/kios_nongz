import type { NextFunction, Request, Response } from 'express';
import type { AuthRequest } from '../types/auth.js';

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const authReq = req as AuthRequest;
  if (authReq.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden',
    });
  }
  next();
};

export default adminOnly;
