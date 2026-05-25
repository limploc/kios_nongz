import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    const message = result.error.issues[0]?.message || 'Invalid request';
    return res.status(400).json({
      success: false,
      message,
    });
  }

  const parsed = result.data as {
    body?: typeof req.body;
    params?: typeof req.params;
    query?: typeof req.query;
  };

  req.body = parsed.body ?? req.body;
  req.params = parsed.params ?? req.params;
  req.query = parsed.query ?? req.query;

  next();
};

export default validate;
