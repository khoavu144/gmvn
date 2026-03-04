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

        httpServer.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 API: http://localhost:${PORT}/api/v1`);
            console.log(`💬 Socket.io enabled`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    });
