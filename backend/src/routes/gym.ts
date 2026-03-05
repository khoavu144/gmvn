import { Router } from 'express';
import { gymController } from '../controllers/gymController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Specific routes first
router.get('/check-review/:gymId', authenticate, gymController.checkReviewEligibility);
router.get('/trainer/:trainerId', gymController.getTrainerGyms);

// Public routes
router.get('/', gymController.listGyms);
router.get('/:gymId', gymController.getGymCenter);
router.get('/:gymId/branches/:branchId', gymController.getBranchDetail);
router.get('/:gymId/trainers', gymController.getGymTrainers);
router.get('/:gymId/reviews', gymController.getGymReviews);

// Review actions
router.post('/:gymId/reviews', authenticate, gymController.createReview);
router.put('/:gymId/reviews/:reviewId', authenticate, gymController.updateReview);
router.delete('/:gymId/reviews/:reviewId', authenticate, gymController.deleteReview);
// Sprint 3: Review Reply (gym_owner / trainer only)
router.post('/:gymId/reviews/:reviewId/reply', authenticate, gymController.replyToReview);

export default router;
