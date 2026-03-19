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
    SendVerificationSchema,
    VerifyEmailSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
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
router.post('/forgot-password', authAttemptLimiter, validateRequest(ForgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', authAttemptLimiter, validateRequest(ResetPasswordSchema), authController.resetPassword);

// Protected routes
router.post('/logout', authenticate, validateRequest(LogoutSchema), authController.logout);
router.get('/me', authenticate, authController.getProfile);
router.post('/send-verification', authenticate, validateRequest(SendVerificationSchema), authController.sendVerification);
router.post('/verify-email', authenticate, validateRequest(VerifyEmailSchema), authController.verifyEmail);
router.post('/complete-onboarding', authenticate, authController.completeOnboarding);

export default router;
