import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';

type AuthPayload = { id: number; email: string; role?: 'USER' | 'ADMIN' };

type AuthRequest = Request & { user: { id: number; email: string; role: 'USER' | 'ADMIN' } };

const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      success: false,
      message: 'JWT secret not configured',
    });
  }

  try {
    const payload = jwt.verify(token, secret) as AuthPayload;
    let role = payload.role;
    if (!role) {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { role: true },
      });
      role = user?.role ?? 'USER';
    }
    (req as AuthRequest).user = { id: payload.id, email: payload.email, role };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

export default auth;
