import { AppDataSource } from '../config/database';
import { Message, type MessageContextType } from '../entities/Message';
import { User } from '../entities/User';

type SendMessageContext = {
    context_type?: MessageContextType | null;
    context_id?: string | null;
    context_label?: string | null;
};

class MessageService {
    private get repo() {
        return AppDataSource.getRepository(Message);
    }

    async sendMessage(senderId: string, receiverId: string, content: string, context: SendMessageContext = {}) {
        const hasContext = Boolean(context.context_type && context.context_id);
        const message = this.repo.create({
            sender_id: senderId,
            receiver_id: receiverId,
            content,
            context_type: hasContext ? context.context_type ?? null : null,
            context_id: hasContext ? context.context_id ?? null : null,
            context_label: hasContext ? context.context_label?.trim() || null : null,
        });
        return this.repo.save(message);
    }

    async getConversations(userId: string) {
        // BUG-18 Fix: Use 2 queries instead of N+1
        // Query 1: Get all unique partners + last message in one go using raw SQL
        const lastMessagesRaw = await this.repo.query(`
            SELECT DISTINCT ON (partner_id)
                CASE
                    WHEN sender_id = $1 THEN receiver_id
                    ELSE sender_id
                END AS partner_id,
                id, content, context_type, context_label, created_at, is_read, sender_id, receiver_id
            FROM messages
            WHERE sender_id = $1 OR receiver_id = $1
            ORDER BY partner_id, created_at DESC
        `, [userId]);

        if (lastMessagesRaw.length === 0) return [];

        const partnerIds: string[] = lastMessagesRaw.map((r: any) => r.partner_id);

        // Query 2: Get all partner user info at once
        const userRepo = AppDataSource.getRepository(User);
        const partners = await userRepo
            .createQueryBuilder('u')
            .select(['u.id', 'u.full_name', 'u.avatar_url'])
            .where('u.id IN (:...ids)', { ids: partnerIds })
            .getMany();

        const partnerMap = new Map(partners.map(p => [p.id, p]));

        // Query 3: Get unread counts for all partners in one shot
        const unreadRaw = await this.repo.query(`
            SELECT sender_id, COUNT(*)::int AS unread_count
            FROM messages
            WHERE receiver_id = $1 AND is_read = false
            GROUP BY sender_id
        `, [userId]);

        const unreadMap = new Map<string, number>(unreadRaw.map((r: any) => [r.sender_id, r.unread_count]));

        const conversations = lastMessagesRaw.map((msg: any) => {
            const partner = partnerMap.get(msg.partner_id);
            return {
                partner_id: msg.partner_id,
                partner: partner
                    ? { id: partner.id, full_name: partner.full_name, avatar_url: partner.avatar_url }
                    : null,
                last_message: {
                    content: msg.content,
                    context_type: msg.context_type,
                    context_label: msg.context_label,
                    created_at: msg.created_at,
                    is_read: msg.is_read,
                },
                unread_count: unreadMap.get(msg.partner_id) ?? 0,
            };
        });

        // Sort by last message time (newest first)
        return conversations.sort((a: any, b: any) => {
            const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
            const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
            return bTime - aTime;
        });
    }

    async getMessages(userId: string, partnerId: string, limit = 30, offset = 0) {
        const messages = await this.repo.find({
            where: [
                { sender_id: userId, receiver_id: partnerId },
                { sender_id: partnerId, receiver_id: userId },
            ],
            relations: ['sender'],
            order: { created_at: 'DESC' },
            take: limit,
            skip: offset,
        });

        // Mark unread messages as read
        await this.repo
            .createQueryBuilder()
            .update(Message)
            .set({ is_read: true, read_at: new Date() })
            .where('sender_id = :partnerId AND receiver_id = :userId AND is_read = false', {
                partnerId,
                userId,
            })
            .execute();

        return messages.reverse();
    }

    async markAsRead(messageId: string, userId: string) {
        const message = await this.repo.findOneBy({ id: messageId, receiver_id: userId });
        if (!message) throw new Error('Message not found');
        message.is_read = true;
        message.read_at = new Date();
        return this.repo.save(message);
    }

    async getUnreadCount(userId: string) {
        return this.repo.count({
            where: { receiver_id: userId, is_read: false },
        });
    }
}

export const messageService = new MessageService();
