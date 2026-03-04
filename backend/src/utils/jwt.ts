import jwt from 'jsonwebtoken';

export interface TokenPayload {
    user_id: string;
    email: string;
    user_type: 'user' | 'athlete' | 'trainer' | 'admin';
}

export const generateAccessToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: '15m',
        algorithm: 'HS256',
    });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: '7d',
        algorithm: 'HS256',
    });
};

export const verifyAccessToken = (token: string): TokenPayload => {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
};
