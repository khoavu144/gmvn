import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    _next: NextFunction
) => {
    const reqLogger = (req as any).logger || logger;

    if (err instanceof AppError) {
        if (err.statusCode >= 500) {
            reqLogger.error(`${err.message}\n${err.stack}`);
        } else {
            reqLogger.warn(`${err.message}`);
        }

        return res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
                code: err.code || err.name || 'API_ERROR',
                ...(err.details !== undefined ? { details: err.details } : {}),
            },
            requestId: req.id,
        });
    }

    // Unhandled errors
    reqLogger.error(`Unhandled Error: ${err.message}\n${err.stack}`);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        error: {
            message: process.env.NODE_ENV === 'production'
                ? 'Internal server error'
                : err.message,
            code: 'INTERNAL_SERVER_ERROR',
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        },
        requestId: req.id,
    });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Route ${req.method} ${req.path} not found`, 404));
};
