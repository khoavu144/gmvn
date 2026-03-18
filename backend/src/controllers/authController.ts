import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { verifyRefreshToken } from '../utils/jwt';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

export const authController = {
    register: asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await authService.register(req.body);
            return res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            if (error.message === 'Email already registered') {
                throw new AppError(error.message, 409);
            }
            throw error; // Will be caught by asyncHandler -> 500 Error Handler
        }
    }),

    login: asyncHandler(async (req: Request, res: Response) => {
        try {
            const result = await authService.login(req.body);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            throw new AppError(error.message || 'Invalid email or password', 401);
        }
    }),

    refreshToken: asyncHandler(async (req: Request, res: Response) => {
        try {
            const { refresh_token } = req.body;
            const payload = verifyRefreshToken(refresh_token);
            const result = await authService.refreshToken(payload, refresh_token);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            throw new AppError(error.message || 'Invalid refresh token', 401);
        }
    }),

    logout: asyncHandler(async (req: Request, res: Response) => {
        await authService.logout(req.body?.refresh_token);
        return res.status(200).json({ success: true, data: { message: 'Logged out' } });
    }),

    getProfile: asyncHandler(async (req: Request, res: Response) => {
        try {
            const userId = req.user!.user_id;
            const profile = await authService.getProfile(userId);
            return res.status(200).json({ success: true, data: profile });
        } catch (error: any) {
            throw new AppError(error.message || 'User not found', 404);
        }
    }),
};
