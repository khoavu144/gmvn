import { Router } from 'express';
import { authenticate, proOnly } from '../middleware/auth';
import { getOverview, getClients, getPayments } from '../controllers/dashboardController';

const router = Router();

router.get('/overview', authenticate, proOnly, getOverview);
router.get('/clients', authenticate, proOnly, getClients);
router.get('/payments', authenticate, proOnly, getPayments);

export default router;
