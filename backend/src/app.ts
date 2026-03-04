import 'reflect-metadata';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import programRoutes from './routes/program';
import subscriptionRoutes from './routes/subscription';
import messageRoutes from './routes/message';
import dashboardRoutes from './routes/dashboard';
import workoutProgressRoutes from './routes/workoutProgress';
import profileRoutes from './routes/profile';
import uploadRoutes from './routes/upload';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { AppDataSource } from './config/database';
import { initSocket } from './socket';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

const isDev = process.env.NODE_ENV !== 'production';
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: isDev ? 1000 : 100, // Dev: 1000/min, Production: 100/min
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev && process.env.SKIP_RATE_LIMIT === 'true',
    message: { error: 'Too many requests from this IP, please try again after a minute' }
});

// Apply the rate limiting middleware to API calls only
app.use('/api/v1/', apiLimiter);

app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/programs', programRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
// Workout progress routes mount at root (they mix /subscriptions and /users paths)
app.use('/api/v1', workoutProgressRoutes);
app.use('/api/v1/profiles', profileRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Health check
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Create HTTP server (needed for Socket.io)
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

// Export app and server components for standalone use (like testing)
export { httpServer, app };
export default app;
