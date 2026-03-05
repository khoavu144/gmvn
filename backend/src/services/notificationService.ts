import { AppDataSource } from '../config/database';
import { Notification, NotificationType } from '../entities/Notification';

export const notificationService = {
    /**
     * Tạo notification trong DB.
     * Gọi getIo().to(userId).emit('notification:new', notification) riêng sau khi tạo.
     */
    async create(
        userId: string,
        type: NotificationType,
        title: string,
        body?: string,
        link?: string,
    ): Promise<Notification> {
        const repo = AppDataSource.getRepository(Notification);
        const notif = repo.create({
            user_id: userId,
            type,
            title,
            body: body ?? null,
            link: link ?? null,
            is_read: false,
        });
        return repo.save(notif);
    },

    /** Lấy 30 notification gần nhất + unread count */
    async getByUser(userId: string): Promise<{ notifications: Notification[]; unread_count: number }> {
        const repo = AppDataSource.getRepository(Notification);
        const notifications = await repo.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
            take: 30,
        });
        const unread_count = notifications.filter(n => !n.is_read).length;
        return { notifications, unread_count };
    },

    /** Đánh dấu 1 notification đã đọc */
    async markRead(notificationId: string, userId: string): Promise<void> {
        const repo = AppDataSource.getRepository(Notification);
        await repo.update({ id: notificationId, user_id: userId }, { is_read: true });
    },

    /** Đánh dấu tất cả đã đọc */
    async markAllRead(userId: string): Promise<void> {
        const repo = AppDataSource.getRepository(Notification);
        await repo.update({ user_id: userId, is_read: false }, { is_read: true });
    },

    /** Unread count only */
    async getUnreadCount(userId: string): Promise<number> {
        const repo = AppDataSource.getRepository(Notification);
        return repo.count({ where: { user_id: userId, is_read: false } });
    },
};
