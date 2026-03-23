import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const RegisterSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    user_type: z.enum(['user', 'athlete', 'trainer', 'gym_owner']),
});

export const LoginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
});

export const RefreshTokenSchema = z.object({
    refresh_token: z.string().min(1, 'Refresh token is required'),
});

export const LogoutSchema = z.object({
    refresh_token: z.string().min(1, 'Refresh token is required').optional(),
});

export const SendVerificationSchema = z.object({}); // Just requires auth token

export const VerifyEmailSchema = z.object({
    token: z.string().length(6, 'Invalid verification code'),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email('Invalid email'),
});

export const ResetPasswordSchema = z.object({
    email: z.string().email('Invalid email'),
    token: z.string().length(6, 'Invalid reset code'),
    new_password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Generic validation middleware
export const validateRequest = (schema: z.ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.body);
            req.body = validated;
            next();
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: error.issues ?? error.errors ?? [],
                },
                requestId: req.id,
            });
        }
    };
};

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type LogoutInput = z.infer<typeof LogoutSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
