import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('10m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(7 * 24 * 60 * 60),
    RUN_SEED: z.enum(['true', 'false']).optional(),
    SKIP_RATE_LIMIT: z.enum(['true', 'false']).optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

let cachedEnv: AppEnv | null = null;

export const getEnv = (): AppEnv => {
    if (cachedEnv) {
        return cachedEnv;
    }

    const parsed = EnvSchema.safeParse(process.env);

    if (!parsed.success) {
        const details = parsed.error.issues
            .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
            .join('; ');
        throw new Error(`Invalid environment configuration: ${details}`);
    }

    cachedEnv = parsed.data;
    return cachedEnv;
};
