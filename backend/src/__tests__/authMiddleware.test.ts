import { Request, Response, NextFunction } from 'express';
import { authenticate, proOnly, adminOnly, trainerOnly, canCreateProgram } from '../middleware/auth';
import * as jwtUtils from '../utils/jwt';
import { AppDataSource } from '../config/database';

jest.mock('../utils/jwt');
jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

describe('Auth Middlewares', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {
            headers: {},
            id: 'req-test',
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    describe('authenticate', () => {
        it('should return 401 if no authorization header provided', async () => {
            await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Bạn chưa gửi token đăng nhập',
                    code: 'AUTH_NO_TOKEN',
                },
                requestId: 'req-test',
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', async () => {
            mockRequest.headers = { authorization: 'Bearer invalid_token' };
            (jwtUtils.verifyAccessToken as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                success: false,
                error: {
                    message: 'Token đăng nhập không hợp lệ hoặc đã hết hạn',
                    code: 'AUTH_INVALID_TOKEN',
                },
                requestId: 'req-test',
            });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should call next() and set req.user if token is valid', async () => {
            mockRequest.headers = { authorization: 'Bearer valid_token' };
            const payload = { user_id: '123', email: 'test@test.com', user_type: 'user' };
            (jwtUtils.verifyAccessToken as jest.Mock).mockReturnValue(payload);
            (AppDataSource.getRepository as jest.Mock).mockReturnValue({
                findOne: jest.fn().mockResolvedValue({ id: '123', is_active: true }),
            });

            await authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(mockRequest.user).toEqual(payload);
            expect(nextFunction).toHaveBeenCalled();
        });
    });

    describe('Role-based Middlewares', () => {
        describe('proOnly', () => {
            it('should block user users and return 403', () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'user' } as any;
                proOnly(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(mockResponse.status).toHaveBeenCalledWith(403);
                expect(nextFunction).not.toHaveBeenCalled();
            });

            it('should allow trainer users', () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'trainer' } as any;
                proOnly(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(nextFunction).toHaveBeenCalled();
            });

            it('should allow athlete users', () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'athlete' } as any;
                proOnly(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(nextFunction).toHaveBeenCalled();
            });
        });

        describe('adminOnly', () => {
            it('should block non-admin users', () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'trainer' } as any;
                adminOnly(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(mockResponse.status).toHaveBeenCalledWith(403);
                expect(nextFunction).not.toHaveBeenCalled();
            });

            it('should allow admin users', () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'admin' } as any;
                adminOnly(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(nextFunction).toHaveBeenCalled();
            });
        });

        describe('trainerOnly', () => {
            it('should block non-trainer users', () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'user' } as any;
                trainerOnly(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(mockResponse.status).toHaveBeenCalledWith(403);
            });

            it('should allow trainer users', () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'trainer' } as any;
                trainerOnly(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(nextFunction).toHaveBeenCalled();
            });
        });

        describe('canCreateProgram', () => {
            it('should allow trainers immediately', async () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'trainer' } as any;
                await canCreateProgram(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(nextFunction).toHaveBeenCalled();
            });

            it('should allow verified athletes', async () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'athlete' } as any;
                (AppDataSource.getRepository as jest.Mock).mockReturnValue({
                    count: jest.fn().mockResolvedValue(1),
                });

                await canCreateProgram(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(nextFunction).toHaveBeenCalled();
            });
        });
    });
});
