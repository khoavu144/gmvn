import crypto from 'crypto';
import { Request } from 'express';
import { getEnv } from '../config/env';
import { AppError } from './AppError';

const safeCompare = (left: string, right: string): boolean => {
    const leftBuffer = Buffer.from(left, 'utf8');
    const rightBuffer = Buffer.from(right, 'utf8');
    if (leftBuffer.length !== rightBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

const getHeader = (value: string | string[] | undefined): string | null => {
    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return typeof value === 'string' ? value : null;
};

const extractTokenFromAuthorization = (authorization: string | null): string | null => {
    if (!authorization) {
        return null;
    }

    const trimmed = authorization.trim();
    if (!trimmed) {
        return null;
    }

    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
        const scheme = parts[0].toLowerCase();
        if (scheme === 'apikey' || scheme === 'bearer') {
            const value = parts.slice(1).join(' ').trim();
            return value || null;
        }
    }

    return trimmed;
};

const getTokenFromRequest = (req: Request): string | null => {
    const queryToken = typeof req.query.token === 'string' ? req.query.token.trim() : '';
    if (queryToken) {
        return queryToken;
    }

    const authorizationToken = extractTokenFromAuthorization(getHeader(req.headers.authorization));
    if (authorizationToken) {
        return authorizationToken;
    }

    const headerToken = getHeader(req.headers['x-webhook-token'])?.trim() ?? '';
    if (headerToken) {
        return headerToken;
    }

    return null;
};

export const hasSepayWebhookAuthConfig = (): boolean => {
    const env = getEnv();
    return Boolean(env.SEPAY_WEBHOOK_SECRET || env.SEPAY_WEBHOOK_TOKEN);
};

export const verifySepayWebhookAuth = (req: Request): void => {
    const env = getEnv();
    const secret = env.SEPAY_WEBHOOK_SECRET?.trim() ?? '';
    const fallbackToken = env.SEPAY_WEBHOOK_TOKEN?.trim() ?? '';

    if (secret) {
        const signature = getHeader(req.headers['x-sepay-signature'])?.trim() ?? '';
        const authorization = extractTokenFromAuthorization(getHeader(req.headers.authorization)) ?? '';

        if (signature) {
            const rawBody = (req as any).rawBody;
            if (!rawBody) {
                throw new AppError('Thiếu dữ liệu gốc của webhook', 400, 'WEBHOOK_RAW_BODY_MISSING');
            }

            const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
            if (!safeCompare(signature, digest)) {
                throw new AppError('Chữ ký webhook không hợp lệ', 401, 'WEBHOOK_INVALID_SIGNATURE');
            }
            return;
        }

        if (!authorization || !safeCompare(authorization, secret)) {
            throw new AppError('Không có quyền truy cập webhook', 401, 'WEBHOOK_UNAUTHORIZED');
        }
        return;
    }

    if (fallbackToken) {
        const providedToken = getTokenFromRequest(req);
        if (!providedToken || !safeCompare(providedToken, fallbackToken)) {
            throw new AppError('Không có quyền truy cập webhook', 401, 'WEBHOOK_UNAUTHORIZED');
        }
        return;
    }

    if (env.NODE_ENV === 'production') {
        throw new AppError(
            'Webhook chưa được cấu hình xác thực',
            503,
            'WEBHOOK_AUTH_NOT_CONFIGURED',
        );
    }
};
