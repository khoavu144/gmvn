import type { Request, Response, NextFunction } from 'express';
import {
    requirePlatformPlan,
    requireProgramLimit,
    requireBranchLimit,
} from '../middleware/requirePlatformPlan';

describe('platform access middleware', () => {
    const mockRequest = {} as Request;
    const mockResponse = {} as Response;
    let next: NextFunction;

    beforeEach(() => {
        next = jest.fn();
    });

    it('requirePlatformPlan is a no-op in free-first mode', async () => {
        const middleware = requirePlatformPlan('gym_business');
        await middleware(mockRequest, mockResponse, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('requireProgramLimit no longer blocks program creation', async () => {
        await requireProgramLimit(mockRequest, mockResponse, next);
        expect(next).toHaveBeenCalledTimes(1);
    });

    it('requireBranchLimit no longer blocks branch creation', async () => {
        await requireBranchLimit(mockRequest, mockResponse, next);
        expect(next).toHaveBeenCalledTimes(1);
    });
});
