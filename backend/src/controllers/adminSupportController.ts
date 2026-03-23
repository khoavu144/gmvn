import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { asAppError, getSingleParam } from '../utils/controllerUtils';
import { emailOutboxService } from '../services/emailOutboxService';
import { authService } from '../services/authService';
import { platformSubscriptionService } from '../services/platformSubscriptionService';
import { systemHealthService } from '../services/systemHealthService';

export const listEmailOutbox = asyncHandler(async (req: Request, res: Response) => {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? '50'), 10) || 50));
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const emailType = typeof req.query.email_type === 'string' ? req.query.email_type : undefined;

    const result = await emailOutboxService.list(page, limit, { status, emailType });
    res.json({ success: true, ...result });
});

export const retryEmailOutboxRecord = asyncHandler(async (req: Request, res: Response) => {
    const id = getSingleParam(req.params.id);
    const record = await emailOutboxService.retryRecord(id);
    if (!record) {
        throw new AppError('Không tìm thấy email outbox record', 404, 'EMAIL_OUTBOX_NOT_FOUND');
    }

    res.json({ success: true, record });
});

export const resendVerificationForUser = asyncHandler(async (req: Request, res: Response) => {
    try {
        const userId = getSingleParam(req.params.userId);
        const result = await authService.sendVerificationEmail(userId);
        res.json({ success: true, data: result });
    } catch (error) {
        throw asAppError(error, 400, 'Không thể gửi lại email xác thực', 'ADMIN_RESEND_VERIFICATION_ERROR');
    }
});

export const getBillingOpsOverview = asyncHandler(async (req: Request, res: Response) => {
    const windowMinutesRaw = parseInt(String(req.query.window_minutes ?? '60'), 10);
    const windowMinutes = Number.isFinite(windowMinutesRaw)
        ? Math.min(24 * 60, Math.max(5, windowMinutesRaw))
        : 60;

    const [health, outbox, billing] = await Promise.all([
        systemHealthService.getSnapshot(),
        emailOutboxService.getOpsSummary(),
        platformSubscriptionService.getOpsOverview(windowMinutes),
    ]);

    res.json({
        success: true,
        summary: {
            health_status: health.status,
            health_checks: health.checks,
            outbox,
            billing,
        },
    });
});
