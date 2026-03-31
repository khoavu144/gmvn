import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscriptionService';

export const createCheckout = async (req: Request, res: Response) => {
    try {
        const { program_id } = req.body;
        if (!program_id) return res.status(400).json({ error: 'Thiếu mã chương trình.' });

        res.status(410).json({
            success: false,
            deprecated: true,
            error: 'Luồng thanh toán trong app đã ngừng. Hãy liên hệ trực tiếp với Coach để được hướng dẫn tham gia.',
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const createRelationship = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const { program_id, trainer_id, source, notes } = req.body;
        if (!program_id || !trainer_id) {
            return res.status(400).json({ error: 'Thiếu mã chương trình hoặc mã huấn luyện viên.' });
        }

        const subscription = await subscriptionService.createRelationship(
            userId,
            trainer_id,
            program_id,
            source || 'message',
            notes,
        );
        res.json({ success: true, subscription });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const checkSubscriptionStatus = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const { program_id } = req.query;

        const subs = await subscriptionService.getUserSubscriptions(userId);
        const isActive = subs.some(s => s.program_id === program_id && s.status === 'active');

        res.json({ success: true, isActive });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getMySubscriptions = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const subscriptions = await subscriptionService.getUserSubscriptions(userId);
        res.json({ success: true, subscriptions });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const cancelSubscription = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const { id } = req.params;
        const subscription = await subscriptionService.cancelSubscription(userId, String(id));
        res.json({ success: true, subscription });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const sepayWebhook = async (req: Request, res: Response) => {
    try {
        void req.body;
        res.json({
            success: true,
            ignored: true,
            deprecated: true,
            reason: 'subscription_payment_flow_disabled',
        });
    } catch (err: any) {
        res.status(500).json({
            success: false,
            error: {
                message: err.message,
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
};
