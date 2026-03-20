import { Request, Response, NextFunction } from 'express';
import { platformSubscriptionService, planSatisfies, PlatformPlan, PlanLimits, PLAN_CONFIG } from '../services/platformSubscriptionService';

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
            if (!userId) { res.status(401).json({ error: 'Authentication required' }); return; }

            const { plan } = await getCachedPlan(req, userId);
            if (planSatisfies(plan, minPlan)) { next(); return; }

            res.status(402).json({
                error: 'Tính năng yêu cầu gói trả phí',
                required_plan: minPlan,
                current_plan: plan,
                upgrade_url: '/pricing',
            });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
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

        res.status(402).json({
            error: `Gói miễn phí giới hạn tối đa ${limits.maxPrograms} chương trình. Nâng cấp để tạo thêm.`,
            required_plan: 'coach_pro',
            upgrade_url: '/pricing',
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
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

        res.status(402).json({
            error: `Gói Starter giới hạn ${limits.maxBranches} chi nhánh. Nâng cấp Gym Business để thêm.`,
            required_plan: 'gym_business',
            upgrade_url: '/pricing',
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

