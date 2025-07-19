import z from 'zod';

export const userSchema = z.object({
  id: z
    .string()
    .min(1)
    .refine((v) => !isNaN(Number(v)), {
      message: 'id must be a number',
    }),

  createdAt: z.string(),
  updatedAt: z.string().optional(),
});
