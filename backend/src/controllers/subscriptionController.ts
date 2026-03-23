import { Request, Response } from 'express';
import { subscriptionService } from '../services/subscriptionService';
import { AppError } from '../utils/AppError';
import { verifySepayWebhookAuth } from '../utils/sepayWebhookAuth';

export const createCheckout = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const { program_id } = req.body;
        if (!program_id) return res.status(400).json({ error: 'program_id is required' });

        const session = await subscriptionService.createCheckoutSession(userId, program_id);
        res.json({ success: true, ...session });
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
        verifySepayWebhookAuth(req);

        await subscriptionService.handleSepayWebhook(req.body);
        res.json({ success: true });
    } catch (err: any) {
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({
                success: false,
                error: {
                    message: err.message,
                    code: err.code,
                },
            });
        }

        res.status(500).json({
            success: false,
            error: {
                message: err.message,
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
};
