import { httpServer } from './app';
import { AppDataSource } from './config/database';
import { getEnv } from './config/env';
import { assertNoPendingMigrations } from './services/sqlMigrationService';
import { refreshTokenStore } from './services/refreshTokenStore';

const bootstrap = async () => {
    try {
        const env = getEnv();
        let redisConnected = false;

        try {
            await refreshTokenStore.connect();
            redisConnected = true;
            console.log('🔌 Redis connected successfully');
        } catch (error) {
            console.warn('⚠️ Redis unavailable. Continuing boot in degraded mode; refresh-token persistence and Redis-backed health checks will remain degraded until Redis is restored.');
            console.warn('⚠️ Redis bootstrap error:', error);
        }

        await assertNoPendingMigrations();
        await AppDataSource.initialize();
        console.log('📦 Database connected successfully');

        const { rankingService } = await import('./services/rankingService');
        rankingService.scheduleCronJobs();

        httpServer.listen(env.PORT, async () => {
            console.log(`🚀 Server running on port ${env.PORT}`);
            console.log(`📡 API: http://localhost:${env.PORT}/api/v1`);
            console.log('💬 Socket.io enabled');

            if (!redisConnected) {
                console.warn('⚠️ Application is running in degraded mode without Redis.');
            }

            if (env.RUN_SEED === 'true') {
                console.log('🌱 RUN_SEED flag detected. Running comprehensive demo seed...');
                try {
                    const { seedRemote } = await import('./seeds/comprehensiveDemo');
                    await seedRemote();
                    console.log('✨ Seed completed successfully via boot flag.');
                } catch (seedError) {
                    console.error('❌ Remote seed failed:', seedError);
                }
            }
        });
    } catch (error) {
        console.error('❌ Server boot failed:', error);
        process.exit(1);
    }
};

void bootstrap();
