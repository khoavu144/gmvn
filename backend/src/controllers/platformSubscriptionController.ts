import { Request, Response } from 'express';
import {
    platformSubscriptionService,
    FULL_ACCESS_LIMITS,
    type PlatformPlan,
} from '../services/platformSubscriptionService';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const DISABLED_REASON = 'Thu phí nền tảng đã bị vô hiệu hóa vĩnh viễn.';
const FREE_PLATFORM_PLAN = {
    plan: 'free' as PlatformPlan,
    label: 'Miễn phí',
    price: 0,
    limits: FULL_ACCESS_LIMITS,
};

export const getMyPlan = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await platformSubscriptionService.getMyPlan(req.user!.user_id);
    res.json({ success: true, ...result, billing_enabled: false });
});

export const getPricingInfo = async (_req: Request, res: Response): Promise<void> => {
    res.json({
        success: true,
        billing_enabled: false,
        deprecated: true,
        plans: [FREE_PLATFORM_PLAN],
    });
};

export const createCheckout = asyncHandler(async (_req: Request, _res: Response): Promise<void> => {
    throw new AppError(DISABLED_REASON, 400, 'BILLING_DISABLED');
});

export const cancelMyPlan = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.json({
        success: true,
        billing_enabled: false,
        deprecated: true,
        message: 'Không có gói nền tảng trả phí nào đang hoạt động.',
    });
});

export const sepayPlatformWebhook = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
        success: true,
        ignored: true,
        billing_enabled: false,
        reason: 'platform_billing_disabled',
    });
};

export const getAdminBillingStatus = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.json({ success: true, billing_enabled: false, deprecated: true, mode: 'disabled' });
});

export const toggleAdminBilling = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.json({
        success: true,
        billing_enabled: false,
        deprecated: true,
        message: DISABLED_REASON,
    });
});

export const listAllPlatformSubs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '50'), 10) || 50));
    res.json({
        success: true,
        deprecated: true,
        billing_enabled: false,
        items: [],
        pagination: { page, limit, total: 0, pages: 0 },
        message: DISABLED_REASON,
    });
});

export const listCheckoutIntents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '50'), 10) || 50));
    res.json({
        success: true,
        deprecated: true,
        billing_enabled: false,
        items: [],
        pagination: { page, limit, total: 0, pages: 0 },
        message: DISABLED_REASON,
    });
});

export const listWebhookEvents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '50'), 10) || 50));
    res.json({
        success: true,
        deprecated: true,
        billing_enabled: false,
        items: [],
        pagination: { page, limit, total: 0, pages: 0 },
        message: DISABLED_REASON,
    });
});

export const reconcileBilling = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.json({
        success: true,
        deprecated: true,
        billing_enabled: false,
        processed: 0,
        message: DISABLED_REASON,
    });
});
