import { io, Socket } from 'socket.io-client';
import { logger } from '../lib/logger';

// 1) VITE_API_URL from build env
// 2) Same-origin fallback for production if VITE_API_URL is missing
// 3) Localhost strictly for local development
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');
const SOCKET_URL = API_URL.replace(/\/api\/v1\/?$/, '') || '/';

type MessageContextPayload = {
    context_type?: 'program' | 'product' | 'gym' | 'profile';
    context_id?: string;
    context_label?: string | null;
};

class SocketService {
    private socket: Socket | null = null;

    connect(token: string) {
        if (this.socket?.connected) return this.socket;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            // Socket connected
        });

        this.socket.on('connect_error', (err) => {
            logger.error(`💬 Socket.io connection failed to origin [${SOCKET_URL}]. Reason: ${err.message}`);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    sendMessage(receiver_id: string, content: string, context?: MessageContextPayload) {
        this.socket?.emit('message:send', {
            receiver_id,
            content,
            ...(context?.context_type && context?.context_id
                ? {
                    context_type: context.context_type,
                    context_id: context.context_id,
                    context_label: context.context_label ?? undefined,
                }
                : {}),
        });
    }

    onMessageReceive(callback: (data: any) => void) {
        this.socket?.on('message:receive', callback);
    }

    onMessageSent(callback: (data: any) => void) {
        this.socket?.on('message:sent', callback);
    }

    offMessageReceive() {
        this.socket?.off('message:receive');
    }

    offMessageSent() {
        this.socket?.off('message:sent');
    }

    isConnected() {
        return this.socket?.connected ?? false;
    }
}

export const socketService = new SocketService();
