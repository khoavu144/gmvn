import request from 'supertest';
import app from '../app';

jest.mock('../config/database', () => ({
    AppDataSource: {
        isInitialized: true,
        query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        getRepository: jest.fn().mockReturnValue({
            count: jest.fn().mockResolvedValue(10),
        }),
    }
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

describe('GET /api/v1/health', () => {
    it('should return 200 OK and health status', async () => {
        const response = await request(app).get('/api/v1/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
        expect(response.body).toHaveProperty('checks');
        expect(response.body.checks.billing).toMatchObject({
            status: 'skipped',
            details: expect.objectContaining({ enabled: false }),
        });
    });

    it('should return live status', async () => {
        const response = await request(app).get('/api/v1/health/live');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('process', 'up');
    });
});
