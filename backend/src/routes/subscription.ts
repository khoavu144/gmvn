import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
    createCheckout,
    createRelationship,
    checkSubscriptionStatus,
    getMySubscriptions,
    cancelSubscription,
    sepayWebhook,
} from '../controllers/subscriptionController';

const router = Router();

router.post('/', authenticate, createCheckout); // deprecated — returns 410
router.post('/relationship', authenticate, createRelationship);
router.get('/status', authenticate, checkSubscriptionStatus);
router.get('/me', authenticate, getMySubscriptions);
router.post('/:id/cancel', authenticate, cancelSubscription);
router.post('/webhook/sepay', sepayWebhook); // deprecated — returns ignored

export default router;
