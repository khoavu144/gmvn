import { createClient } from 'redis';
import { getEnv } from '../config/env';

type RedisConnection = ReturnType<typeof createClient>;

const maskRedisUrl = (rawUrl: string) => {
    try {
        const url = new URL(rawUrl);

        if (url.username) {
            url.username = '***';
        }

        if (url.password) {
            url.password = '***';
        }

        return url.toString();
    } catch {
        return rawUrl.replace(/\/\/([^@]+)@/, '//***@');
    }
};

class RefreshTokenStore {
    private client: RedisConnection | null = null;
    private connectingPromise: Promise<RedisConnection> | null = null;
    private unavailableUntil = 0;

    private getKey(userId: string, sessionId: string) {
        return `auth:refresh:${userId}:${sessionId}`;
    }

    private isInCooldown() {
        return this.unavailableUntil > Date.now();
    }

    private buildCooldownError() {
        const retryInSeconds = Math.max(1, Math.ceil((this.unavailableUntil - Date.now()) / 1000));
        return new Error(`Redis unavailable; retry blocked for ${retryInSeconds}s`);
    }

    private async getClient(): Promise<RedisConnection> {
        if (this.client?.isOpen) {
            return this.client;
        }

        if (this.connectingPromise) {
            return this.connectingPromise;
        }

        if (this.isInCooldown()) {
            throw this.buildCooldownError();
        }

        const env = getEnv();
        const maskedRedisUrl = maskRedisUrl(env.REDIS_URL);
        console.info(`Redis connect target: ${maskedRedisUrl}`);

        const client = createClient({
            url: env.REDIS_URL,
            socket: {
                connectTimeout: 5_000,
                reconnectStrategy: () => false,
            },
        });

        client.on('error', (error) => {
            console.error(`Redis client error (${maskedRedisUrl}):`, error);
        });

        this.connectingPromise = client.connect()
            .then(() => {
                this.client = client;
                this.connectingPromise = null;
                this.unavailableUntil = 0;
                console.info(`Redis connected (${maskedRedisUrl})`);
                return client;
            })
            .catch((error) => {
                this.connectingPromise = null;
                this.client = null;
                this.unavailableUntil = Date.now() + 30_000;
                client.destroy();
                console.error(`Redis initial connect failed (${maskedRedisUrl}):`, error);
                console.warn(`Redis reconnects paused for 30s (${maskedRedisUrl})`);
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
            if (error instanceof Error && error.message.startsWith('Redis unavailable; retry blocked')) {
                return false;
            }

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
