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
import { generateSitemap } from './controllers/sitemapController';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { User } from './entities/User';
import { GymCenter } from './entities/GymCenter';
import { AppDataSource } from './config/database';
import { initSocket } from './socket';
import { refreshTokenStore } from './services/refreshTokenStore';
import { requestLogger } from './middleware/requestLogger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Trust reverse proxy (Render, Nginx) — required for express-rate-limit & real IP
app.set('trust proxy', 1);

// SEO: Sitemap (public, before auth middleware, cached 6h)
app.get('/sitemap.xml', generateSitemap);

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.vietqr.io", "https://my.sepay.vn"],
        }
    }
}));
app.use(requestLogger);
const allowedOrigins = [
    'http://localhost:5173',
    'https://gymerviet.com',
    'https://www.gymerviet.com'
];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

// Health check (Public standard mode - P0-4 Security Fix)
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV
    });
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
