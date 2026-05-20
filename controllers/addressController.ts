import type { NextFunction, Request, Response } from 'express';
import * as addressService from '../services/addressService.js';
import type { AuthRequest } from '../types/auth.js';

type ServiceError = Error & { statusCode?: number };

class AddressController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const addresses = await addressService.listAddresses(authReq.user.id);
      res.status(200).json({ data: addresses });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const address = await addressService.createAddress(
        authReq.user.id,
        req.body
      );
      res.status(201).json({ data: address });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const id = Number(req.params.id);
      const address = await addressService.updateAddress(
        authReq.user.id,
        id,
        req.body
      );
      res.status(200).json({ data: address });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const id = Number(req.params.id);
      const address = await addressService.deleteAddress(authReq.user.id, id);
      res.status(200).json({ data: address });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default AddressController;
