import { Request, Response } from 'express';
import { userService } from '../services/userService';

export const userController = {
    async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.user!.user_id;
            const result = await userService.updateProfile(userId, req.body);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    },

    async getTrainers(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const searchParam = req.query.search;
            const search = typeof searchParam === 'string' ? searchParam : undefined;

            const result = await userService.getTrainers(page, limit, search);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    },

    async getTrainerDetail(req: Request, res: Response) {
        try {
            const id = req.params.id as string;
            const result = await userService.getTrainerById(id);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }
    },
};
