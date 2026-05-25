import type { NextFunction, Request, Response } from 'express';
import { createError } from '../utils/errors.js';
import * as uploadService from '../services/uploadService.js';
import type { AuthRequest } from '../types/auth.js';

type ServiceError = Error & { statusCode?: number };

class UploadController {
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      if (!req.file) {
        throw createError('File is required', 400);
      }

      const result = await uploadService.createUpload(authReq.user.id, req.file, {
        folder: 'uploads',
      });
      res.status(200).json(result);
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default UploadController;
