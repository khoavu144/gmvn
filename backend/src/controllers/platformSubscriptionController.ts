import { Request, Response } from 'express';
import crypto from 'crypto';
import { platformSubscriptionService, PLAN_CONFIG, PlatformPlan } from '../services/platformSubscriptionService';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const VALID_PLANS: PlatformPlan[] = ['coach_pro', 'coach_elite', 'athlete_premium', 'gym_business'];

// ── User: get own plan ──────────────────────────────────────────────────────
export const getMyPlan = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await platformSubscriptionService.getMyPlan(req.user!.user_id);
    const billingEnabled = await platformSubscriptionService.isBillingEnabled();
    res.json({ success: true, ...result, billing_enabled: billingEnabled });
});

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
export const createCheckout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { plan } = req.body as { plan: PlatformPlan };
    if (!VALID_PLANS.includes(plan)) {
        throw new AppError('Gói không hợp lệ', 400);
    }

    const billingEnabled = await platformSubscriptionService.isBillingEnabled();
    if (!billingEnabled) {
        throw new AppError('Hệ thống thu phí chưa được kích hoạt', 400);
    }

    const checkout = await platformSubscriptionService.createCheckout(req.user!.user_id, plan);
    res.json({ success: true, ...checkout });
});

// ── User: cancel plan ──────────────────────────────────────────────────────
export const cancelMyPlan = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await platformSubscriptionService.cancelPlan(req.user!.user_id);
    res.json({ success: true, message: 'Đã huỷ gói. Tài khoản trở về miễn phí.' });
});

// ── SePay Webhook (public — called by SePay) ────────────────────────────────
export const sepayPlatformWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['x-sepay-signature'] as string;
    const apiKey = req.headers['authorization'];
    const secret = process.env.SEPAY_WEBHOOK_SECRET;
    const body = (req.body ?? {}) as {
        content?: string;
        amount?: number;
        transaction_id?: string;
    };

    const event = await platformSubscriptionService.recordWebhookEvent({
        provider: 'sepay',
        providerTransactionId: body.transaction_id ?? null,
        transferContent: body.content ?? null,
        signature: signature ?? null,
        payload: body as Record<string, unknown>,
    });

    try {
        if (secret) {
            if (signature) {
                const rawBody = (req as any).rawBody;
                if (!rawBody) {
                    throw new AppError('Missing raw body', 400, 'WEBHOOK_RAW_BODY_MISSING');
                }
                const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
                if (signature !== digest) {
                    throw new AppError('Invalid signature', 401, 'WEBHOOK_INVALID_SIGNATURE');
                }
            } else if (apiKey !== secret) {
                throw new AppError('Unauthorized', 401, 'WEBHOOK_UNAUTHORIZED');
            }
        }

        if (!body.content?.trim()) {
            throw new AppError('Missing transfer content', 400, 'WEBHOOK_TRANSFER_CONTENT_REQUIRED');
        }

        if (!body.transaction_id?.trim()) {
            throw new AppError('Missing transaction id', 400, 'WEBHOOK_TRANSACTION_ID_REQUIRED');
        }

        const result = await platformSubscriptionService.activateFromWebhook(
            body.content,
            body.transaction_id,
            body.amount ?? 0,
        );

        await platformSubscriptionService.finalizeWebhookEvent(
            event.id,
            result.ignored ? 'ignored' : 'processed',
            { result },
        );

        res.json({ success: true, ...result });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await platformSubscriptionService.finalizeWebhookEvent(event.id, 'failed', { payload: body }, message);
        throw error;
    }
});

// ── Admin: get billing status ──────────────────────────────────────────────
export const getAdminBillingStatus = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const enabled = await platformSubscriptionService.isBillingEnabled();
    res.json({ success: true, billing_enabled: enabled });
});

// ── Admin: toggle billing ──────────────────────────────────────────────────
export const toggleAdminBilling = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { enabled } = req.body as { enabled: boolean };
    if (typeof enabled !== 'boolean') {
        throw new AppError('`enabled` must be boolean', 400);
    }
    await platformSubscriptionService.setBillingEnabled(enabled);
    res.json({ success: true, billing_enabled: enabled });
});

// ── Admin: list paid subscriptions ────────────────────────────────────────
export const listAllPlatformSubs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = parseInt(String(req.query.limit ?? '50'), 10);
    const result = await platformSubscriptionService.listAll(page, limit);
    res.json({ success: true, ...result });
});

export const listCheckoutIntents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = parseInt(String(req.query.limit ?? '50'), 10);
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const result = await platformSubscriptionService.listCheckoutIntents(page, limit, { status });
    res.json({ success: true, ...result });
});

export const listWebhookEvents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(String(req.query.page ?? '1'), 10);
    const limit = parseInt(String(req.query.limit ?? '50'), 10);
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const result = await platformSubscriptionService.listWebhookEvents(page, limit, { status });
    res.json({ success: true, ...result });
});

export const reconcileBilling = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const result = await platformSubscriptionService.reconcileCheckoutIntents();
    res.json({ success: true, ...result });
});
