import type { NextFunction, Request, Response } from 'express';
import * as categoryService from '../services/categoryService.js';

type ServiceError = Error & { statusCode?: number };

class CategoryController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await categoryService.listCategories();
      res.status(200).json({ data: categories });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default CategoryController;
