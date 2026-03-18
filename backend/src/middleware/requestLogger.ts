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
        const msg = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${duration}ms`;
        if (res.statusCode >= 500) {
            (req as any).logger.error(msg);
        } else if (res.statusCode >= 400) {
            (req as any).logger.warn(msg);
        } else {
            (req as any).logger.info(msg);
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
