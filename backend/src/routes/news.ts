/**
 * News API Routes
 * Public: GET /api/news, GET /api/news/:slug
 * Admin:  GET/PATCH/DELETE /api/admin/news/:id, POST /api/admin/news/crawl
 */
import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import {
    listNews,
    getNewsBySlug,
    adminListNews,
    publishNews,
    archiveNews,
    deleteNews,
    triggerCrawl,
} from '../controllers/newsController';

const router = Router();

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', listNews);
router.get('/:slug', getNewsBySlug);

// ── Admin (require authentication + admin role) ────────────────────────────────
router.get('/admin/list',            authenticate, adminOnly, adminListNews);
router.patch('/admin/:id/publish',   authenticate, adminOnly, publishNews);
router.patch('/admin/:id/archive',   authenticate, adminOnly, archiveNews);
router.delete('/admin/:id',          authenticate, adminOnly, deleteNews);
router.post('/admin/crawl',          authenticate, adminOnly, triggerCrawl);

export default router;
