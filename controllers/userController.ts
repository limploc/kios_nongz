import type { NextFunction, Request, Response } from 'express';
import * as userService from '../services/userService.js';

type AuthRequest = Request & { user: { id: number; email: string } };

type ServiceError = Error & { statusCode?: number };

class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.registerUser(req.body);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        token: result.token,
        data: result.user,
      });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.loginUser(req.body);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        token: result.token,
        data: result.user,
      });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const user = await userService.getProfile(authReq.user.id);
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error as ServiceError);
    }
  }

  static async editProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authReq = req as AuthRequest;
      const updatedUser = await userService.editProfile(
        authReq.user.id,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
      });
    } catch (error) {
      next(error as ServiceError);
    }
  }
}

export default UserController;
