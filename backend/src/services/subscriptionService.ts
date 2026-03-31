import { AppDataSource } from '../config/database';
import { Subscription } from '../entities/Subscription';
import { Program } from '../entities/Program';
import { notificationService } from './notificationService';
import { getIo } from '../socket';

class SubscriptionService {
    private get subRepo() {
        return AppDataSource.getRepository(Subscription);
    }

    private get programRepo() {
        return AppDataSource.getRepository(Program);
    }

    /**
     * Create a coaching relationship from a conversation/direct agreement.
     * No payment processing — the coach and athlete handle payment externally.
     */
    async createRelationship(userId: string, trainerId: string, programId: string, source: 'message' | 'direct' = 'message', notes?: string) {
        const program = await this.programRepo.findOneBy({ id: programId, trainer_id: trainerId, is_published: true });
        if (!program) throw new Error('Chương trình không tồn tại hoặc chưa được xuất bản');

        // Check for existing active relationship
        const existing = await this.subRepo.findOneBy({ user_id: userId, program_id: programId, status: 'active' });
        if (existing) throw new Error('Bạn đã có quan hệ huấn luyện cho chương trình này');

        const sub = this.subRepo.create({
            user_id: userId,
            trainer_id: trainerId,
            program_id: programId,
            subscription_type: 'one_time',
            status: 'active',
            started_at: new Date(),
            source,
            notes: notes || null,
        });

        const saved = await this.subRepo.save(sub);

        // Increment program client count
        await this.programRepo.increment({ id: programId }, 'current_clients', 1);

        // Notify trainer
        try {
            const notif = await notificationService.create(
                trainerId,
                'system' as any,
                'Học viên mới',
                'Bạn có một học viên mới tham gia chương trình',
                '/dashboard'
            );
            const io = getIo();
            if (io) io.to(trainerId).emit('notification:new', notif);
        } catch (e) {
            console.error('Failed to notify trainer:', e);
        }

        return saved;
    }

    async getUserSubscriptions(userId: string) {
        return this.subRepo.find({
            where: { user_id: userId },
            relations: ['program', 'trainer'],
            order: { created_at: 'DESC' },
        });
    }

    async cancelSubscription(userId: string, subscriptionId: string) {
        const sub = await this.subRepo.findOneBy({ id: subscriptionId, user_id: userId });
        if (!sub) throw new Error('Không tìm thấy quan hệ huấn luyện');
        if (sub.status === 'cancelled') throw new Error('Quan hệ huấn luyện này đã được kết thúc');

        sub.status = 'cancelled';
        sub.ended_at = new Date();

        // Decrement program client count
        await this.programRepo.decrement({ id: sub.program_id }, 'current_clients', 1);

        return this.subRepo.save(sub);
    }

    async getTrainerStats(trainerId: string) {
        const activeCount = await this.subRepo.count({
            where: { trainer_id: trainerId, status: 'active' },
        });

        const recentThreshold = new Date();
        recentThreshold.setDate(recentThreshold.getDate() - 30);

        const newClients30dQuery = await this.subRepo
            .createQueryBuilder('subscription')
            .where('subscription.trainer_id = :trainerId', { trainerId })
            .andWhere('subscription.status = :status', { status: 'active' })
            .andWhere('subscription.created_at >= :recentThreshold', { recentThreshold })
            .getCount();

        return {
            active_clients: activeCount,
            new_clients_30d: newClients30dQuery,
        };
    }
}

export const subscriptionService = new SubscriptionService();
