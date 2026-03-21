import { createClient } from 'redis';
import { getEnv } from './env';

const env = getEnv();

const redisClient = createClient({
    url: env.REDIS_URL,
    socket: {
        connectTimeout: 5_000,
        reconnectStrategy: (retries) => {
            if (retries > 5) return false;
            return Math.min(retries * 50, 2000);
        },
    },
});

redisClient.on('error', (error) => {
    console.error('Redis default client error:', error.message);
});

// Start connection asynchronously. Operations will queue until connected.
redisClient.connect().catch((err) => {
    console.error('Redis default client failed to connect:', err.message);
});

export default redisClient;
