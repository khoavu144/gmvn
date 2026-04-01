import { Request, Response, RequestHandler } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AppDataSource } from '../config/database';
import { AthleteAchievement } from '../entities/AthleteAchievement';
import { User } from '../entities/User';

const sendError = (
    req: Request,
    res: Response,
    status: number,
    message: string,
    code: string,
) => {
    res.status(status).json({
        success: false,
        error: {
            message,
            code,
        },
        requestId: req.id,
    });
};

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}

export const authenticate: RequestHandler = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer {token}

    if (!token) {
        sendError(req, res, 401, 'Bạn chưa gửi token đăng nhập', 'AUTH_NO_TOKEN');
        return;
    }

    try {
        const payload = verifyAccessToken(token);
        
        // P0-1: Ban enforcement — check if user is active
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: payload.user_id } });
        
        if (!user) {
            sendError(req, res, 401, 'Không tìm thấy người dùng', 'AUTH_USER_NOT_FOUND');
            return;
        }
        
        if (!user.is_active) {
            sendError(req, res, 403, 'Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động', 'AUTH_USER_INACTIVE');
            return;
        }

        req.user = payload;
        next();
    } catch {
        sendError(req, res, 401, 'Token đăng nhập không hợp lệ hoặc đã hết hạn', 'AUTH_INVALID_TOKEN');
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
        sendError(req, res, 403, 'Chỉ huấn luyện viên hoặc vận động viên chuyên nghiệp mới có thể thực hiện thao tác này', 'AUTH_PRO_ONLY');
        return;
    }
    next();
};

export const adminOnly: RequestHandler = (req, res, next) => {
    if (req.user?.user_type !== 'admin') {
        sendError(req, res, 403, 'Chỉ quản trị viên mới có quyền truy cập', 'AUTH_ADMIN_ONLY');
        return;
    }
    next();
};

// Alias — used by marketplace and other modern routes
export const requireAdmin = adminOnly;

export const athleteOnly: RequestHandler = (req, res, next) => {
    if (req.user?.user_type !== 'athlete') {
        sendError(req, res, 403, 'Chỉ vận động viên mới có thể thực hiện thao tác này', 'AUTH_ATHLETE_ONLY');
        return;
    }
    next();
};

export const adminAndTrainerOnly: RequestHandler = (req, res, next) => {
    if (req.user?.user_type !== 'admin' && req.user?.user_type !== 'trainer') {
        sendError(req, res, 403, 'Chỉ quản trị viên hoặc huấn luyện viên mới có thể thực hiện thao tác này', 'AUTH_ADMIN_OR_TRAINER_ONLY');
        return;
    }
    next();
};

export const athleteOrUser: RequestHandler = (req, res, next) => {
    if (req.user?.user_type !== 'athlete' && req.user?.user_type !== 'user') {
        sendError(req, res, 403, 'Chỉ vận động viên hoặc người dùng mới có thể thực hiện thao tác này', 'AUTH_ATHLETE_OR_USER_ONLY');
        return;
    }
    next();
};

export const trainerOnly: RequestHandler = (req, res, next) => {
    if (req.user?.user_type !== 'trainer') {
        sendError(req, res, 403, 'Chỉ huấn luyện viên mới có thể thực hiện thao tác này', 'AUTH_TRAINER_ONLY');
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

    sendError(req, res, 403, 'Bạn phải là huấn luyện viên hoặc vận động viên đã xác minh để thực hiện thao tác này', 'AUTH_PROGRAM_CREATION_FORBIDDEN');
};
