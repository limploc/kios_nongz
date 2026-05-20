import { z } from 'zod';

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive(),
    qty: z.coerce.number().int().positive(),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    qty: z.coerce.number().int().positive(),
  }),
});

export const cartItemIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
