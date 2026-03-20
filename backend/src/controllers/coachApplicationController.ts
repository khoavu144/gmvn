import { Request, Response } from 'express';
import { coachApplicationService } from '../services/coachApplicationService';
import { coachApplicationSchema, rejectApplicationSchema } from '../schemas/user';

class CoachApplicationController {
    /** POST /api/coach-applications — Athlete submits application */
    apply = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.user_id;
        if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }

        const parsed = coachApplicationSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, error: parsed.error.issues[0].message });
            return;
        }

        try {
            const application = await coachApplicationService.apply(userId, parsed.data);
            res.status(201).json({ success: true, application });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi khi nộp đơn';
            res.status(400).json({ success: false, error: message });
        }
    };

    /** GET /api/coach-applications/mine — Current user's application status */
    getMine = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.user_id;
        if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }

        try {
            const application = await coachApplicationService.getMyApplication(userId);
            res.json({ success: true, application });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
        }
    };

    /** GET /api/coach-applications — Admin: list pending applications */
    listPending = async (req: Request, res: Response): Promise<void> => {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;

        try {
            const result = await coachApplicationService.listPending(page, limit);
            res.json({ success: true, ...result });
        } catch (err) {
            res.status(500).json({ success: false, error: 'Lỗi máy chủ' });
        }
    };

    /** PATCH /api/coach-applications/:id/approve — Admin: approve */
    approve = async (req: Request, res: Response): Promise<void> => {
        const adminId = req.user?.user_id;
        if (!adminId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }

        try {
            const result = await coachApplicationService.approve(String(req.params.id), adminId);
            res.json(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi khi duyệt đơn';
            res.status(400).json({ success: false, error: message });
        }
    };

    /** PATCH /api/coach-applications/:id/reject — Admin: reject with reason */
    reject = async (req: Request, res: Response): Promise<void> => {
        const adminId = req.user?.user_id;
        if (!adminId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }

        const parsed = rejectApplicationSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, error: parsed.error.issues[0].message });
            return;
        }

        try {
            const result = await coachApplicationService.reject(String(req.params.id), adminId, parsed.data.rejection_reason);
            res.json(result);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Lỗi khi từ chối đơn';
            res.status(400).json({ success: false, error: message });
        }
    };
}

export const coachApplicationController = new CoachApplicationController();
