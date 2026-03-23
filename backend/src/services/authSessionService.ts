import { createHash, randomUUID } from 'crypto';
import { EntityManager } from 'typeorm';
import { AppDataSource } from '../config/database';
import { getEnv } from '../config/env';
import { AuthRefreshSession } from '../entities/AuthRefreshSession';
import { User } from '../entities/User';
import {
    generateAccessToken,
    generateRefreshToken,
    type RefreshTokenPayload,
    type TokenPayload,
} from '../utils/jwt';
import { refreshTokenStore } from './refreshTokenStore';
import { AppError } from '../utils/AppError';

const hashRefreshToken = (token: string) => createHash('sha256').update(token).digest('hex');

class AuthSessionService {
    private getRepo(manager?: EntityManager) {
        return (manager ?? AppDataSource.manager).getRepository(AuthRefreshSession);
    }

    private getExpiryDate() {
        const env = getEnv();
        return new Date(Date.now() + env.JWT_REFRESH_TTL_SECONDS * 1000);
    }

    async issueSessionTokens(
        user: User,
        payload: TokenPayload,
        sessionId: string = randomUUID(),
        manager?: EntityManager,
    ) {
        const access_token = generateAccessToken(payload);
        const refresh_token = generateRefreshToken({
            ...payload,
            session_id: sessionId,
        });

        const repo = this.getRepo(manager);
        const now = new Date();
        const expiresAt = this.getExpiryDate();
        const existing = await repo.findOne({ where: { session_id: sessionId, user_id: user.id } });

        const session = existing ?? repo.create({
            user_id: user.id,
            session_id: sessionId,
            issued_at: now,
        });

        session.refresh_token_hash = hashRefreshToken(refresh_token);
        session.status = 'active';
        session.expires_at = expiresAt;
        session.last_rotated_at = now;
        session.revoked_at = null;

        try {
            await repo.save(session);
        } catch {
            throw new AppError('Session store unavailable', 503);
        }

        try {
            await refreshTokenStore.storeRefreshToken(user.id, sessionId, refresh_token);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[auth-session] Redis cache mirror failed for ${user.id}:${sessionId}: ${message}`);
        }

        return { access_token, refresh_token };
    }

    async validateRefreshSession(payload: RefreshTokenPayload, presentedRefreshToken: string) {
        const repo = this.getRepo();
        const session = await repo.findOne({
            where: {
                user_id: payload.user_id,
                session_id: payload.session_id,
            },
        });

        if (!session) {
            throw new Error('Refresh token revoked or rotated');
        }

        if (session.status !== 'active') {
            throw new Error('Refresh token revoked or rotated');
        }

        if (session.expires_at < new Date()) {
            session.status = 'expired';
            await repo.save(session);
            throw new Error('Refresh token expired');
        }

        if (session.refresh_token_hash !== hashRefreshToken(presentedRefreshToken)) {
            throw new Error('Refresh token revoked or rotated');
        }

        return session;
    }

    async revokeRefreshSession(userId: string, sessionId: string) {
        const repo = this.getRepo();
        const session = await repo.findOne({ where: { user_id: userId, session_id: sessionId } });

        if (!session) {
            return;
        }

        session.status = 'revoked';
        session.revoked_at = new Date();
        await repo.save(session);

        try {
            await refreshTokenStore.revokeRefreshToken(userId, sessionId);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            console.warn(`[auth-session] Redis revoke mirror failed for ${userId}:${sessionId}: ${message}`);
        }
    }
}

export const authSessionService = new AuthSessionService();
