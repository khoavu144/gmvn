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
import adminRoutes from './routes/admin';
import gymRoutes from './routes/gym';
import gymOwnerRoutes from './routes/gymOwner';
import gymAdminRoutes from './routes/gymAdmin';
import notificationRoutes from './routes/notification';
import communityGalleryRoutes from './routes/communityGallery';
import coachApplicationRoutes from './routes/coachApplication';
import shareRoutes from './routes/share';
import platformSubscriptionRoutes from './routes/platformSubscription';
import marketplaceRoutes from './routes/marketplace';
import newsRoutes from './routes/news';
import googleFormIngestRoutes from './routes/googleFormIngest';
import userProfileCatalogRoutes from './routes/userProfileCatalog';
import { generateSitemap } from './controllers/sitemapController';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { getEnv } from './config/env';
import { initSocket } from './socket';
import { requestLogger } from './middleware/requestLogger';
import { systemHealthService } from './services/systemHealthService';

dotenv.config();

const app = express();
const env = getEnv();

// Trust reverse proxy (Render, Nginx) — required for express-rate-limit & real IP
app.set('trust proxy', 1);

// SEO: Sitemap (public, before auth middleware, cached 6h)
app.get('/sitemap.xml', generateSitemap);

// Middleware
// Share HTML at /share/* uses inline <style> only; no inline scripts (meta refresh + link).
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        }
    }
}));
app.use(requestLogger);
const defaultOrigins = ['http://localhost:5173', 'https://gymerviet.com', 'https://www.gymerviet.com'];
const allowedOrigins = Array.from(new Set([
    ...defaultOrigins,
    env.FRONTEND_URL,
    ...(env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? []),
]));

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Nguồn truy cập không được phép bởi CORS'));
        }
    },
    credentials: true,
}));

const isDev = env.NODE_ENV !== 'production';
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: isDev ? 1000 : 100, // Dev: 1000/min, Production: 100/min
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isDev && process.env.SKIP_RATE_LIMIT === 'true',
    message: { error: 'Quá nhiều yêu cầu từ địa chỉ IP này. Vui lòng thử lại sau 1 phút.' }
});

// Apply the rate limiting middleware to API calls only
app.use('/api/v1/', apiLimiter);

// P0-2: Need raw body for HMAC signature verification
app.use(express.json({
    verify: (req: any, _res, buf) => {
        req.rawBody = buf;
    }
}));

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
app.use('/api/v1/user-profile', userProfileCatalogRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/admin', adminRoutes);
// Gym Center Module
app.use('/api/v1/gyms', gymRoutes);
app.use('/api/v1/gym-owner', gymOwnerRoutes);
app.use('/api/v1/admin/gyms', gymAdminRoutes);
// Sprint 3: Notification system
app.use('/api/v1/notifications', notificationRoutes);
// Community Gallery
app.use('/api/v1/gallery', communityGalleryRoutes);
// Coach Applications (Athlete → Coach upgrade)
app.use('/api/v1/coach-applications', coachApplicationRoutes);
// Platform Subscription & Billing
app.use('/api/v1/platform', platformSubscriptionRoutes);
// Public share landing + dynamic OG image endpoints (for crawlers)
app.use('/share', shareRoutes);
// Product Marketplace
app.use('/api/v1/marketplace', marketplaceRoutes);
// News / Tin Tức
app.use('/api/v1/news', newsRoutes);
app.use('/api/v1/integrations/google-form', googleFormIngestRoutes);

// Health check (Public standard mode - P0-4 Security Fix)
app.get('/api/v1/health/live', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        env: env.NODE_ENV,
        process: 'up',
    });
});

app.get('/api/v1/health/ready', async (_req, res, next) => {
    try {
        const snapshot = await systemHealthService.getSnapshot();
        res.status(snapshot.status === 'ERROR' ? 503 : 200).json(snapshot);
    } catch (error) {
        next(error);
    }
});

app.get('/api/v1/health/deps', async (_req, res, next) => {
    try {
        const snapshot = await systemHealthService.getSnapshot();
        res.status(snapshot.status === 'ERROR' ? 503 : 200).json(snapshot);
    } catch (error) {
        next(error);
    }
});

app.get('/api/v1/health', async (_req, res, next) => {
    try {
        const snapshot = await systemHealthService.getSnapshot();
        res.status(snapshot.status === 'ERROR' ? 503 : 200).json(snapshot);
    } catch (error) {
        next(error);
    }
});

// Root health checks (for Render/platform checks)
app.get('/', (_req, res) => res.status(200).send('API is running'));
app.head('/', (_req, res) => res.status(200).end());

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
