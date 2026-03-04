import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authenticate: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer {token}

    if (!token) {
        res.status(401).json({ success: false, error: 'No token provided' });
        return;
    }

    try {
        const payload = verifyAccessToken(token);
        req.user = payload;
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid or expired token' });
        return;
    }
};

export const trainerOnly: RequestHandler = (req, res, next) => {
    if (req.user?.user_type !== 'trainer') {
        res.status(403).json({ success: false, error: 'Trainers only' });
        return;
    }
    next();
};

export const athleteOnly: RequestHandler = (req, res, next) => {
    if (req.user?.user_type !== 'athlete') {
        res.status(403).json({ success: false, error: 'Athletes only' });
        return;
    }
    next();
};
