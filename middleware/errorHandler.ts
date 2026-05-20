import type { NextFunction, Request, Response } from 'express';

type AppError = Error & { statusCode?: number };

const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isUploadError = err.name === 'MulterError' || err.message === 'Invalid file type';
  const statusCode = err.statusCode || (isUploadError ? 400 : 500);
  const message = err.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] Error:`, err);

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.toString() }),
  });
};

export default errorHandler;
