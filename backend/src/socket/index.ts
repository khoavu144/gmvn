import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { messageService } from '../services/messageService';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../entities/Notification';

let io: Server;

/**
 * Sprint 3 helper: push a notification to a specific user via Socket.IO.
 * Call this after notificationService.create() to deliver realtime.
 */
export const emitNotification = (userId: string, notification: Notification) => {
    if (io) {
        io.to(userId).emit('notification:new', notification);
    }
};

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    // Middleware: authenticate via JWT token sent in handshake
    io.use((socket: Socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Authentication error: no token'));
        }
        try {
            const payload = verifyAccessToken(token);
            (socket as any).user = payload;
            next();
        } catch {
            next(new Error('Authentication error: invalid token'));
        }
    });

    io.on('connection', async (socket: Socket) => {
        const user = (socket as any).user;

        // Join a room with user's own ID so we can target them
        socket.join(user.user_id);

        // Sprint 3: Send unread notification count on connect
        try {
            const count = await notificationService.getUnreadCount(user.user_id);
            socket.emit('notification:unread_count', { count });
        } catch {
            // Non-fatal: ignore if notifications table doesn't exist yet
        }

        // Handle sending a message
        socket.on('message:send', async (data: { receiver_id: string; content: string }) => {
            try {
                const { receiver_id, content } = data;
                if (!receiver_id || !content) return;

                const message = await messageService.sendMessage(user.user_id, receiver_id, content);

                // Emit to sender (confirm)
                socket.emit('message:sent', { success: true, message });

                // Emit to receiver if online
                io.to(receiver_id).emit('message:receive', {
                    message: {
                        id: message.id,
                        sender_id: user.user_id,
                        receiver_id,
                        content,
                        created_at: message.created_at,
                        is_read: false,
                    },
                });
            } catch (err: any) {
                socket.emit('message:error', { error: err.message });
            }
        });

        // Mark message as read
        socket.on('message:read', async (data: { message_id: string }) => {
            try {
                await messageService.markAsRead(data.message_id, user.user_id);
                socket.emit('message:read_confirmed', { message_id: data.message_id });
            } catch (err: any) {
                socket.emit('message:error', { error: err.message });
            }
        });

        socket.on('disconnect', () => {
            // Socket disconnected
        });
    });

    return io;
};

export const getIo = () => io;
