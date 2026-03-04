import { Response } from 'express';

// Standard API response format
export const sendSuccess = (res: Response, data: any, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, data });
};

export const sendError = (res: Response, message: string, statusCode = 400) => {
    return res.status(statusCode).json({ success: false, error: message });
};

// Generate UUID-like ID (for in-memory usage before DB)
export const generateId = (): string => {
    return crypto.randomUUID();
};
