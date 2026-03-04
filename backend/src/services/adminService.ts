import { AppDataSource } from '../config/database';
import { AdminAuditLog } from '../entities/AdminAuditLog';

const auditRepo = () => AppDataSource.getRepository(AdminAuditLog);

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

        // Ideally here we would dispatch an event or call another service to actually DO the action
        // For example:
        // if (log.action === 'ban_user') await userService.banUser(log.target_user_id);
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
