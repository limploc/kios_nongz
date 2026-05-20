import type { NextFunction, Request, Response } from 'express';
import * as cartService from '../services/cartService.js';
import type { AuthRequest } from '../types/auth.js';

type ServiceError = Error & { statusCode?: number };

class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const cart = await cartService.getCart(authReq.user.id);
      res.status(200).json(cart);
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const { productId, qty } = req.body as {
        productId: number;
        qty: number;
      };
      const cart = await cartService.addCartItem(
        authReq.user.id,
        Number(productId),
        Number(qty)
      );
      res.status(200).json(cart);
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const itemId = Number(req.params.id);
      const { qty } = req.body as { qty: number };
      const cart = await cartService.updateCartItem(
        authReq.user.id,
        itemId,
        Number(qty)
      );
      res.status(200).json(cart);
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const itemId = Number(req.params.id);
      const cart = await cartService.removeCartItem(authReq.user.id, itemId);
      res.status(200).json(cart);
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default CartController;
