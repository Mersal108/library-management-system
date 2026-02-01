import { z } from 'zod';

export const createBorrowerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
});

export const updateBorrowerSchema = z
  .object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().max(255).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export type CreateBorrowerDTO = z.infer<typeof createBorrowerSchema>;
export type UpdateBorrowerDTO = z.infer<typeof updateBorrowerSchema>;
