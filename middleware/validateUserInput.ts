import type { NextFunction, Request, Response } from 'express';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Name is required',
    });
  }

  if (!email || email.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  if (!password || password === '') {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  next();
};

const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as {
    email?: string;
    password?: string;
  };

  if (!email || email.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Email is required',
    });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format',
    });
  }

  if (!password || password === '') {
    return res.status(400).json({
      success: false,
      message: 'Password is required',
    });
  }

  next();
};

const validateEdit = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (name !== undefined && name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Name cannot be empty',
    });
  }

  if (email !== undefined) {
    if (email.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Email cannot be empty',
      });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }
  }

  if (password !== undefined && password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters',
    });
  }

  next();
};

export { validateEdit, validateLogin, validateRegister };
