import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { RegisterInput, LoginInput } from '../schemas/auth';

const getUserRepo = () => AppDataSource.getRepository(User);

class AuthService {
    async register(input: RegisterInput) {
        const existingUser = await getUserRepo().findOneBy({ email: input.email });
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const hashedPassword = await hashPassword(input.password);

        const newUser = getUserRepo().create({
            email: input.email,
            password: hashedPassword,
            full_name: input.full_name,
            user_type: input.user_type,
        });

        await getUserRepo().save(newUser);

        const payload = { user_id: newUser.id, email: newUser.email, user_type: newUser.user_type };
        const access_token = generateAccessToken(payload);
        const refresh_token = generateRefreshToken(payload);

        return {
            access_token,
            refresh_token,
            user: {
                id: newUser.id,
                email: newUser.email,
                full_name: newUser.full_name,
                user_type: newUser.user_type,
                avatar_url: newUser.avatar_url,
                gym_owner_status: newUser.gym_owner_status,
                created_at: newUser.created_at,
            },
        };
    }

    async login(input: LoginInput) {
        const user = await getUserRepo().findOneBy({ email: input.email });
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isPasswordValid = await verifyPassword(input.password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        const payload = { user_id: user.id, email: user.email, user_type: user.user_type };
        const access_token = generateAccessToken(payload);
        const refresh_token = generateRefreshToken(payload);

        return {
            access_token,
            refresh_token,
            user: {
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                user_type: user.user_type,
                avatar_url: user.avatar_url,
                gym_owner_status: user.gym_owner_status,
                is_verified: user.is_verified,
                created_at: user.created_at,
            },
        };
    }

    async getProfile(userId: string) {
        const user = await getUserRepo().findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            user_type: user.user_type,
            avatar_url: user.avatar_url,
            bio: user.bio,
            is_verified: user.is_verified,
            gym_owner_status: user.gym_owner_status,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }

    async refreshToken(userId: string, email: string, user_type: 'user' | 'athlete' | 'trainer' | 'gym_owner' | 'admin') {
        const payload = { user_id: userId, email, user_type };
        const access_token = generateAccessToken(payload);
        return { access_token };
    }
}

export const authService = new AuthService();
