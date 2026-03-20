import { Router } from 'express';
import { authenticate, trainerOnly, athleteOnly, requireAdmin } from '../middleware/auth';
import { getOverview, getClients, getPayments, getAthleteOverview, getAdminStats } from '../controllers/dashboardController';

const router = Router();

router.get('/overview', authenticate, trainerOnly, getOverview);
router.get('/clients', authenticate, trainerOnly, getClients);
router.get('/payments', authenticate, trainerOnly, getPayments);

router.get('/athlete/overview', authenticate, athleteOnly, getAthleteOverview);
router.get('/admin/stats', authenticate, requireAdmin, getAdminStats);

export default router;
