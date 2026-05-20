import type { NextFunction, Request, Response } from 'express';
import * as wishlistService from '../services/wishlistService.js';
import type { AuthRequest } from '../types/auth.js';

type ServiceError = Error & { statusCode?: number };

class WishlistController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const products = await wishlistService.getWishlist(authReq.user.id);
      res.status(200).json({ data: products });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async add(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const { productId } = req.body as { productId: number };
      const products = await wishlistService.addWishlistItem(
        authReq.user.id,
        Number(productId)
      );
      res.status(200).json({ data: products });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const productId = Number(req.params.id);
      const products = await wishlistService.removeWishlistItem(
        authReq.user.id,
        productId
      );
      res.status(200).json({ data: products });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default WishlistController;
