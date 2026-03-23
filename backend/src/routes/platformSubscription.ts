import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import {
    getMyPlan,
    getPricingInfo,
    createCheckout,
    cancelMyPlan,
    sepayPlatformWebhook,
    getAdminBillingStatus,
    toggleAdminBilling,
    listAllPlatformSubs,
    listCheckoutIntents,
    listWebhookEvents,
    reconcileBilling,
} from '../controllers/platformSubscriptionController';

const router = Router();

// ── Public ──────────────────────────────────────────────────────────────────
router.get('/pricing', getPricingInfo);  // Pricing page data

// ── Authenticated user ──────────────────────────────────────────────────────
router.get('/plan/me', authenticate, getMyPlan);
router.post('/checkout', authenticate, createCheckout);
router.post('/cancel', authenticate, cancelMyPlan);

// ── SePay webhook (public — called by SePay server) ────────────────────────
router.post('/webhook/sepay', sepayPlatformWebhook);

// ── Admin ───────────────────────────────────────────────────────────────────
router.get('/admin/billing', authenticate, adminOnly, getAdminBillingStatus);
router.patch('/admin/billing', authenticate, adminOnly, toggleAdminBilling);
router.get('/admin/subscriptions', authenticate, adminOnly, listAllPlatformSubs);
router.get('/admin/checkout-intents', authenticate, adminOnly, listCheckoutIntents);
router.get('/admin/webhook-events', authenticate, adminOnly, listWebhookEvents);
router.post('/admin/reconcile', authenticate, adminOnly, reconcileBilling);

export default router;
