import { z } from 'zod';

export const addWishlistItemSchema = z.object({
  body: z.object({
    productId: z.coerce.number().int().positive(),
  }),
});

export const wishlistItemIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
