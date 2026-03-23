import { Request } from 'express';
import { AppError } from './AppError';

export const getSingleParam = (value: string | string[] | undefined): string =>
    (Array.isArray(value) ? value[0] : value) ?? '';

export const getErrorMessage = (error: unknown, fallback = 'Lỗi hệ thống'): string => {
    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    if (typeof error === 'string' && error.trim()) {
        return error;
    }

    return fallback;
};

export const requireRequestUserId = (req: Request): string => {
    const userId = req.user?.user_id;
    if (!userId) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
    }

    return userId;
};

export const asAppError = (
    error: unknown,
    statusCode: number,
    fallbackMessage = 'Lỗi hệ thống',
    code = 'API_ERROR',
    details?: unknown,
): AppError => {
    if (error instanceof AppError) {
        return error;
    }

    return new AppError(getErrorMessage(error, fallbackMessage), statusCode, code, details);
};
