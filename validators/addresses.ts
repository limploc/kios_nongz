import { z } from 'zod';

const addressBodySchema = z.object({
  label: z.string().optional(),
  recipientName: z.string().min(1),
  phone: z.string().min(6),
  addressLine: z.string().min(1),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().min(1),
  isDefault: z.boolean().optional(),
});

export const createAddressSchema = z.object({
  body: addressBodySchema,
});

export const updateAddressSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: addressBodySchema,
});

export const addressIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});
