import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { verifyRefreshToken } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { normalizeApiMessage } from '../utils/controllerUtils';

export const authController = {
    register: asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await authService.register(req.body);
            return res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            if (error.message === 'Email already registered') {
                throw new AppError(normalizeApiMessage(error.message), 409, 'EMAIL_ALREADY_REGISTERED');
            }
            throw error; // Will be caught by asyncHandler -> 500 Error Handler
        }
    }),

    login: asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await authService.login(req.body);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            throw new AppError(normalizeApiMessage(error.message || 'Invalid email or password'), 401, 'INVALID_CREDENTIALS');
        }
    }),

    refreshToken: asyncHandler(async (req: Request, res: Response) => {
        try {
            const { refresh_token } = req.body;
            const payload = verifyRefreshToken(refresh_token);
            const result = await authService.refreshToken(payload, refresh_token);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            throw new AppError(normalizeApiMessage(error.message || 'Invalid refresh token'), 401, 'INVALID_REFRESH_TOKEN');
        }
    }),

    logout: asyncHandler(async (req: Request, res: Response) => {
        await authService.logout(req.body?.refresh_token);
        return res.status(200).json({ success: true, data: { message: 'Đăng xuất thành công' } });
    }),

    getProfile: asyncHandler(async (req: Request, res: Response) => {
        try {
            const userId = req.user!.user_id;
            const profile = await authService.getProfile(userId);
            return res.status(200).json({ success: true, data: profile });
        } catch (error: any) {
            throw new AppError(normalizeApiMessage(error.message || 'User not found'), 404, 'USER_NOT_FOUND');
        }
    }),

    sendVerification: asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.sendVerificationEmail(req.user!.user_id);
        res.status(200).json({ success: true, data: result });
    }),

    verifyEmail: asyncHandler(async (req: Request, res: Response) => {
        try {
            const { token } = req.body;
            const result = await authService.verifyEmail(req.user!.user_id, token);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            throw new AppError(normalizeApiMessage(error.message || 'Verification failed'), 400, 'VERIFY_EMAIL_FAILED');
        }
    }),

    completeOnboarding: asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.completeOnboarding(req.user!.user_id, req.body);
        res.status(200).json({ success: true, data: { message: 'Hoàn tất thiết lập hồ sơ', user: result } });
    }),

    forgotPassword: asyncHandler(async (req: Request, res: Response) => {
        const result = await authService.forgotPassword(req.body.email);
        res.status(200).json({ success: true, data: result });
    }),

    resetPassword: asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await authService.resetPassword(req.body);
            res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            throw new AppError(normalizeApiMessage(error.message || 'Reset password failed'), 400, 'RESET_PASSWORD_FAILED');
        }
    }),
};
