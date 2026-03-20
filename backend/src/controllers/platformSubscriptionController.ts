import { Request, Response } from 'express';
import crypto from 'crypto';
import { platformSubscriptionService, PLAN_CONFIG, PlatformPlan } from '../services/platformSubscriptionService';
import redisClient from '../config/redis';

const VALID_PLANS: PlatformPlan[] = ['coach_pro', 'coach_elite', 'athlete_premium', 'gym_business'];

// ── User: get own plan ──────────────────────────────────────────────────────
export const getMyPlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await platformSubscriptionService.getMyPlan(req.user!.user_id);
        const billingEnabled = await platformSubscriptionService.isBillingEnabled();
        res.json({ success: true, ...result, billing_enabled: billingEnabled });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ── User: get pricing info (public) ────────────────────────────────────────
export const getPricingInfo = async (_req: Request, res: Response): Promise<void> => {
    const plans = Object.entries(PLAN_CONFIG).map(([key, config]) => ({
        plan: key,
        label: config.label,
        price: config.price,
        limits: config.limits,
    }));
    res.json({ success: true, plans });
};

// ── User: create checkout ──────────────────────────────────────────────────
export const createCheckout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { plan } = req.body as { plan: PlatformPlan };
        if (!VALID_PLANS.includes(plan)) {
            res.status(400).json({ error: 'Gói không hợp lệ' });
            return;
        }

        const billingEnabled = await platformSubscriptionService.isBillingEnabled();
        if (!billingEnabled) {
            res.status(400).json({ error: 'Hệ thống thu phí chưa được kích hoạt' });
            return;
        }

        const checkout = await platformSubscriptionService.createCheckout(req.user!.user_id, plan);
        res.json({ success: true, ...checkout });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ── User: cancel plan ──────────────────────────────────────────────────────
export const cancelMyPlan = async (req: Request, res: Response): Promise<void> => {
    try {
        await platformSubscriptionService.cancelPlan(req.user!.user_id);
        res.json({ success: true, message: 'Đã huỷ gói. Tài khoản trở về miễn phí.' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ── SePay Webhook (public — called by SePay) ────────────────────────────────
export const sepayPlatformWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const signature = req.headers['x-sepay-signature'] as string;
        const apiKey = req.headers['authorization'];
        const secret = process.env.SEPAY_WEBHOOK_SECRET;

        if (secret) {
            if (signature) {
                const rawBody = (req as any).rawBody;
                if (!rawBody) { res.status(400).json({ error: 'Missing raw body' }); return; }
                const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
                if (signature !== digest) { res.status(401).json({ error: 'Invalid signature' }); return; }
            } else if (apiKey !== secret) {
                res.status(401).json({ error: 'Unauthorized' }); return;
            }
        }

        const { content, amount, transaction_id } = req.body as {
            content?: string; amount?: number; transaction_id?: string;
        };

        // Parse description: GYMERVIET-PLAN-{PLAN}-{USER_SHORT}-{RANDOM}
        let targetUserId: string | null = null;
        let targetPlan: PlatformPlan | null = null;

        if (content) {
            try {
                // Try exact match from Redis first
                const redisData = await redisClient.get(`checkout:${content}`);
                if (redisData) {
                    const parsed = JSON.parse(redisData);
                    targetUserId = parsed.userId;
                    targetPlan = parsed.plan;
                    // Note: intentionally not deleting from Redis yet in case webhook fires multiple times
                }
            } catch (e) {
                console.warn('[platform-webhook] Redis read failed', e);
            }
        }

        // Fallback to old substring regex if Redis miss (for backwards compatibility)
        if (!targetUserId) {
            const match = content?.match(/GYMERVIET-PLAN-([A-Z_]+)-([A-Z0-9]+)/i);
            if (!match) {
                res.json({ success: true, ignored: true });
                return;
            }

            const planRaw = match[1].toLowerCase() as PlatformPlan;
            if (!VALID_PLANS.includes(planRaw)) {
                res.status(400).json({ error: 'Unknown plan in webhook' });
                return;
            }
            targetPlan = planRaw;

            const { AppDataSource } = await import('../config/database');
            const { User } = await import('../entities/User');
            const userShort = match[2].toUpperCase();
            const users = await AppDataSource
                .getRepository(User)
                .createQueryBuilder('u')
                .where("REPLACE(u.id::text, '-', '') ILIKE :prefix", { prefix: `${userShort}%` })
                .getMany();

            if (users.length !== 1) {
                console.error('[platform-webhook] ambiguous user match:', userShort, users.length);
                res.status(400).json({ error: 'Cannot uniquely identify user from transaction' });
                return;
            }
            targetUserId = users[0].id;
        }

        if (!targetUserId || !targetPlan) {
            res.status(400).json({ error: 'Failed to resolve user and plan' });
            return;
        }

        await platformSubscriptionService.activateFromWebhook(
            targetUserId,
            targetPlan,
            transaction_id ?? '',
            amount ?? 0,
        );

        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// ── Admin: get billing status ──────────────────────────────────────────────
export const getAdminBillingStatus = async (_req: Request, res: Response): Promise<void> => {
    try {
        const enabled = await platformSubscriptionService.isBillingEnabled();
        res.json({ success: true, billing_enabled: enabled });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// ── Admin: toggle billing ──────────────────────────────────────────────────
export const toggleAdminBilling = async (req: Request, res: Response): Promise<void> => {
    try {
        const { enabled } = req.body as { enabled: boolean };
        if (typeof enabled !== 'boolean') {
            res.status(400).json({ error: '`enabled` must be boolean' });
            return;
        }
        await platformSubscriptionService.setBillingEnabled(enabled);
        res.json({ success: true, billing_enabled: enabled });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// ── Admin: list paid subscriptions ────────────────────────────────────────
export const listAllPlatformSubs = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(String(req.query.page ?? '1'));
        const limit = parseInt(String(req.query.limit ?? '50'));
        const result = await platformSubscriptionService.listAll(page, limit);
        res.json({ success: true, ...result });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
