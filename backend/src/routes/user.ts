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
router.get('/trainers/slug/:slug', userController.getTrainerBySlug);
router.get('/trainers/:id/similar', userController.getSimilarCoaches);
router.get('/trainers/:id/testimonials', userController.getTestimonials);
router.get('/trainers/:id/before-after', userController.getBeforeAfterPhotos);

// Generic user-by-slug lookup (returns trainer or athlete)
router.get('/slug/:slug', userController.getUserBySlug);


export default router;
