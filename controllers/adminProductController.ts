import type { NextFunction, Request, Response } from 'express';
import * as adminProductService from '../services/adminProductService.js';
import { createError } from '../utils/errors.js';
import type { AuthRequest } from '../types/auth.js';

type ServiceError = Error & { statusCode?: number };

class AdminProductController {
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

      const result = await adminProductService.listProducts({
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

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await adminProductService.createProduct(req.body);
      res.status(201).json({ data: product });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const product = await adminProductService.updateProduct(id, req.body);
      res.status(200).json({ data: product });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const product = await adminProductService.deleteProduct(id);
      res.status(200).json({ data: product });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async addImage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const image = await adminProductService.addProductImage(id, req.body);
      res.status(201).json({ data: image });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async addImageUpload(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { isPrimary } = req.body as { isPrimary?: boolean };
      if (!req.file) {
        throw createError('File is required', 400);
      }

      const authReq = req as AuthRequest;
      const userId = authReq.user.id;
      const image = await adminProductService.addProductImageFromFile(
        id,
        userId,
        req.file,
        isPrimary
      );
      res.status(201).json({ data: image });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async updateImage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const imageId = Number(req.params.imageId);
      const image = await adminProductService.updateProductImage(
        id,
        imageId,
        req.body
      );
      res.status(200).json({ data: image });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async removeImage(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const imageId = Number(req.params.imageId);
      const result = await adminProductService.deleteProductImage(id, imageId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default AdminProductController;
