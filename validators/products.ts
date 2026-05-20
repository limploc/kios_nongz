import { z } from 'zod';
import { paginationSchema } from './common.js';

const listProductsQuerySchema = paginationSchema.extend({
  q: z.string().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(['price', 'createdAt', 'name']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const listProductsSchema = z.object({
  query: listProductsQuerySchema,
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
