import { z } from 'zod';
import { paginationSchema } from './common.js';

const orderStatusEnum = z.enum([
  'PENDING',
  'PAID',
  'PROCESSING',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
]);

const listOrdersQuerySchema = paginationSchema.extend({
  status: orderStatusEnum.optional(),
});

export const listAdminOrdersSchema = z.object({
  query: listOrdersQuerySchema,
});

export const adminOrderIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: orderStatusEnum,
  }),
});
