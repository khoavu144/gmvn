import { z } from 'zod';

export const updateProfileSchema = z.object({
    full_name: z.string().min(2, 'Full name must be at least 2 characters').optional(),
    avatar_url: z.string().url('Must be a valid URL').optional().nullable(),
    bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().nullable(),

    // Athlete fields
    height_cm: z.number().min(100).max(250).optional().nullable(),
    current_weight_kg: z.number().min(30).max(200).optional().nullable(),
    experience_level: z.enum(['beginner', 'intermediate', 'advanced']).optional().nullable(),

    // Trainer fields
    specialties: z.array(z.string()).optional().nullable(),
    base_price_monthly: z.number().min(0).optional().nullable(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
