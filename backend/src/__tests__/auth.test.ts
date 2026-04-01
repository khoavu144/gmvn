import request from 'supertest';
import app from '../app';
import { authService } from '../services/authService';
import * as jwtUtils from '../utils/jwt';

jest.mock('../config/database', () => ({
    AppDataSource: {
        isInitialized: true,
        query: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
        getRepository: jest.fn(),
    },
}));

jest.mock('../services/authService');
jest.mock('../utils/jwt');

describe('Auth API /api/v1/auth', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /register', () => {
        const registerPayload = {
            email: 'test@example.com',
            password: 'Password123!',
            full_name: 'Test User',
            user_type: 'user',
        };

        it('should successfully register a user', async () => {
            (authService.register as jest.Mock).mockResolvedValue({
                user: { id: 'uuid-123', email: 'test@example.com' },
                access_token: 'access-jwt',
                refresh_token: 'refresh-jwt',
                verification_delivery: 'queued',
            });

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(registerPayload);

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty('access_token');
            expect(authService.register).toHaveBeenCalledWith(registerPayload);
        });

        it('should return 409 if email already registered', async () => {
            (authService.register as jest.Mock).mockRejectedValue(new Error('Email already registered'));

            const response = await request(app)
                .post('/api/v1/auth/register')
                .send(registerPayload);

            expect(response.status).toBe(409);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Email đã được đăng ký');
            expect(response.body.error.code).toBe('EMAIL_ALREADY_REGISTERED');
        });

        it('should return 400 validation error if missing fields', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .send({ email: 'test@example.com' });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Dữ liệu gửi lên không hợp lệ');
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
            expect(Array.isArray(response.body.error.details)).toBe(true);
        });
    });

    describe('POST /login', () => {
        const loginPayload = {
            email: 'test@example.com',
            password: 'Password123!',
        };

        it('should login successfully and return tokens', async () => {
            (authService.login as jest.Mock).mockResolvedValue({
                user: { id: 'uuid-123', email: loginPayload.email },
                access_token: 'new-access-jwt',
                refresh_token: 'new-refresh-jwt',
            });

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(loginPayload);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.access_token).toBe('new-access-jwt');
            expect(authService.login).toHaveBeenCalledWith(loginPayload);
        });

        it('should return 401 on invalid credentials', async () => {
            (authService.login as jest.Mock).mockRejectedValue(new Error('Invalid email or password'));

            const response = await request(app)
                .post('/api/v1/auth/login')
                .send(loginPayload);

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.error.message).toBe('Email hoặc mật khẩu không đúng');
            expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
        });
    });

    describe('POST /refresh', () => {
        it('should return new tokens if refresh token is valid', async () => {
            const payload = { user_id: 'uuid-123', email: 'test@a.com', user_type: 'user', session_id: 'session-123' };
            (jwtUtils.verifyRefreshToken as jest.Mock).mockReturnValue(payload);
            (authService.refreshToken as jest.Mock).mockResolvedValue({
                access_token: 'new-access',
                refresh_token: 'new-refresh',
            });

            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .send({ refresh_token: 'valid-refresh-token' });

            expect(response.status).toBe(200);
            expect(response.body.data.access_token).toBe('new-access');
            expect(authService.refreshToken).toHaveBeenCalledWith(payload, 'valid-refresh-token');
        });

        it('should return 400 validation error if refresh_token is missing', async () => {
            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .send({});

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.error.code).toBe('VALIDATION_ERROR');
        });

        it('should return 401 if refresh token is physically invalid', async () => {
            (jwtUtils.verifyRefreshToken as jest.Mock).mockImplementation(() => {
                throw new Error('jwt expired');
            });

            const response = await request(app)
                .post('/api/v1/auth/refresh')
                .send({ refresh_token: 'expired-token' });

            expect(response.status).toBe(401);
            expect(response.body.error.message).toContain('jwt expired');
            expect(response.body.error.code).toBe('INVALID_REFRESH_TOKEN');
        });
    });

    describe('POST /logout', () => {
        it('should call logout and return success', async () => {
            (authService.logout as jest.Mock).mockResolvedValue(true);
            (jwtUtils.verifyAccessToken as jest.Mock).mockReturnValue({ user_id: '123', email: 'a@a.com', user_type: 'user' });
            const { AppDataSource } = jest.requireMock('../config/database') as {
                AppDataSource: { getRepository: jest.Mock };
            };
            AppDataSource.getRepository.mockReturnValue({
                findOne: jest.fn().mockResolvedValue({ id: '123', is_active: true }),
            });

            const response = await request(app)
                .post('/api/v1/auth/logout')
                .set('Authorization', 'Bearer dummy-access-token')
                .send({ refresh_token: 'dummy-refresh-token' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(authService.logout).toHaveBeenCalledWith('dummy-refresh-token');
        });
    });
});
