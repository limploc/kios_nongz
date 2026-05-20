import type { NextFunction, Request, Response } from 'express';
import * as adminCategoryService from '../services/adminCategoryService.js';

type ServiceError = Error & { statusCode?: number };

class AdminCategoryController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await adminCategoryService.listCategories();
      res.status(200).json({ data: categories });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await adminCategoryService.createCategory(req.body);
      res.status(201).json({ data: category });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const category = await adminCategoryService.updateCategory(id, req.body);
      res.status(200).json({ data: category });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const category = await adminCategoryService.deleteCategory(id);
      res.status(200).json({ data: category });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default AdminCategoryController;
