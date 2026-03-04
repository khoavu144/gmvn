import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UpdateProfileInput } from '../schemas/user';

const userRepository = AppDataSource.getRepository(User);

class UserService {
    async updateProfile(userId: string, input: UpdateProfileInput) {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        // Merge input into user entity
        Object.assign(user, input);

        await userRepository.save(user);

        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            user_type: user.user_type,
            avatar_url: user.avatar_url,
            bio: user.bio,
            height_cm: user.height_cm,
            current_weight_kg: user.current_weight_kg,
            experience_level: user.experience_level,
            specialties: user.specialties,
            base_price_monthly: user.base_price_monthly,
            is_verified: user.is_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }

    async getTrainers(page: number = 1, limit: number = 10, search?: string) {
        const queryBuilder = userRepository.createQueryBuilder('user')
            .where('user.user_type = :type', { type: 'trainer' });

        if (search) {
            queryBuilder.andWhere('user.full_name ILIKE :search OR user.bio ILIKE :search', { search: `%${search}%` });
        }

        // Default sorting by newest
        queryBuilder.orderBy('user.created_at', 'DESC');

        const [trainers, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            trainers: trainers.map(t => ({
                id: t.id,
                full_name: t.full_name,
                avatar_url: t.avatar_url,
                bio: t.bio,
                specialties: t.specialties,
                base_price_monthly: t.base_price_monthly,
                is_verified: t.is_verified
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async getTrainerById(id: string) {
        const trainer = await userRepository.findOneBy({ id, user_type: 'trainer' });
        if (!trainer) {
            throw new Error('Trainer not found');
        }

        return {
            id: trainer.id,
            full_name: trainer.full_name,
            avatar_url: trainer.avatar_url,
            bio: trainer.bio,
            specialties: trainer.specialties,
            base_price_monthly: trainer.base_price_monthly,
            is_verified: trainer.is_verified,
            created_at: trainer.created_at,
        };
    }
}

export const userService = new UserService();
