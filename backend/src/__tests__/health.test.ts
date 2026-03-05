import request from 'supertest';
import app from '../app';

jest.mock('../config/database', () => ({
    AppDataSource: {
        isInitialized: true,
        getRepository: jest.fn().mockReturnValue({
            count: jest.fn().mockResolvedValue(10)
        })
    }
}));

describe('GET /api/v1/health', () => {
    it('should return 200 OK and health status', async () => {
        const response = await request(app).get('/api/v1/health');
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'OK');
        expect(response.body).toHaveProperty('timestamp');
    });
});
