import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
    JWT_REFRESH_SECRET: z.string().min(1, 'JWT_REFRESH_SECRET is required'),
    FRONTEND_URL: z.string().url().default('http://localhost:5173'),
    ALLOWED_ORIGINS: z.string().optional(),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),
    JWT_ACCESS_EXPIRES_IN: z.string().default('10m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_TTL_SECONDS: z.coerce.number().int().positive().default(7 * 24 * 60 * 60),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    SMTP_FROM: z.string().optional(),
    SEPAY_WEBHOOK_SECRET: z.string().optional(),
    RUN_SEED: z.enum(['true', 'false']).optional(),
    SKIP_RATE_LIMIT: z.enum(['true', 'false']).optional(),
}).superRefine((value, ctx) => {
    if (value.NODE_ENV !== 'production') {
        return;
    }

    const requiredKeys: Array<keyof typeof value> = [
        'ALLOWED_ORIGINS',
        'SMTP_HOST',
        'SMTP_PORT',
        'SMTP_USER',
        'SMTP_PASS',
        'SMTP_FROM',
        'SEPAY_WEBHOOK_SECRET',
    ];

    for (const key of requiredKeys) {
        if (!value[key]) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: [key],
                message: `${key} is required in production`,
            });
        }
    }

    if (value.RUN_SEED === 'true') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['RUN_SEED'],
            message: 'RUN_SEED must not be true in production',
        });
    }
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
