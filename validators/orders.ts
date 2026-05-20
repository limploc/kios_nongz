import { z } from 'zod';
import { paginationSchema } from './common.js';

const listOrdersQuerySchema = paginationSchema.extend({
  status: z.string().optional(),
});

export const listOrdersSchema = z.object({
  query: listOrdersQuerySchema,
});

export const checkoutSchema = z.object({
  body: z.object({
    addressId: z.coerce.number().int().positive(),
    paymentMethod: z.string().min(1),
    notes: z.string().optional(),
  }),
});

export const orderIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
