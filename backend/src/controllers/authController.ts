import { Request, Response } from 'express';
import { authService } from '../services/authService';
import { verifyRefreshToken } from '../utils/jwt';

export const authController = {
    async register(req: Request, res: Response) {
        try {
            const result = await authService.register(req.body);
            return res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            const statusCode = error.message === 'Email already registered' ? 409 : 500;
            return res.status(statusCode).json({
                success: false,
                error: error.message,
            });
        }
    },

    async login(req: Request, res: Response) {
        try {
            const result = await authService.login(req.body);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(401).json({
                success: false,
                error: error.message,
            });
        }
    },

    async refreshToken(req: Request, res: Response) {
        try {
            const { refresh_token } = req.body;
            const payload = verifyRefreshToken(refresh_token);
            const result = await authService.refreshToken(payload.user_id, payload.email, payload.user_type);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(401).json({
                success: false,
                error: 'Invalid refresh token',
            });
        }
    },

    async logout(_req: Request, res: Response) {
        // In a production app, we'd invalidate tokens in Redis
        return res.status(200).json({ success: true, data: { message: 'Logged out' } });
    },

    async getProfile(req: Request, res: Response) {
        try {
            const userId = req.user!.user_id;
            const profile = await authService.getProfile(userId);
            return res.status(200).json({ success: true, data: profile });
        } catch (error: any) {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }
    },
};
