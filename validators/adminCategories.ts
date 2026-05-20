import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(1),
    iconUrl: z.string().url().optional().nullable(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    name: z.string().min(1).optional(),
    iconUrl: z.string().url().optional().nullable(),
  }),
});

export const categoryIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
