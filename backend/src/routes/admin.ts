import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import {
    getAuditLogs,
    getPendingApprovals,
    approveAction,
    rejectAction,
    getReports,
    getFinancialTransactions,
    getSystemHealth,
    getGoogleFormImportLogs,
    getUserProfileCatalogExport,
} from '../controllers/adminDashboardController';

const router = Router();

// Apply auth and admin check to all routes in this file
router.use(authenticate, adminOnly);

router.get('/audit-logs', getAuditLogs);
router.get('/pending-approvals', getPendingApprovals);
router.post('/approvals/:logId/approve', approveAction);
router.post('/approvals/:logId/reject', rejectAction);

router.get('/reports', getReports);
router.get('/transactions', getFinancialTransactions);
router.get('/health', getSystemHealth);
router.get('/form-imports', getGoogleFormImportLogs);
router.get('/catalog-export', getUserProfileCatalogExport);

export default router;
