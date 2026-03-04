import { httpServer } from './app';
import { AppDataSource } from './config/database';
import { initSocket } from './socket';

const PORT = process.env.PORT || 3001;

// Initialize DB and Start Server
AppDataSource.initialize()
    .then(() => {
        console.log('📦 Database connected successfully');

        // Re-initialize socket with the existing httpServer
        initSocket(httpServer);

        // Start scheduled jobs (ranking decay tools)
        import('./services/rankingService').then(({ rankingService }) => {
            rankingService.scheduleCronJobs();
        });

        httpServer.listen(PORT, async () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api/v1`);
            console.log(`💬 Socket.io enabled`);

            // Seed production data if flag is set
            if (process.env.RUN_SEED === 'true') {
                console.log('🌱 RUN_SEED flag detected. Running comprehensive demo seed...');
                try {
                    // We use dynamic import to avoid bundling seed logic if not needed
                    const { seedRemote } = await import('./seeds/comprehensiveDemo');
                    await seedRemote();
                    console.log('✨ Seed completed successfully via boot flag.');
                } catch (seedError) {
                    console.error('❌ Remote seed failed:', seedError);
                }
            }
        });
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    });
