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

export const listAdminProductsSchema = z.object({
  query: listProductsQuerySchema,
});

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.coerce.number().int().positive(),
    name: z.string().min(1),
    description: z.string().optional().nullable(),
    price: z.coerce.number().int().nonnegative(),
    stock: z.coerce.number().int().nonnegative(),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    categoryId: z.coerce.number().int().positive().optional(),
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    price: z.coerce.number().int().nonnegative().optional(),
    stock: z.coerce.number().int().nonnegative().optional(),
  }),
});

export const productIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const uploadProductImageSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    isPrimary: z.coerce.boolean().optional(),
  }),
});
