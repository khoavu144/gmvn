import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const RegisterSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
    full_name: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    user_type: z.enum(['user', 'athlete', 'trainer', 'gym_owner']),
});

export const LoginSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export const RefreshTokenSchema = z.object({
    refresh_token: z.string().min(1, 'Thiếu refresh token'),
});

export const LogoutSchema = z.object({
    refresh_token: z.string().min(1, 'Thiếu refresh token').optional(),
});

export const SendVerificationSchema = z.object({}); // Just requires auth token

export const VerifyEmailSchema = z.object({
    token: z.string().length(6, 'Mã xác thực không hợp lệ'),
});

export const ForgotPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
});

export const ResetPasswordSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    token: z.string().length(6, 'Mã đặt lại mật khẩu không hợp lệ'),
    new_password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự'),
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
                    message: 'Dữ liệu gửi lên không hợp lệ',
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
