import { httpServer } from './app';
import { AppDataSource } from './config/database';
import { getEnv } from './config/env';
import { assertNoPendingMigrations } from './services/sqlMigrationService';
import { refreshTokenStore } from './services/refreshTokenStore';

const bootstrap = async () => {
    try {
        const env = getEnv();

        await refreshTokenStore.connect();
        console.log('🔌 Redis connected successfully');

        await assertNoPendingMigrations();
        await AppDataSource.initialize();
        console.log('📦 Database connected successfully');

        const { rankingService } = await import('./services/rankingService');
        rankingService.scheduleCronJobs();

        httpServer.listen(env.PORT, async () => {
            console.log(`🚀 Server running on port ${env.PORT}`);
            console.log(`📡 API: http://localhost:${env.PORT}/api/v1`);
            console.log('💬 Socket.io enabled');

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
