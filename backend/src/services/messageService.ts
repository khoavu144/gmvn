import { AppDataSource } from '../config/database';
import { Message } from '../entities/Message';
import { MoreThan, LessThan } from 'typeorm';

const messageRepo = AppDataSource.getRepository(Message);

class MessageService {
    async sendMessage(senderId: string, receiverId: string, content: string) {
        const message = messageRepo.create({
            sender_id: senderId,
            receiver_id: receiverId,
            content,
        });
        return messageRepo.save(message);
    }

    async getConversations(userId: string) {
        // Get all unique partners for this user
        const sent = await messageRepo
            .createQueryBuilder('msg')
            .select('msg.receiver_id', 'partner_id')
            .where('msg.sender_id = :uid', { uid: userId })
            .getRawMany();

        const received = await messageRepo
            .createQueryBuilder('msg')
            .select('msg.sender_id', 'partner_id')
            .where('msg.receiver_id = :uid', { uid: userId })
            .getRawMany();

        const partnerIds = [
            ...new Set([
                ...sent.map((r: any) => r.partner_id),
                ...received.map((r: any) => r.partner_id),
            ]),
        ];

        const conversations = await Promise.all(
            partnerIds.map(async (partnerId) => {
                const lastMessage = await messageRepo.findOne({
                    where: [
                        { sender_id: userId, receiver_id: partnerId },
                        { sender_id: partnerId, receiver_id: userId },
                    ],
                    relations: ['sender', 'receiver'],
                    order: { created_at: 'DESC' },
                });

                const unreadCount = await messageRepo.count({
                    where: { sender_id: partnerId, receiver_id: userId, is_read: false },
                });

                const partner = lastMessage?.sender_id === userId
                    ? lastMessage?.receiver
                    : lastMessage?.sender;

                return {
                    partner_id: partnerId,
                    partner: partner
                        ? {
                            id: partner.id,
                            full_name: partner.full_name,
                            avatar_url: partner.avatar_url,
                        }
                        : null,
                    last_message: lastMessage
                        ? {
                            content: lastMessage.content,
                            created_at: lastMessage.created_at,
                            is_read: lastMessage.is_read,
                        }
                        : null,
                    unread_count: unreadCount,
                };
            })
        );

        return conversations.sort((a, b) => {
            const aTime = a.last_message?.created_at?.getTime() ?? 0;
            const bTime = b.last_message?.created_at?.getTime() ?? 0;
            return bTime - aTime;
        });
    }

    async getMessages(userId: string, partnerId: string, limit = 30, offset = 0) {
        const messages = await messageRepo.find({
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
        await messageRepo
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
        const message = await messageRepo.findOneBy({ id: messageId, receiver_id: userId });
        if (!message) throw new Error('Message not found');
        message.is_read = true;
        message.read_at = new Date();
        return messageRepo.save(message);
    }

    async getUnreadCount(userId: string) {
        return messageRepo.count({
            where: { receiver_id: userId, is_read: false },
        });
    }
}

export const messageService = new MessageService();
