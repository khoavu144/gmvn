import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { adminService } from '../services/adminService';
import { listGoogleFormImportLogs } from '../services/googleFormIngestService';
import { systemHealthService } from '../services/systemHealthService';
import { ProgramReport } from '../entities/ProgramReport';
import { FinancialTransaction } from '../entities/FinancialTransaction';
import { User } from '../entities/User';
import { UserProfileSection } from '../entities/UserProfileSection';
import { GymCenter } from '../entities/GymCenter';
import { asyncHandler } from '../utils/asyncHandler';
import { asAppError, getSingleParam, requireRequestUserId } from '../utils/controllerUtils';

export const getAuditLogs = asyncHandler(async (_req: Request, res: Response) => {
    const logs = await adminService.getAuditLogs();
    res.json({ success: true, logs });
});

export const getPendingApprovals = asyncHandler(async (_req: Request, res: Response) => {
    const requests = await adminService.getPendingApprovals();
    res.json({ success: true, requests });
});

export const approveAction = asyncHandler(async (req: Request, res: Response) => {
    try {
        const adminId = requireRequestUserId(req);
        const logId = getSingleParam(req.params.logId);
        await adminService.approveHighRiskAction(adminId, logId);
        res.json({ success: true, message: 'Action approved successfully.' });
    } catch (error) {
        throw asAppError(error, 400, 'Không thể phê duyệt action', 'ADMIN_APPROVE_ACTION_ERROR');
    }
});

export const rejectAction = asyncHandler(async (req: Request, res: Response) => {
    try {
        const adminId = requireRequestUserId(req);
        const logId = getSingleParam(req.params.logId);
        const { reason } = req.body;
        await adminService.rejectHighRiskAction(adminId, logId, reason || 'No reason provided');
        res.json({ success: true, message: 'Action rejected successfully.' });
    } catch (error) {
        throw asAppError(error, 400, 'Không thể từ chối action', 'ADMIN_REJECT_ACTION_ERROR');
    }
});

export const getReports = asyncHandler(async (_req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(ProgramReport);
    const reports = await repo.find({
        order: { reported_at: 'DESC' },
        relations: ['program', 'reporter'],
    });
    res.json({ success: true, reports });
});

export const getFinancialTransactions = asyncHandler(async (_req: Request, res: Response) => {
    const repo = AppDataSource.getRepository(FinancialTransaction);
    const transactions = await repo.find({
        order: { transaction_date: 'DESC' },
        relations: ['program', 'creator', 'buyer'],
    });
    res.json({ success: true, transactions });
});

export const getSystemHealth = asyncHandler(async (_req: Request, res: Response) => {
    const userCount = await AppDataSource.getRepository(User).count();
    const gymCount = await AppDataSource.getRepository(GymCenter).count();
    const snapshot = await systemHealthService.getSnapshot();

    res.status(200).json({
        success: true,
        ...snapshot,
        db: {
            users: userCount,
            gyms: gymCount,
        },
    });
});

export const getGoogleFormImportLogs = asyncHandler(async (req: Request, res: Response) => {
    const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit ?? '50'), 10) || 50));
    const logs = await listGoogleFormImportLogs(limit);
    res.json({ success: true, logs });
});

export const getUserProfileCatalogExport = asyncHandler(async (_req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(UserProfileSection);
        const sections = await repo.find({
            where: { is_active: true },
            relations: ['terms'],
            order: { sort_order: 'ASC' },
        });

        const data = sections.map((section) => ({
            slug: section.slug,
            title_vi: section.title_vi,
            applies_to: section.applies_to,
            terms: (section.terms || [])
                .filter((term) => term.is_active)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((term) => ({ slug: term.slug, label_vi: term.label_vi })),
        }));

        res.json({ success: true, schemaVersion: 1, sections: data });
    } catch (error) {
        throw asAppError(error, 500, 'Không thể export catalog hồ sơ', 'ADMIN_CATALOG_EXPORT_ERROR');
    }
});
