import type { NextFunction, Request, Response } from 'express';
import * as orderService from '../services/orderService.js';
import type { AuthRequest } from '../types/auth.js';

type ServiceError = Error & { statusCode?: number };

class OrderController {
  static async checkout(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const result = await orderService.checkout(authReq.user.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const { page, limit, status } = req.query as {
        page?: number;
        limit?: number;
        status?: string;
      };

      const result = await orderService.listOrders(authReq.user.id, {
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
      const authReq = req as AuthRequest;
      const orderId = Number(req.params.id);
      const order = await orderService.getOrderDetail(authReq.user.id, orderId);
      res.status(200).json({ data: order });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default OrderController;
