import type { NextFunction, Request, Response } from 'express';
import { createError } from '../utils/errors.js';
import * as paymentService from '../services/paymentService.js';
import type { AuthRequest } from '../types/auth.js';

type ServiceError = Error & { statusCode?: number };

class PaymentController {
  static async uploadProof(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const { orderId } = req.body as { orderId: number };
      if (!req.file) {
        throw createError('File is required', 400);
      }
      const result = await paymentService.uploadProof(
        authReq.user.id,
        Number(orderId),
        req.file
      );
      res.status(200).json({ data: result });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default PaymentController;
