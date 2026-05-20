import type { NextFunction, Request, Response } from 'express';
import * as adminOrderService from '../services/adminOrderService.js';

type ServiceError = Error & { statusCode?: number };

class AdminOrderController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, status } = req.query as {
        page?: number;
        limit?: number;
        status?: string;
      };

      const result = await adminOrderService.listOrders({
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
      const order = await adminOrderService.getOrderDetail(id);
      res.status(200).json({ data: order });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body as { status: string };
      const result = await adminOrderService.updateOrderStatus(id, status);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default AdminOrderController;
