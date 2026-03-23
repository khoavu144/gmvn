import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    req.id = req.headers['x-request-id'] as string || randomUUID();
    res.setHeader('x-request-id', req.id);
    
    // We bind logger to request to use correlation id
    (req as any).logger = logger.child({ reqId: req.id });

    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        const payload = {
            method: req.method,
            path: req.originalUrl || req.url,
            statusCode: res.statusCode,
            durationMs: duration,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            userId: req.user?.user_id,
        };

        if (res.statusCode >= 500) {
            (req as any).logger.error('request_completed', { meta: payload });
        } else if (res.statusCode >= 400) {
            (req as any).logger.warn('request_completed', { meta: payload });
        } else {
            (req as any).logger.info('request_completed', { meta: payload });
        }
    });

    next();
};

// Extends Express Request type
declare global {
    namespace Express {
        interface Request {
            id: string;
            logger?: any;
        }
    }
}
