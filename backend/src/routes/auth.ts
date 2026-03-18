import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController';
import { getEnv } from '../config/env';
import { authenticate } from '../middleware/auth';
import {
    validateRequest,
    RegisterSchema,
    LoginSchema,
    RefreshTokenSchema,
    LogoutSchema,
} from '../schemas/auth';

const router = Router();
const env = getEnv();
const isDev = env.NODE_ENV !== 'production';

const authAttemptLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 200 : 10,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev && env.SKIP_RATE_LIMIT === 'true',
    message: {
        error: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
});

const refreshTokenLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDev ? 300 : 30,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev && env.SKIP_RATE_LIMIT === 'true',
    message: {
        error: 'Too many token refresh attempts. Please try again in 15 minutes.',
    },
});

// Public routes
router.post('/register', authAttemptLimiter, validateRequest(RegisterSchema), authController.register);
router.post('/login', authAttemptLimiter, validateRequest(LoginSchema), authController.login);
router.post('/refresh', refreshTokenLimiter, validateRequest(RefreshTokenSchema), authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, validateRequest(LogoutSchema), authController.logout);
router.get('/me', authenticate, authController.getProfile);

export default router;
