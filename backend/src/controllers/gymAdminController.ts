import { Request, Response } from 'express';
import { gymService } from '../services/gymService';
import { gymReviewService } from '../services/gymReviewService';

export const gymAdminController = {
    // GET /api/v1/admin/gyms/pending
    async getPendingGyms(req: Request, res: Response): Promise<void> {
        try {
            const gyms = await gymService.getPendingGyms();
            res.json({ success: true, gyms });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/admin/gyms
    async getAllGyms(req: Request, res: Response): Promise<void> {
        try {
            const gyms = await gymService.getAllGymsAdmin();
            res.json({ success: true, gyms });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // POST /api/v1/admin/gyms/:centerId/approve
    async approveGym(req: Request, res: Response): Promise<void> {
        try {
            const centerId = String(req.params.centerId);
            await gymService.approveGym(centerId);
            res.json({ success: true, message: 'Đã duyệt gym' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // POST /api/v1/admin/gyms/:centerId/reject
    async rejectGym(req: Request, res: Response): Promise<void> {
        try {
            const centerId = String(req.params.centerId);
            await gymService.rejectGym(centerId);
            res.json({ success: true, message: 'Đã từ chối gym' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // PUT /api/v1/admin/gyms/:centerId/suspend
    async suspendGym(req: Request, res: Response): Promise<void> {
        try {
            const centerId = String(req.params.centerId);
            await gymService.suspendGym(centerId);
            res.json({ success: true, message: 'Đã tạm khóa gym' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // PATCH /api/v1/admin/reviews/:reviewId/toggle
    async toggleReview(req: Request, res: Response): Promise<void> {
        try {
            const reviewId = String(req.params.reviewId);
            const review = await gymReviewService.toggleReviewVisibility(reviewId);
            res.json({ success: true, review });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },
};
