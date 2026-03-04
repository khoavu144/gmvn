import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    createCheckout,
    checkSubscriptionStatus,
    getMySubscriptions,
    cancelSubscription,
    sepayWebhook,
} from '../controllers/subscriptionController';

const router = Router();

router.post('/', authenticate, createCheckout);
router.get('/status', authenticate, checkSubscriptionStatus);
router.get('/me', authenticate, getMySubscriptions);
router.post('/:id/cancel', authenticate, cancelSubscription);
router.post('/webhook/sepay', sepayWebhook); // Public - Sepay calls this

export default router;
