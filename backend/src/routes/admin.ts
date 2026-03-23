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
import {
    getBillingOpsOverview,
    listEmailOutbox,
    resendVerificationForUser,
    retryEmailOutboxRecord,
} from '../controllers/adminSupportController';

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
router.get('/billing-ops/overview', getBillingOpsOverview);
router.get('/email-outbox', listEmailOutbox);
router.post('/email-outbox/:id/retry', retryEmailOutboxRecord);
router.post('/users/:userId/resend-verification', resendVerificationForUser);

export default router;
