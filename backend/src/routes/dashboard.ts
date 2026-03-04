import { Router } from 'express';
import { authenticate, trainerOnly } from '../middleware/auth';
import { getOverview, getClients, getPayments } from '../controllers/dashboardController';

const router = Router();

router.get('/overview', authenticate, trainerOnly, getOverview);
router.get('/clients', authenticate, trainerOnly, getClients);
router.get('/payments', authenticate, trainerOnly, getPayments);

export default router;
