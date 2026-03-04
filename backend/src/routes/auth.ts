import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import {
    validateRequest,
    RegisterSchema,
    LoginSchema,
    RefreshTokenSchema,
} from '../schemas/auth';

const router = Router();

// Public routes
router.post('/register', validateRequest(RegisterSchema), authController.register);
router.post('/login', validateRequest(LoginSchema), authController.login);
router.post('/refresh', validateRequest(RefreshTokenSchema), authController.refreshToken);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getProfile);

export default router;
