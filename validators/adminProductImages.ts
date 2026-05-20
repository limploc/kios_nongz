import { z } from 'zod';

export const createProductImageSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    url: z.string().min(1),
    isPrimary: z.boolean().optional(),
  }),
});

export const updateProductImageSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    imageId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    url: z.string().min(1).optional(),
    isPrimary: z.boolean().optional(),
  }),
});

export const productImageIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
    imageId: z.coerce.number().int().positive(),
  }),
});
