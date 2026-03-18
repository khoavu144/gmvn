import { randomUUID } from 'crypto';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { RegisterInput, LoginInput } from '../schemas/auth';
import {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    type AppUserType,
    type RefreshTokenPayload,
    type TokenPayload,
} from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
import { refreshTokenStore } from './refreshTokenStore';

const getUserRepo = () => AppDataSource.getRepository(User);

class AuthService {
    private buildTokenPayload(user: User): TokenPayload {
        return {
            user_id: user.id,
            email: user.email,
            user_type: user.user_type as AppUserType,
        };
    }

    private buildAuthUser(user: User) {
        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            user_type: user.user_type as AppUserType,
            avatar_url: user.avatar_url,
            gym_owner_status: user.gym_owner_status,
            is_verified: user.is_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }

    private async issueSessionTokens(user: User, sessionId: string = randomUUID()) {
        const payload = this.buildTokenPayload(user);
        const access_token = generateAccessToken(payload);
        const refresh_token = generateRefreshToken({
            ...payload,
            session_id: sessionId,
        });

        await refreshTokenStore.storeRefreshToken(user.id, sessionId, refresh_token);

        return {
            access_token,
            refresh_token,
        };
    }

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

        const tokens = await this.issueSessionTokens(newUser);

        return {
            ...tokens,
            user: this.buildAuthUser(newUser),
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

        const tokens = await this.issueSessionTokens(user);

        return {
            ...tokens,
            user: this.buildAuthUser(user),
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

    async refreshToken(payload: RefreshTokenPayload, presentedRefreshToken: string) {
        const user = await getUserRepo().findOneBy({ id: payload.user_id });
        if (!user) {
            throw new Error('User not found');
        }

        const storedRefreshToken = await refreshTokenStore.getRefreshToken(
            payload.user_id,
            payload.session_id
        );

        if (!storedRefreshToken || storedRefreshToken !== presentedRefreshToken) {
            throw new Error('Refresh token revoked or rotated');
        }

        const tokens = await this.issueSessionTokens(user, payload.session_id);

        return {
            ...tokens,
        };
    }

    async logout(refreshToken?: string) {
        if (!refreshToken) {
            return;
        }

        try {
            const payload = verifyRefreshToken(refreshToken);
            await refreshTokenStore.revokeRefreshToken(payload.user_id, payload.session_id);
        } catch {
            // Allow logout to stay idempotent even if refresh token is already expired or invalid.
        }
    }
}

export const authService = new AuthService();
