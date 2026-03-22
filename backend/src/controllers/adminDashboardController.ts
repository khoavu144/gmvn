import { Request, Response } from 'express';
import { adminService } from '../services/adminService';
import { AppDataSource } from '../config/database';
import { ProgramReport } from '../entities/ProgramReport';
import { FinancialTransaction } from '../entities/FinancialTransaction';
import { User } from '../entities/User';
import { UserProfileSection } from '../entities/UserProfileSection';
import { GymCenter } from '../entities/GymCenter';
import { refreshTokenStore } from '../services/refreshTokenStore';
import { listGoogleFormImportLogs } from '../services/googleFormIngestService';

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const logs = await adminService.getAuditLogs();
        res.json({ success: true, logs });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getPendingApprovals = async (req: Request, res: Response) => {
    try {
        const requests = await adminService.getPendingApprovals();
        res.json({ success: true, requests });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const approveAction = async (req: Request, res: Response) => {
    try {
        const adminId = req.user!.user_id;
        const logId = String(req.params.logId);
        await adminService.approveHighRiskAction(adminId, logId);
        res.json({ success: true, message: 'Action approved successfully.' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const rejectAction = async (req: Request, res: Response) => {
    try {
        const adminId = req.user!.user_id;
        const logId = String(req.params.logId);
        const { reason } = req.body;
        await adminService.rejectHighRiskAction(adminId, logId, reason || 'No reason provided');
        res.json({ success: true, message: 'Action rejected successfully.' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
export const getReports = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(ProgramReport);
        const reports = await repo.find({
            order: { reported_at: 'DESC' },
            relations: ['program', 'reporter']
        });
        res.json({ success: true, reports });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getFinancialTransactions = async (req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(FinancialTransaction);
        const transactions = await repo.find({
            order: { transaction_date: 'DESC' },
            relations: ['program', 'creator', 'buyer']
        });
        res.json({ success: true, transactions });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// P0-4: Secure health metrics endpoint
export const getSystemHealth = async (_req: Request, res: Response) => {
    try {
        const userCount = await AppDataSource.getRepository(User).count();
        const gymCount = await AppDataSource.getRepository(GymCenter).count();
        const redisHealthy = await refreshTokenStore.ping();
        res.status(200).json({
            success: true,
            status: redisHealthy ? 'OK' : 'DEGRADED',
            timestamp: new Date().toISOString(),
            db: {
                users: userCount,
                gyms: gymCount
            },
            redis: {
                connected: redisHealthy
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const getGoogleFormImportLogs = async (req: Request, res: Response) => {
    try {
        const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit ?? '50'), 10) || 50));
        const logs = await listGoogleFormImportLogs(limit);
        res.json({ success: true, logs });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

/** JSON để đồng bộ checkbox Google Form với slug nội bộ (admin only). */
export const getUserProfileCatalogExport = async (_req: Request, res: Response) => {
    try {
        const repo = AppDataSource.getRepository(UserProfileSection);
        const sections = await repo.find({
            where: { is_active: true },
            relations: ['terms'],
            order: { sort_order: 'ASC' },
        });
        const data = sections.map((s) => ({
            slug: s.slug,
            title_vi: s.title_vi,
            applies_to: s.applies_to,
            terms: (s.terms || [])
                .filter((t) => t.is_active)
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((t) => ({ slug: t.slug, label_vi: t.label_vi })),
        }));
        res.json({ success: true, schemaVersion: 1, sections: data });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};
