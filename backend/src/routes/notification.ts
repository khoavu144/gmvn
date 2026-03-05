import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All notification routes require auth
router.use(authenticate);

router.get('/', notificationController.getMyNotifications);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

export default router;
