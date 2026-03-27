import { Request, Response, NextFunction } from 'express';
import type { PlatformPlan } from '../services/platformSubscriptionService';

export const requirePlatformPlan = (_minPlan: PlatformPlan) => {
    return async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
        next();
    };
};

export const requireProgramLimit = async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    next();
};

export const requireBranchLimit = async (_req: Request, _res: Response, next: NextFunction): Promise<void> => {
    next();
};
