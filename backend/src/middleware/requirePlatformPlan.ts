import { Request, Response, NextFunction } from 'express';
import { platformSubscriptionService, planSatisfies, PlatformPlan, PlanLimits } from '../services/platformSubscriptionService';
import { AppError } from '../utils/AppError';

/** Get user plan with request-level cache to avoid repeated DB queries */
async function getCachedPlan(req: Request, userId: string): Promise<{ plan: PlatformPlan; limits: PlanLimits }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cache = (req as any)._platformPlan as { plan: PlatformPlan; limits: PlanLimits } | undefined;
    if (cache) return cache;
    const result = await platformSubscriptionService.getMyPlan(userId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)._platformPlan = result;
    return result;
}

/**
 * Middleware: enforce a minimum platform plan.
 *
 * If billing is disabled (admin toggle OFF), all requests pass through.
 * If billing is enabled, the user must have the required plan or higher.
 *
 * Usage:
 *   router.post('/programs', authenticate, requirePlatformPlan('coach_pro'), createProgram);
 */
export const requirePlatformPlan = (minPlan: PlatformPlan) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const billingEnabled = await platformSubscriptionService.isBillingEnabled();
            if (!billingEnabled) { next(); return; } // Master switch OFF → no limits

            const userId = req.user?.user_id;
            if (!userId) { next(new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED')); return; }

            const { plan } = await getCachedPlan(req, userId);
            if (planSatisfies(plan, minPlan)) { next(); return; }

            next(new AppError(
                'Tính năng yêu cầu gói trả phí',
                402,
                'PLAN_UPGRADE_REQUIRED',
                { required_plan: minPlan, current_plan: plan, upgrade_url: '/pricing' },
            ));
        } catch (err: any) {
            next(new AppError(err.message, 500, 'PLAN_GUARD_ERROR'));
        }
    };
};

/**
 * Middleware: check if user is within their program creation limit.
 * Must be used AFTER authenticate.
 */
export const requireProgramLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const billingEnabled = await platformSubscriptionService.isBillingEnabled();
        if (!billingEnabled) { next(); return; }

        const userId = req.user!.user_id;
        const { limits } = await getCachedPlan(req, userId);

        if (!isFinite(limits.maxPrograms)) { next(); return; }

        // Count current programs
        const { AppDataSource } = await import('../config/database');
        const { Program } = await import('../entities/Program');
        const count = await AppDataSource.getRepository(Program).countBy({ trainer_id: userId });

        if (count < limits.maxPrograms) { next(); return; }

        next(new AppError(
            `Gói miễn phí giới hạn tối đa ${limits.maxPrograms} chương trình. Nâng cấp để tạo thêm.`,
            402,
            'PROGRAM_LIMIT_REACHED',
            { required_plan: 'coach_pro', upgrade_url: '/pricing' },
        ));
    } catch (err: any) {
        next(new AppError(err.message, 500, 'PROGRAM_LIMIT_GUARD_ERROR'));
    }
};

/**
 * Middleware: check gym branch creation limit.
 */
export const requireBranchLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const billingEnabled = await platformSubscriptionService.isBillingEnabled();
        if (!billingEnabled) { next(); return; }

        const userId = req.user!.user_id;
        const { limits } = await getCachedPlan(req, userId);

        if (!isFinite(limits.maxBranches)) { next(); return; }

        const { AppDataSource } = await import('../config/database');
        const { GymBranch } = await import('../entities/GymBranch');
        const { GymCenter } = await import('../entities/GymCenter');
        const center = await AppDataSource.getRepository(GymCenter).findOneBy({ owner_id: userId });
        if (!center) { next(); return; }

        const count = await AppDataSource.getRepository(GymBranch).countBy({ gym_center_id: center.id });
        if (count < limits.maxBranches) { next(); return; }

        next(new AppError(
            `Gói Starter giới hạn ${limits.maxBranches} chi nhánh. Nâng cấp Gym Business để thêm.`,
            402,
            'BRANCH_LIMIT_REACHED',
            { required_plan: 'gym_business', upgrade_url: '/pricing' },
        ));
    } catch (err: any) {
        next(new AppError(err.message, 500, 'BRANCH_LIMIT_GUARD_ERROR'));
    }
};
