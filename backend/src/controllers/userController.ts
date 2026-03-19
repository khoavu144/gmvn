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
            const search = typeof req.query.search === 'string' ? req.query.search : undefined;

            // Sprint 2: filter params
            const specialty = typeof req.query.specialty === 'string' ? req.query.specialty : undefined;
            const priceMin = req.query.priceMin !== undefined ? Number(req.query.priceMin) : undefined;
            const priceMax = req.query.priceMax !== undefined ? Number(req.query.priceMax) : undefined;
            const city = typeof req.query.city === 'string' ? req.query.city : undefined;
            const sort = (req.query.sort as 'newest' | 'price_asc' | 'price_desc') || 'newest';
            const user_type = (req.query.user_type as 'trainer' | 'athlete') || 'trainer';

            const result = await userService.getTrainers(page, limit, search, specialty, priceMin, priceMax, city, sort, user_type);
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

    async getTrainerBySlug(req: Request, res: Response) {
        try {
            const slug = req.params.slug as string;
            const result = await userService.getTrainerBySlug(slug);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }
    },

    async getUserBySlug(req: Request, res: Response) {
        try {
            const slug = req.params.slug as string;
            const result = await userService.getUserBySlug(slug);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }
    },

    async getSimilarCoaches(req: Request, res: Response) {
        try {
            const trainerId = req.params.id as string;
            const limit = parseInt(req.query.limit as string) || 3;
            const targetUserType = req.query.user_type as 'trainer' | 'athlete' | undefined;
            const result = await userService.getSimilarCoaches(trainerId, limit, targetUserType);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    },

    async getTestimonials(req: Request, res: Response) {
        try {
            const trainerId = req.params.id as string;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const result = await userService.getTestimonials(trainerId, page, limit);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    },

    async getBeforeAfterPhotos(req: Request, res: Response) {
        try {
            const trainerId = req.params.id as string;
            const result = await userService.getBeforeAfterPhotos(trainerId);
            return res.status(200).json({ success: true, data: result });
        } catch (error: any) {
            return res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    },
};
