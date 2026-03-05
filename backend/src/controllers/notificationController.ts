import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';

export const notificationController = {
    // GET /api/v1/notifications
    async getMyNotifications(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.user_id;
            const result = await notificationService.getByUser(userId);
            res.json({ success: true, ...result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // PATCH /api/v1/notifications/:id/read
    async markRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.user_id;
            const notifId = String(req.params.id);
            await notificationService.markRead(notifId, userId);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // PATCH /api/v1/notifications/read-all
    async markAllRead(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.user_id;
            await notificationService.markAllRead(userId);
            res.json({ success: true });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
};
