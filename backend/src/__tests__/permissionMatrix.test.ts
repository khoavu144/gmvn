import { Request, Response, NextFunction } from 'express';
import { canCreateProgram } from '../middleware/auth';
import { AppDataSource } from '../config/database';

jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn()
    }
}));

describe('Permission Matrix: canCreateProgram', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let mockCount: jest.Mock;

    beforeEach(() => {
        req = { user: {} as any };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        mockCount = jest.fn();

        (AppDataSource.getRepository as jest.Mock).mockReturnValue({
            count: mockCount
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should allow trainer immediately without DB check', async () => {
        req.user = { user_type: 'trainer', user_id: '1' } as any;
        await canCreateProgram(req as Request, res as Response, next);
        expect(next).toHaveBeenCalled();
        expect(AppDataSource.getRepository).not.toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny basic athlete with no approved achievements', async () => {
        req.user = { user_type: 'athlete', user_id: '2' } as any;
        mockCount.mockResolvedValue(0);

        await canCreateProgram(req as Request, res as Response, next);

        expect(mockCount).toHaveBeenCalledWith({ where: { athlete_id: '2', status: 'APPROVED' } });
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            success: false,
            error: expect.stringContaining('must be a trainer or a verified athlete')
        }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should allow verified athlete with at least 1 approved achievement', async () => {
        req.user = { user_type: 'athlete', user_id: '3' } as any;
        mockCount.mockResolvedValue(1);

        await canCreateProgram(req as Request, res as Response, next);

        expect(mockCount).toHaveBeenCalledWith({ where: { athlete_id: '3', status: 'APPROVED' } });
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    it('should deny normal member', async () => {
        req.user = { user_type: 'member', user_id: '4' } as any;

        await canCreateProgram(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('should deny guest/unauthenticated user', async () => {
        req.user = undefined;

        await canCreateProgram(req as Request, res as Response, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
