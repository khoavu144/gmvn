import { httpServer } from './app';
import { AppDataSource } from './config/database';
import { getEnv } from './config/env';
import { runPendingMigrations } from './services/sqlMigrationService';
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

        const applied = await runPendingMigrations();
        if (applied.length > 0) {
            console.log(`✅ Applied ${applied.length} pending migration(s): ${applied.map(m => m.name).join(', ')}`);
        }
        await AppDataSource.initialize();
        console.log('📦 Database connected successfully');

        const { rankingService } = await import('./services/rankingService');
        rankingService.scheduleCronJobs();

        const { startPlatformSubCron } = await import('./scripts/expirePlatformSubs');
        startPlatformSubCron();

        // Start News auto-crawl cron (daily 02:00 AM Vietnam time)
        const { startNewsCron } = await import('./services/newsCronScheduler');
        startNewsCron();

        httpServer.listen(env.PORT, async () => {
            console.log(`🚀 Server running on port ${env.PORT}`);
            console.log(`📡 API: http://localhost:${env.PORT}/api/v1`);
            console.log('💬 Socket.io enabled');

            if (!redisConnected) {
                console.warn('⚠️ Application is running in degraded mode without Redis.');
            }

            if (env.RUN_SEED === 'true') {
                console.log('🌱 RUN_SEED flag detected. Running full seed...');
                try {
                    const { fullSeed } = await import('./seeds/fullSeed');
                    await fullSeed();
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
