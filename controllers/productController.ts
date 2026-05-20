import type { NextFunction, Request, Response } from 'express';
import * as productService from '../services/productService.js';

type ServiceError = Error & { statusCode?: number };

class ProductController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, q, categoryId, minPrice, maxPrice, sort, order } =
        req.query as {
          page?: number;
          limit?: number;
          q?: string;
          categoryId?: number;
          minPrice?: number;
          maxPrice?: number;
          sort?: 'price' | 'createdAt' | 'name';
          order?: 'asc' | 'desc';
        };

      const result = await productService.listProducts({
        page: page ?? 1,
        limit: limit ?? 10,
        q,
        categoryId,
        minPrice,
        maxPrice,
        sort,
        order,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async detail(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const product = await productService.getProductDetail(id);
      res.status(200).json({ data: product });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default ProductController;
