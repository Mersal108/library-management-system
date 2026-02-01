import { z } from 'zod';

export const checkoutSchema = z.object({
  book_id: z.number().int().positive(),
  borrower_id: z.number().int().positive(),
});

export type CheckoutDTO = z.infer<typeof checkoutSchema>;
