import jwt, { type SignOptions } from 'jsonwebtoken';
import { getEnv } from '../config/env';

export type AppUserType = 'user' | 'athlete' | 'trainer' | 'gym_owner' | 'admin';

export interface TokenPayload {
    user_id: string;
    email: string;
    user_type: AppUserType;
}

export interface RefreshTokenPayload extends TokenPayload {
    session_id: string;
}

const signToken = (payload: object, secret: string, expiresIn: SignOptions['expiresIn']) => {
    return jwt.sign(payload, secret, {
        expiresIn,
        algorithm: 'HS256',
    });
};

export const generateAccessToken = (payload: TokenPayload): string => {
    const env = getEnv();
    return signToken(payload, env.JWT_SECRET, env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn']);
};

export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
    const env = getEnv();
    return signToken(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn']);
};

export const verifyAccessToken = (token: string): TokenPayload => {
    const env = getEnv();
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    const env = getEnv();
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};
