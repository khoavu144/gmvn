import { createClient } from 'redis';
import { getEnv } from './env';

type RedisConnection = ReturnType<typeof createClient>;

const maskRedisUrl = (rawUrl: string) => {
    try {
        const url = new URL(rawUrl);
        if (url.username) url.username = '***';
        if (url.password) url.password = '***';
        return url.toString();
    } catch {
        return rawUrl.replace(/\/\/([^@]+)@/, '//***@');
    }
};

class LazyRedisClient {
    private client: RedisConnection | null = null;
    private connectingPromise: Promise<RedisConnection> | null = null;
    private unavailableUntil = 0;

    private isInCooldown() {
        return this.unavailableUntil > Date.now();
    }

    private async getClient() {
        if (this.client?.isOpen) {
            return this.client;
        }

        if (this.connectingPromise) {
            return this.connectingPromise;
        }

        if (this.isInCooldown()) {
            throw new Error('Redis cache unavailable during cooldown');
        }

        const env = getEnv();
        const maskedRedisUrl = maskRedisUrl(env.REDIS_URL);
        const client = createClient({
            url: env.REDIS_URL,
            socket: {
                connectTimeout: 5_000,
                reconnectStrategy: () => false,
            },
        });

        client.on('error', (error) => {
            console.error(`Redis cache error (${maskedRedisUrl}):`, error);
        });

        this.connectingPromise = client.connect()
            .then(() => {
                this.client = client;
                this.connectingPromise = null;
                this.unavailableUntil = 0;
                return client;
            })
            .catch((error) => {
                this.connectingPromise = null;
                this.client = null;
                this.unavailableUntil = Date.now() + 30_000;
                client.destroy();
                console.warn(`Redis cache connect failed (${maskedRedisUrl}):`, error);
                throw error;
            });

        return this.connectingPromise;
    }

    async get(key: string) {
        const client = await this.getClient();
        return client.get(key);
    }

    async set(key: string, value: string, options?: { EX?: number }) {
        const client = await this.getClient();
        return client.set(key, value, options);
    }

    async del(key: string) {
        const client = await this.getClient();
        return client.del(key);
    }

    async ping() {
        try {
            const client = await this.getClient();
            await client.ping();
            return true;
        } catch {
            return false;
        }
    }
}

const redisClient = new LazyRedisClient();

export default redisClient;
