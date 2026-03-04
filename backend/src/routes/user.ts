import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validateRequest } from '../schemas/auth';
import { updateProfileSchema } from '../schemas/user';

const router = Router();

// Protected profile route
router.put(
    '/profile',
    authenticate,
    validateRequest(updateProfileSchema),
    userController.updateProfile
);

// Public trainer discovery routes
router.get('/trainers', userController.getTrainers);
router.get('/trainers/:id', userController.getTrainerDetail);

export default router;
