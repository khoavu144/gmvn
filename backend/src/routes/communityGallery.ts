import { Router } from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import {
    getPublicGallery,
    getGalleryStats,
    adminGetGallery,
    adminCreateGalleryItem,
    adminUpdateGalleryItem,
    adminDeleteGalleryItem,
    adminImportFromTrainer,
    adminBulkImportFromTrainer,
} from '../controllers/communityGalleryController';

const router = Router();

// ── Public routes ────────────────────────────────────────────────────────────
router.get('/', getPublicGallery);
router.get('/stats', getGalleryStats);

// ── Admin routes ─────────────────────────────────────────────────────────────
router.get('/admin', authenticate, adminOnly, adminGetGallery);
router.post('/admin', authenticate, adminOnly, adminCreateGalleryItem);
router.put('/admin/:id', authenticate, adminOnly, adminUpdateGalleryItem);
router.delete('/admin/:id', authenticate, adminOnly, adminDeleteGalleryItem);
router.post('/admin/import', authenticate, adminOnly, adminImportFromTrainer);
router.post('/admin/bulk-import', authenticate, adminOnly, adminBulkImportFromTrainer);

export default router;
