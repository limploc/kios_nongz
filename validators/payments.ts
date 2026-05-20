import { z } from 'zod';

export const uploadPaymentProofSchema = z.object({
  body: z.object({
    orderId: z.coerce.number().int().positive(),
  }),
});
