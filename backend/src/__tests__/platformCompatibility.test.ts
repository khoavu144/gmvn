import request from 'supertest';

jest.mock('../config/database', () => ({
    AppDataSource: {
        isInitialized: true,
        query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        getRepository: jest.fn().mockReturnValue({
            count: jest.fn().mockResolvedValue(10),
            findOne: jest.fn().mockResolvedValue({ id: 'admin-1', is_active: true }),
        }),
    },
}));

jest.mock('../services/refreshTokenStore', () => ({
    refreshTokenStore: {
        ping: jest.fn().mockResolvedValue(true),
    },
}));

jest.mock('../config/redis', () => ({
    __esModule: true,
    default: {
        ping: jest.fn().mockResolvedValue(true),
    },
}));

jest.mock('../services/emailService', () => ({
    emailService: {
        isConfigured: jest.fn().mockReturnValue(true),
        getDefaultFrom: jest.fn().mockReturnValue('"GYMERVIET" <noreply@gymerviet.com>'),
    },
}));

jest.mock('../middleware/auth', () => {
    const authUser = {
        user_id: 'admin-1',
        email: 'admin@gymerviet.test',
        user_type: 'admin',
    };

    const allow = (req: any, _res: any, next: any) => {
        req.user = req.user ?? authUser;
        next();
    };

    const allowAdmin = (req: any, _res: any, next: any) => {
        req.user = authUser;
        next();
    };

    return {
        authenticate: allow,
        optionalAuthenticate: allow,
        adminOnly: allowAdmin,
        requireAdmin: allowAdmin,
        trainerOnly: allow,
        athleteOnly: allow,
        proOnly: allow,
        canCreateProgram: allow,
    };
});

import app from '../app';

describe('Platform billing compatibility endpoints', () => {
    it('returns free full-access plan for the current user', async () => {
        const response = await request(app).get('/api/v1/platform/plan/me');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            success: true,
            plan: 'free',
            billing_enabled: false,
            expires_at: null,
        });
        expect(response.body.limits.maxPrograms).toBe(999999);
        expect(response.body.limits.maxBranches).toBe(999999);
        expect(response.body.limits.prioritySearch).toBe(true);
    });

    it('rejects platform checkout with BILLING_DISABLED', async () => {
        const response = await request(app)
            .post('/api/v1/platform/checkout')
            .send({ plan: 'coach_pro' });

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('BILLING_DISABLED');
        expect(response.body.error.message).toContain('Thu phí nền tảng đã bị vô hiệu hóa vĩnh viễn');
    });

    it('ignores legacy SePay webhook calls', async () => {
        const response = await request(app)
            .post('/api/v1/platform/webhook/sepay')
            .send({ transaction_id: 'legacy-webhook-1' });

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            success: true,
            ignored: true,
            billing_enabled: false,
            reason: 'platform_billing_disabled',
        });
    });

    it('keeps admin billing status route available in disabled mode', async () => {
        const response = await request(app).get('/api/v1/platform/admin/billing');

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            success: true,
            billing_enabled: false,
            deprecated: true,
            mode: 'disabled',
        });
    });
});
