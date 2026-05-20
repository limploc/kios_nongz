import type { NextFunction, Request, Response } from 'express';
import * as paymentService from '../services/paymentService.js';

type ServiceError = Error & { statusCode?: number };

class AdminPaymentController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status } = req.query as {
        page?: number;
        limit?: number;
        status?: string;
      };

      const result = await paymentService.listPayments({
        page: page ?? 1,
        limit: limit ?? 10,
        status,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const payment = await paymentService.getPaymentDetail(id);
      res.status(200).json({ data: payment });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await paymentService.approvePayment(id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const result = await paymentService.rejectPayment(id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default AdminPaymentController;
