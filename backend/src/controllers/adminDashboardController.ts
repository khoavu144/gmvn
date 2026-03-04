import { Request, Response } from 'express';
import { adminService } from '../services/adminService';
import { AppDataSource } from '../config/database';
import { ProgramReport } from '../entities/ProgramReport';
import { FinancialTransaction } from '../entities/FinancialTransaction';

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
