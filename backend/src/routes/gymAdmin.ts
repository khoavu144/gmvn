import { Router } from 'express';
import { gymAdminController } from '../controllers/gymAdminController';
import { authenticate, adminOnly } from '../middleware/auth';

const router = Router();

// Tất cả admin gym routes cần auth + admin role
router.use(authenticate, adminOnly);

router.get('/pending', gymAdminController.getPendingGyms);
router.get('/', gymAdminController.getAllGyms);
router.post('/:centerId/approve', gymAdminController.approveGym);
router.post('/:centerId/reject', gymAdminController.rejectGym);
router.put('/:centerId/suspend', gymAdminController.suspendGym);
router.patch('/reviews/:reviewId/toggle', gymAdminController.toggleReview);

export default router;
