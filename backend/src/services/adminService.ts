import { AppDataSource } from '../config/database';
import { AdminAuditLog } from '../entities/AdminAuditLog';
import { User } from '../entities/User';
import { GymBranch } from '../entities/GymBranch';

const auditRepo = () => AppDataSource.getRepository(AdminAuditLog);
const userRepo = () => AppDataSource.getRepository(User);
const branchRepo = () => AppDataSource.getRepository(GymBranch);

// ─── Action Strategy Map ───────────────────────────────────────────────────
// Maps audit log action strings to actual execution functions.
// Each function receives the full audit log for context (target_user_id, target_resource_id, new_value, etc).
type ActionFn = (log: AdminAuditLog) => Promise<void>;

const ACTION_DISPATCHERS: Record<string, ActionFn> = {

    // Ban/unban a user account
    ban_user: async (log) => {
        if (!log.target_user_id) throw new Error('ban_user requires target_user_id');
        await userRepo().update(log.target_user_id, { is_active: false } as Partial<User>);
    },

    unban_user: async (log) => {
        if (!log.target_user_id) throw new Error('unban_user requires target_user_id');
        await userRepo().update(log.target_user_id, { is_active: true } as Partial<User>);
    },

    // Verify/unverify a trainer
    verify_trainer: async (log) => {
        if (!log.target_user_id) throw new Error('verify_trainer requires target_user_id');
        await userRepo().update(log.target_user_id, { is_verified: true } as Partial<User>);
    },

    unverify_trainer: async (log) => {
        if (!log.target_user_id) throw new Error('unverify_trainer requires target_user_id');
        await userRepo().update(log.target_user_id, { is_verified: false } as Partial<User>);
    },

    // Deactivate a gym branch
    delete_gym_branch: async (log) => {
        if (!log.target_resource_id) throw new Error('delete_gym_branch requires target_resource_id');
        await branchRepo().update(log.target_resource_id, { is_active: false });
    },
};

async function executeAction(log: AdminAuditLog): Promise<void> {
    const dispatcher = ACTION_DISPATCHERS[log.action];
    if (!dispatcher) {
        // Unknown action — log a warning but don't throw (graceful degradation)
        console.warn(`[AdminService] No dispatcher for action "${log.action}". Approved in log only.`);
        return;
    }
    await dispatcher(log);
}

export class AdminService {

    async requestHighRiskAction(adminId: string, action: string, targetUserId: string, targetResourceId: string | null, reason: string, oldValue: string | null, newValue: string | null) {
        // Log the action but mark it as pending
        const auditLog = auditRepo().create({
            admin_id: adminId,
            action,
            action_category: 'high',
            target_user_id: targetUserId,
            target_resource_id: targetResourceId,
            reason,
            old_value: oldValue,
            new_value: newValue,
            result: 'pending' // crucial for 2nd approval
        });

        await auditRepo().save(auditLog);
        return auditLog;
    }

    async approveHighRiskAction(approverId: string, auditLogId: string) {
        const log = await auditRepo().findOneBy({ id: auditLogId });

        if (!log) throw new Error('Audit log not found');
        if (log.result !== 'pending') throw new Error('Action is not pending approval');
        if (log.admin_id === approverId) throw new Error('You cannot approve your own action');

        // Approve and execute
        log.approver_id = approverId;
        log.result = 'approved';
        await auditRepo().save(log);

        // Execute the corresponding action via strategy dispatch
        await executeAction(log);
    }

    async rejectHighRiskAction(approverId: string, auditLogId: string, rejectionReason: string) {
        const log = await auditRepo().findOneBy({ id: auditLogId });

        if (!log) throw new Error('Audit log not found');
        if (log.result !== 'pending') throw new Error('Action is not pending approval');

        // Reject
        log.approver_id = approverId;
        log.result = 'rejected';
        log.reason = `${log.reason} | REJECTED BY ADMIN: ${rejectionReason}`;

        await auditRepo().save(log);
    }

    async logMediumLowRiskAction(adminId: string, action: string, category: 'medium' | 'low', targetUserId: string | null, reason: string) {
        const auditLog = auditRepo().create({
            admin_id: adminId,
            action,
            action_category: category,
            target_user_id: targetUserId,
            reason,
            result: 'executed'
        });

        await auditRepo().save(auditLog);
    }

    async getPendingApprovals() {
        return auditRepo().find({ where: { result: 'pending' }, order: { timestamp: 'ASC' } });
    }

    async getAuditLogs() {
        return auditRepo().find({ order: { timestamp: 'DESC' } });
    }
}

export const adminService = new AdminService();
