import type { NextFunction, Request, Response } from 'express';
import * as adminDashboardService from '../services/adminDashboardService.js';

type ServiceError = Error & { statusCode?: number };

class AdminDashboardController {
  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminDashboardService.getDashboardStats();
      res.status(200).json({ data: stats });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default AdminDashboardController;
