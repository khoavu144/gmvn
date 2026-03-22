import { randomUUID } from 'crypto';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { EmailVerificationToken } from '../entities/EmailVerificationToken';
import { PasswordResetToken } from '../entities/PasswordResetToken';
import { emailService } from './emailService';
import { RegisterInput, LoginInput, ResetPasswordInput } from '../schemas/auth';
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
import {
    setUserSelections,
    validateSelections,
    resolveCoachSpecialtyTermIdsFromLabels,
    UserProfileCatalogError,
} from './userProfileCatalogService';
import type { AppUserType as ProfileRulesUserType } from '../config/userProfileRules';
import { AppError } from '../utils/AppError';

const getUserRepo = () => AppDataSource.getRepository(User);

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

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
            onboarding_completed: user.onboarding_completed,
            marketplace_membership_active: user.marketplace_membership_active,
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

        try {
            await refreshTokenStore.storeRefreshToken(user.id, sessionId, refresh_token);
        } catch (error) {
            console.warn(`[Degraded Mode] Failed to store refresh token in Redis for user ${user.id}:`, error instanceof Error ? error.message : error);
        }

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

        try {
            // P1-1: Send verification email directly after successful creation
            await this.sendVerificationEmail(newUser.id);
        } catch (emailError) {
            console.error('Failed to auto-send verification email:', emailError);
        }

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

    async sendVerificationEmail(userId: string) {
        const user = await getUserRepo().findOneBy({ id: userId });
        if (!user) throw new Error('User not found');
        if (user.is_email_verified) throw new Error('Email is already verified');

        const tokenRepo = AppDataSource.getRepository(EmailVerificationToken);
        await tokenRepo.delete({ user_id: userId });

        const code = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        const tokenEntity = tokenRepo.create({
            user_id: userId,
            token: code,
            expires_at: expiresAt
        });
        await tokenRepo.save(tokenEntity);

        await emailService.sendVerificationEmail(user.email, code);
        return { message: 'Verification email sent' };
    }

    async verifyEmail(userId: string, token: string) {
        const tokenRepo = AppDataSource.getRepository(EmailVerificationToken);
        const record = await tokenRepo.findOneBy({ user_id: userId, token });

        if (!record) throw new Error('Invalid verification code');
        if (record.expires_at < new Date()) {
            throw new Error('Verification code has expired');
        }

        await getUserRepo().update(userId, { is_email_verified: true });
        await tokenRepo.delete({ user_id: userId });
        return { message: 'Email verified successfully' };
    }

    async forgotPassword(email: string) {
        const user = await getUserRepo().findOneBy({ email });
        if (!user) {
            // Prevent email enumeration
            return { message: 'If the email exists, a reset code has been sent' };
        }

        const tokenRepo = AppDataSource.getRepository(PasswordResetToken);
        await tokenRepo.delete({ user_id: user.id });

        const code = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const tokenEntity = tokenRepo.create({
            user_id: user.id,
            token: code,
            expires_at: expiresAt
        });
        await tokenRepo.save(tokenEntity);

        await emailService.sendPasswordResetEmail(user.email, code);
        return { message: 'If the email exists, a reset code has been sent' };
    }

    async completeOnboarding(userId: string, data: any) {
        const user = await getUserRepo().findOneBy({ id: userId });
        if (!user) throw new Error('User not found');

        const userType = user.user_type as ProfileRulesUserType;

        if (data.height_cm) user.height_cm = Number(data.height_cm);
        if (data.current_weight_kg) user.current_weight_kg = Number(data.current_weight_kg);
        if (data.experience_level) user.experience_level = String(data.experience_level);
        if (data.bio) user.bio = String(data.bio);

        const rawIds = data.term_ids;
        let termIds: string[] = [];
        let shouldPersistSelections = false;

        if (Array.isArray(rawIds)) {
            termIds = [...new Set(rawIds.map((x: unknown) => String(x)))];
            shouldPersistSelections = true;
        } else if (
            userType === 'trainer' &&
            Array.isArray(data.specialties) &&
            data.specialties.length > 0
        ) {
            termIds = await resolveCoachSpecialtyTermIdsFromLabels(
                data.specialties.map((x: unknown) => String(x)),
            );
            shouldPersistSelections = true;
        }

        if (!shouldPersistSelections && data.specialties && Array.isArray(data.specialties)) {
            user.specialties = data.specialties;
        }

        try {
            await validateSelections(userType, 'post_signup_wizard', termIds);
            if (shouldPersistSelections) {
                await setUserSelections(userId, userType, 'post_signup_wizard', termIds);
            }
        } catch (e) {
            if (e instanceof UserProfileCatalogError && e.code === 'VALIDATION') {
                throw new AppError(e.message, 400);
            }
            throw e;
        }

        user.onboarding_completed = true;
        await getUserRepo().save(user);

        const refreshed = await getUserRepo().findOneBy({ id: userId });
        return this.buildAuthUser(refreshed!);
    }

    async resetPassword(input: ResetPasswordInput) {
        const user = await getUserRepo().findOneBy({ email: input.email });
        if (!user) throw new Error('Invalid email or code');

        const tokenRepo = AppDataSource.getRepository(PasswordResetToken);
        const record = await tokenRepo.findOneBy({ user_id: user.id, token: input.token });

        if (!record) throw new Error('Invalid email or code');
        if (record.expires_at < new Date()) {
            throw new Error('Reset code has expired');
        }

        const hashedPassword = await hashPassword(input.new_password);
        await getUserRepo().update(user.id, { password: hashedPassword });
        await tokenRepo.delete({ user_id: user.id });

        return { message: 'Password has been reset successfully' };
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
            onboarding_completed: user.onboarding_completed,
            gym_owner_status: user.gym_owner_status,
            marketplace_membership_active: user.marketplace_membership_active,
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
