import { AppDataSource } from '../config/database';
import { getEnv } from '../config/env';
import redisClient from '../config/redis';
import { emailService } from './emailService';
import { refreshTokenStore } from './refreshTokenStore';

type CheckStatus = 'up' | 'down' | 'degraded' | 'skipped';

export interface DependencyCheck {
    status: CheckStatus;
    details?: Record<string, unknown>;
}

export interface HealthSnapshot {
    status: 'OK' | 'DEGRADED' | 'ERROR';
    timestamp: string;
    env: string;
    checks: Record<string, DependencyCheck>;
}

const summarizeStatus = (checks: Record<string, DependencyCheck>): HealthSnapshot['status'] => {
    const statuses = Object.values(checks).map((check) => check.status);
    if (statuses.includes('down')) {
        return 'ERROR';
    }

    if (statuses.includes('degraded')) {
        return 'DEGRADED';
    }

    return 'OK';
};

class SystemHealthService {
    async getChecks(): Promise<Record<string, DependencyCheck>> {
        const env = getEnv();
        const checks: Record<string, DependencyCheck> = {};

        let dbHealthy = false;
        try {
            dbHealthy = AppDataSource.isInitialized;
            if (dbHealthy) {
                await AppDataSource.query('SELECT 1');
            }
            checks.database = {
                status: dbHealthy ? 'up' : 'down',
                details: { initialized: AppDataSource.isInitialized },
            };
        } catch (error) {
            checks.database = {
                status: 'down',
                details: { initialized: AppDataSource.isInitialized, error: error instanceof Error ? error.message : String(error) },
            };
        }

        const refreshCacheHealthy = await refreshTokenStore.ping();
        checks.session_store = {
            status: dbHealthy ? 'up' : 'down',
            details: {
                sourceOfTruth: 'postgres',
                cacheHealthy: refreshCacheHealthy,
            },
        };

        checks.redis = {
            status: refreshCacheHealthy ? 'up' : 'degraded',
            details: {
                role: 'cache',
                reachable: refreshCacheHealthy,
            },
        };

        checks.billing = {
            status: 'skipped',
            details: {
                enabled: false,
                mode: 'compatibility_only',
                message: 'Thu phí nền tảng đã bị vô hiệu hóa; các endpoint cũ chỉ còn để tương thích.',
            },
        };

        const emailConfigured = emailService.isConfigured();
        checks.mail = {
            status: env.NODE_ENV === 'production'
                ? (emailConfigured ? 'up' : 'down')
                : (emailConfigured ? 'up' : 'degraded'),
            details: {
                configured: emailConfigured,
                sender: emailService.getDefaultFrom(),
            },
        };

        const genericRedisHealthy = await redisClient.ping();
        checks.billing_cache = {
            status: genericRedisHealthy ? 'up' : 'degraded',
            details: {
                role: 'non-critical cache',
                reachable: genericRedisHealthy,
            },
        };

        return checks;
    }

    async getSnapshot(): Promise<HealthSnapshot> {
        const checks = await this.getChecks();
        return {
            status: summarizeStatus(checks),
            timestamp: new Date().toISOString(),
            env: getEnv().NODE_ENV,
            checks,
        };
    }
}

export const systemHealthService = new SystemHealthService();
