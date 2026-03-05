import apiClient from './api';
import type { Notification } from '../types';

export const notificationService = {
    async getMyNotifications(): Promise<{ notifications: Notification[]; unread_count: number }> {
        const res = await apiClient.get('/notifications');
        return res.data;
    },

    async markRead(id: string): Promise<void> {
        await apiClient.patch(`/notifications/${id}/read`);
    },

    async markAllRead(): Promise<void> {
        await apiClient.patch('/notifications/read-all');
    },
};
