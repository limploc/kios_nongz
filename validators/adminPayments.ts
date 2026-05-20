import { z } from 'zod';
import { paginationSchema } from './common.js';

const paymentStatusEnum = z.enum(['PENDING', 'PAID', 'REJECTED', 'EXPIRED']);

const listPaymentsQuerySchema = paginationSchema.extend({
  status: paymentStatusEnum.optional(),
});

export const listAdminPaymentsSchema = z.object({
  query: listPaymentsQuerySchema,
});

export const adminPaymentIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
