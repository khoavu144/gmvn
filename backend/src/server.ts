import { httpServer } from './app';
import { AppDataSource } from './config/database';
import { getEnv } from './config/env';
import { runPendingMigrations } from './services/sqlMigrationService';
import { refreshTokenStore } from './services/refreshTokenStore';
import { emailOutboxService } from './services/emailOutboxService';
import { opsWatchdogService } from './services/opsWatchdogService';
import { sentryService } from './services/sentryService';

const bootstrap = async () => {
    try {
        const env = getEnv();
        if (env.NODE_ENV === 'production' && env.RUN_SEED === 'true') {
            throw new Error('RUN_SEED=true is forbidden in production');
        }

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

        // Platform billing is permanently disabled in free-first mode.

        // Start News auto-crawl cron (daily 02:00 AM Vietnam time)
        const { startNewsCron } = await import('./services/newsCronScheduler');
        startNewsCron();

        const runEmailOutboxWorker = async () => {
            try {
                const processed = await emailOutboxService.processPending();
                if (processed.length > 0) {
                    console.log(`📬 Processed ${processed.length} email outbox record(s)`);
                }
            } catch (error) {
                console.error('❌ Email outbox worker failed:', error);
            }
        };

        await runEmailOutboxWorker();
        setInterval(runEmailOutboxWorker, 60_000).unref();

        const runOpsWatchdog = async () => {
            try {
                await opsWatchdogService.runCheck();
            } catch (error) {
                console.error('❌ Ops watchdog failed:', error);
            }
        };
        await runOpsWatchdog();
        setInterval(runOpsWatchdog, 60_000).unref();

        httpServer.listen(env.PORT, async () => {
            console.log(`🚀 Server running on port ${env.PORT}`);
            console.log(`📡 API: http://localhost:${env.PORT}/api/v1`);
            console.log('💬 Socket.io enabled');
            if (sentryService.isEnabled()) {
                console.log('🛰️ Sentry transport enabled');
            }

            if (!redisConnected) {
                console.warn('⚠️ Application is running in degraded mode without Redis.');
            }

            if (env.RUN_SEED === 'true' && env.NODE_ENV !== 'production') {
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
        void sentryService.captureException(error, {
            tags: {
                phase: 'bootstrap',
            },
        });
        process.exit(1);
    }
};

void bootstrap();
