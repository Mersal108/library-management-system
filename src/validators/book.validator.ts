import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1).max(255),
  author: z.string().min(1).max(255),
  isbn: z.string().regex(/^\d{13}$/, 'ISBN must be 13 digits'),
  total_quantity: z.number().int().positive().default(1),
  shelf_location: z.string().max(50).optional(),
});

export const updateBookSchema = z
  .object({
    title: z.string().min(1).max(255).optional(),
    author: z.string().min(1).max(255).optional(),
    total_quantity: z.number().int().positive().optional(),
    shelf_location: z.string().max(50).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type CreateBookDTO = z.infer<typeof createBookSchema>;
export type UpdateBookDTO = z.infer<typeof updateBookSchema>;
