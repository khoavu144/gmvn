import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';

/**
 * Middleware: chỉ cho phép user có user_type='gym_owner' VÀ gym_owner_status='approved'
 */
export const gymOwnerOnly: RequestHandler = async (req, res, next) => {
    const userId = req.user?.user_id;
    const userType = req.user?.user_type;

    if (!userId || userType !== 'gym_owner') {
        res.status(403).json({
            success: false,
            error: 'Chỉ Gym Owner mới có quyền thực hiện thao tác này'
        });
        return;
    }

    // Kiểm tra gym_owner_status trong DB
    try {
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user) {
            res.status(401).json({ success: false, error: 'User không tồn tại' });
            return;
        }

        if (user.gym_owner_status !== 'approved') {
            res.status(403).json({
                success: false,
                error: 'Tài khoản Gym Owner chưa được duyệt',
                gym_owner_status: user.gym_owner_status,
            });
            return;
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
