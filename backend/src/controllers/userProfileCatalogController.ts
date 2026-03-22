import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import {
    getCatalogForUserType,
    getUserTermIds,
    setUserSelections,
    loadUserType,
    UserProfileCatalogError,
} from '../services/userProfileCatalogService';
import type { UserProfileRuleContext } from '../config/userProfileRules';

const contexts: UserProfileRuleContext[] = [
    'post_signup_wizard',
    'profile',
    'feature_marketplace_listing',
];

function parseContext(raw: unknown): UserProfileRuleContext {
    if (typeof raw === 'string' && (contexts as string[]).includes(raw)) {
        return raw as UserProfileRuleContext;
    }
    return 'profile';
}

export const userProfileCatalogController = {
    getCatalog: asyncHandler(async (req: Request, res: Response) => {
        let userType;
        try {
            userType = await loadUserType(req.user!.user_id);
        } catch (e) {
            if (e instanceof UserProfileCatalogError && e.code === 'NOT_FOUND') {
                throw new AppError(e.message, 404);
            }
            throw e;
        }
        const locale = typeof req.query.locale === 'string' ? req.query.locale : 'vi';
        const data = await getCatalogForUserType(userType, locale);
        res.status(200).json({ success: true, data });
    }),

    getMe: asyncHandler(async (req: Request, res: Response) => {
        const term_ids = await getUserTermIds(req.user!.user_id);
        res.status(200).json({ success: true, data: { term_ids } });
    }),

    putMe: asyncHandler(async (req: Request, res: Response) => {
        const userId = req.user!.user_id;
        let userType;
        try {
            userType = await loadUserType(userId);
        } catch (e) {
            if (e instanceof UserProfileCatalogError && e.code === 'NOT_FOUND') {
                throw new AppError(e.message, 404);
            }
            throw e;
        }
        const body = req.body || {};
        const raw = body.term_ids;
        if (!Array.isArray(raw)) {
            throw new AppError('term_ids phải là mảng id.', 400);
        }
        const termIds = [...new Set(raw.map((x: unknown) => String(x)))];
        const context = parseContext(body.context);

        try {
            const result = await setUserSelections(userId, userType, context, termIds);
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            if (e instanceof UserProfileCatalogError && e.code === 'VALIDATION') {
                throw new AppError(e.message, 400);
            }
            throw e;
        }
    }),
};
