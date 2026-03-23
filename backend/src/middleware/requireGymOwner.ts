import { RequestHandler } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AppError } from '../utils/AppError';

/**
 * Middleware: chỉ cho phép user có user_type='gym_owner' VÀ gym_owner_status='approved'
 */
export const gymOwnerOnly: RequestHandler = async (req, res, next) => {
    const userId = req.user?.user_id;
    const userType = req.user?.user_type;

    if (!userId || userType !== 'gym_owner') {
        next(new AppError('Chỉ Gym Owner mới có quyền thực hiện thao tác này', 403, 'GYM_OWNER_REQUIRED'));
        return;
    }

    // Kiểm tra gym_owner_status trong DB
    try {
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOne({ where: { id: userId } });

        if (!user) {
            next(new AppError('User không tồn tại', 401, 'USER_NOT_FOUND'));
            return;
        }

        if (user.gym_owner_status !== 'approved') {
            next(new AppError(
                'Tài khoản Gym Owner chưa được duyệt',
                403,
                'GYM_OWNER_NOT_APPROVED',
                { gym_owner_status: user.gym_owner_status },
            ));
            return;
        }

        next();
    } catch (error) {
        next(new AppError('Internal server error', 500, 'GYM_OWNER_GUARD_ERROR'));
    }
};
