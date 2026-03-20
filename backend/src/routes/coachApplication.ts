import { Router } from 'express';
import { coachApplicationController } from '../controllers/coachApplicationController';
import { authenticate } from '../middleware/auth';
import { adminOnly } from '../middleware/auth';

const router = Router();

// ─── Athlete routes (any authenticated user who is athlete) ───────────────
/** Submit a new application */
router.post('/', authenticate, coachApplicationController.apply);

/** Check own application status */
router.get('/mine', authenticate, coachApplicationController.getMine);

// ─── Admin routes ─────────────────────────────────────────────────────────
/** List all pending applications */
router.get('/', authenticate, adminOnly, coachApplicationController.listPending);

/** Approve an application */
router.patch('/:id/approve', authenticate, adminOnly, coachApplicationController.approve);

/** Reject an application with reason */
router.patch('/:id/reject', authenticate, adminOnly, coachApplicationController.reject);

export default router;
