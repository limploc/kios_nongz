import { z } from 'zod';

export const emptyQuerySchema = z.object({
  query: z.object({}).optional(),
});
