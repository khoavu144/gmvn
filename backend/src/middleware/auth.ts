import { Request, Response, NextFunction, RequestHandler } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AppDataSource } from '../config/database';
import { AthleteAchievement } from '../entities/AthleteAchievement';

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

export const optionalAuthenticate: RequestHandler = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        next();
        return;
    }

    try {
        req.user = verifyAccessToken(token);
    } catch {
        req.user = undefined;
    }

    next();
};

export const proOnly: RequestHandler = (req, res, next) => {
    if (req.user?.user_type !== 'trainer' && req.user?.user_type !== 'athlete') {
        res.status(403).json({ success: false, error: 'Only trainers or professional athletes can perform this action' });
        return;
    }
    next();
};

export const adminOnly: RequestHandler = (req, res, next) => {
    if (req.user?.user_type !== 'admin') {
        res.status(403).json({ success: false, error: 'Admin access only' });
        return;
    }
    next();
};

export const trainerOnly: RequestHandler = (req, res, next) => {
    if (req.user?.user_type !== 'trainer') {
        res.status(403).json({ success: false, error: 'Only trainers can perform this action' });
        return;
    }
    next();
};

export const canCreateProgram: RequestHandler = async (req, res, next) => {
    const userType = req.user?.user_type;
    const userId = req.user?.user_id;

    if (userType === 'trainer') {
        next();
        return;
    }

    if (userType === 'athlete' && userId) {
        const achievementRepo = AppDataSource.getRepository(AthleteAchievement);
        const achievementsCount = await achievementRepo.count({
            where: { athlete_id: userId, status: 'APPROVED' }
        });

        if (achievementsCount >= 1) { // Verified Athlete
            next();
            return;
        }
    }

    res.status(403).json({ success: false, error: 'You must be a trainer or a verified athlete to perform this action' });
};
