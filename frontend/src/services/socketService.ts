import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const SOCKET_URL = API_URL.replace('/api/v1', '');

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
            console.error('💬 Socket.io error:', err.message);
        });

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    sendMessage(receiver_id: string, content: string) {
        this.socket?.emit('message:send', { receiver_id, content });
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

    isConnected() {
        return this.socket?.connected ?? false;
    }
}

export const socketService = new SocketService();
