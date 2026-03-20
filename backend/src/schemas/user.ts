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

// ─── Coach Application ────────────────────────────────────────────────────
export const coachApplicationSchema = z.object({
    specialties: z.array(z.string().min(1)).min(1, 'Cần ít nhất 1 chuyên môn'),
    headline: z.string().min(10, 'Tiêu đề cần ít nhất 10 ký tự').max(120, 'Tiêu đề tối đa 120 ký tự'),
    base_price_monthly: z.number().min(0, 'Giá không hợp lệ').optional().nullable(),
    motivation: z.string().min(50, 'Lý do cần ít nhất 50 ký tự').max(1000, 'Tối đa 1000 ký tự'),
    certifications_note: z.string().max(500, 'Tối đa 500 ký tự').optional().nullable(),
});

export type CoachApplicationInput = z.infer<typeof coachApplicationSchema>;

export const rejectApplicationSchema = z.object({
    rejection_reason: z.string().min(10, 'Lý do cần ít nhất 10 ký tự').max(500),
});

export type RejectApplicationInput = z.infer<typeof rejectApplicationSchema>;
