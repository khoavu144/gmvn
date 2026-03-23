import { AppDataSource } from '../config/database';
import { EntityManager } from 'typeorm';
import { User } from '../entities/User';
import { EmailVerificationToken } from '../entities/EmailVerificationToken';
import { PasswordResetToken } from '../entities/PasswordResetToken';
import { RegisterInput, LoginInput, ResetPasswordInput } from '../schemas/auth';
import {
    verifyRefreshToken,
    type AppUserType,
    type RefreshTokenPayload,
    type TokenPayload,
} from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
import {
    setUserSelections,
    validateSelections,
    resolveCoachSpecialtyTermIdsFromLabels,
    UserProfileCatalogError,
} from './userProfileCatalogService';
import type { AppUserType as ProfileRulesUserType } from '../config/userProfileRules';
import { AppError } from '../utils/AppError';
import { authSessionService } from './authSessionService';
import { emailOutboxService } from './emailOutboxService';

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

    private async issueSessionTokens(user: User, sessionId?: string, manager?: EntityManager) {
        return authSessionService.issueSessionTokens(
            user,
            this.buildTokenPayload(user),
            sessionId,
            manager,
        );
    }

    private async createVerificationToken(userId: string, manager?: EntityManager) {
        const tokenRepo = (manager ?? AppDataSource.manager).getRepository(EmailVerificationToken);
        await tokenRepo.delete({ user_id: userId });

        const code = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const tokenEntity = tokenRepo.create({
            user_id: userId,
            token: code,
            expires_at: expiresAt,
        });
        await tokenRepo.save(tokenEntity);
        return code;
    }

    private async createPasswordResetToken(userId: string, manager?: EntityManager) {
        const tokenRepo = (manager ?? AppDataSource.manager).getRepository(PasswordResetToken);
        await tokenRepo.delete({ user_id: userId });

        const code = generateCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const tokenEntity = tokenRepo.create({
            user_id: userId,
            token: code,
            expires_at: expiresAt,
        });
        await tokenRepo.save(tokenEntity);
        return code;
    }

    private async queueVerificationEmail(user: User, manager?: EntityManager) {
        const code = await this.createVerificationToken(user.id, manager);
        return emailOutboxService.enqueue({
            userId: user.id,
            recipientEmail: user.email,
            emailType: 'verify_email',
            subject: 'Xác thực tài khoản Gymerviet của bạn',
            payload: { code },
        }, manager);
    }

    private async queuePasswordResetEmail(user: User, manager?: EntityManager) {
        const code = await this.createPasswordResetToken(user.id, manager);
        return emailOutboxService.enqueue({
            userId: user.id,
            recipientEmail: user.email,
            emailType: 'reset_password',
            subject: 'Đặt lại mật khẩu Gymerviet',
            payload: { code },
        }, manager);
    }

    async register(input: RegisterInput) {
        const { result, outboxId } = await AppDataSource.transaction(async (manager) => {
            const userRepo = manager.getRepository(User);
            const existingUser = await userRepo.findOneBy({ email: input.email });
            if (existingUser) {
                throw new Error('Email already registered');
            }

            const hashedPassword = await hashPassword(input.password);
            const newUser = userRepo.create({
                email: input.email,
                password: hashedPassword,
                full_name: input.full_name,
                user_type: input.user_type,
            });

            await userRepo.save(newUser);
            const tokens = await this.issueSessionTokens(newUser, undefined, manager);
            const outbox = await this.queueVerificationEmail(newUser, manager);

            return {
                result: {
                    ...tokens,
                    verification_delivery: 'queued',
                    user: this.buildAuthUser(newUser),
                },
                outboxId: outbox.id,
            };
        });

        void emailOutboxService.processRecord(outboxId).catch((error) => {
            console.error('Failed to process verification email outbox record:', error);
        });

        return result;
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

        const outbox = await AppDataSource.transaction(async (manager) => {
            return this.queueVerificationEmail(user, manager);
        });

        void emailOutboxService.processRecord(outbox.id).catch((error) => {
            console.error('Failed to process verification email outbox record:', error);
        });

        return { message: 'Verification email queued', delivery_status: 'queued' };
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

        const outbox = await AppDataSource.transaction(async (manager) => {
            return this.queuePasswordResetEmail(user, manager);
        });

        void emailOutboxService.processRecord(outbox.id).catch((error) => {
            console.error('Failed to process password reset email outbox record:', error);
        });

        return { message: 'If the email exists, a reset code has been queued', delivery_status: 'queued' };
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

        await authSessionService.validateRefreshSession(payload, presentedRefreshToken);

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
            await authSessionService.revokeRefreshSession(payload.user_id, payload.session_id);
        } catch {
            // Allow logout to stay idempotent even if refresh token is already expired or invalid.
        }
    }
}

export const authService = new AuthService();
