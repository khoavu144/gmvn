import { Request, Response, NextFunction } from 'express';
import { authenticate, proOnly, adminOnly, trainerOnly, canCreateProgram } from '../middleware/auth';
import * as jwtUtils from '../utils/jwt';
import { AppDataSource } from '../config/database';

jest.mock('../utils/jwt');

describe('Auth Middlewares', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            headers: {}
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    describe('authenticate', () => {
        it('should return 401 if no authorization header provided', () => {
            authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'No token provided' });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', () => {
            mockRequest.headers = { authorization: 'Bearer invalid_token' };
            (jwtUtils.verifyAccessToken as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({ success: false, error: 'Invalid or expired token' });
            expect(nextFunction).not.toHaveBeenCalled();
        });

        it('should call next() and set req.user if token is valid', () => {
            mockRequest.headers = { authorization: 'Bearer valid_token' };
            const payload = { user_id: '123', email: 'test@test.com', user_type: 'member' };
            (jwtUtils.verifyAccessToken as jest.Mock).mockReturnValue(payload);

            authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

            expect(mockRequest.user).toEqual(payload);
            expect(nextFunction).toHaveBeenCalled();
        });
    });

    describe('Role-based Middlewares', () => {
        describe('proOnly', () => {
            it('should block member users and return 403', () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'member' } as any;
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
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'member' } as any;
                trainerOnly(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(mockResponse.status).toHaveBeenCalledWith(403);
            });

            it('should allow trainer users', () => {
                mockRequest.user = { user_id: '1', email: 'a@a.com', user_type: 'trainer' } as any;
                trainerOnly(mockRequest as Request, mockResponse as Response, nextFunction);
                expect(nextFunction).toHaveBeenCalled();
            });
        });
    });
});
