import { createClient } from 'redis';
import { getEnv } from '../config/env';

type RedisConnection = ReturnType<typeof createClient>;

class RefreshTokenStore {
    private client: RedisConnection | null = null;
    private connectingPromise: Promise<RedisConnection> | null = null;

    private getKey(userId: string, sessionId: string) {
        return `auth:refresh:${userId}:${sessionId}`;
    }

    private async getClient(): Promise<RedisConnection> {
        if (this.client?.isOpen) {
            return this.client;
        }

        if (this.connectingPromise) {
            return this.connectingPromise;
        }

        const env = getEnv();
        const client = createClient({ url: env.REDIS_URL });

        client.on('error', (error) => {
            console.error('Redis client error:', error);
        });

        this.connectingPromise = client.connect()
            .then(() => {
                this.client = client;
                this.connectingPromise = null;
                return client;
            })
            .catch((error) => {
                this.connectingPromise = null;
                throw error;
            });

        return this.connectingPromise;
    }

    async connect() {
        await this.getClient();
    }

    async ping(): Promise<boolean> {
        try {
            const client = await this.getClient();
            await client.ping();
            return true;
        } catch (error) {
            console.error('Redis ping failed:', error);
            return false;
        }
    }

    async storeRefreshToken(userId: string, sessionId: string, refreshToken: string) {
        const client = await this.getClient();
        const env = getEnv();

        await client.set(this.getKey(userId, sessionId), refreshToken, {
            EX: env.JWT_REFRESH_TTL_SECONDS,
        });
    }

    async getRefreshToken(userId: string, sessionId: string) {
        const client = await this.getClient();
        return client.get(this.getKey(userId, sessionId));
    }

    async revokeRefreshToken(userId: string, sessionId: string) {
        const client = await this.getClient();
        await client.del(this.getKey(userId, sessionId));
    }
}

export const refreshTokenStore = new RefreshTokenStore();
