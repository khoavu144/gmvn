import { Request, Response } from 'express';
import { communityGalleryService } from '../services/communityGalleryService';

// ── Public ───────────────────────────────────────────────────────────────────

export const getPublicGallery = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 24;
        const category = (req.query.category as string) || 'all';

        const result = await communityGalleryService.getPublicGallery({ page, limit, category });
        res.json({ success: true, ...result });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const getGalleryStats = async (_req: Request, res: Response) => {
    try {
        const stats = await communityGalleryService.getStats();
        res.json({ success: true, ...stats });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// ── Admin ────────────────────────────────────────────────────────────────────

export const adminGetGallery = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const result = await communityGalleryService.adminGetAll(page, limit);
        res.json({ success: true, ...result });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const adminCreateGalleryItem = async (req: Request, res: Response) => {
    try {
        const adminId = req.user!.user_id;
        const item = await communityGalleryService.adminCreate(adminId, req.body);
        res.status(201).json({ success: true, item });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const adminUpdateGalleryItem = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        const item = await communityGalleryService.adminUpdate(id, req.body);
        res.json({ success: true, item });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const adminDeleteGalleryItem = async (req: Request, res: Response) => {
    try {
        const id = String(req.params.id);
        await communityGalleryService.adminDelete(id);
        res.json({ success: true, message: 'Deleted' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const adminImportFromTrainer = async (req: Request, res: Response) => {
    try {
        const adminId = req.user!.user_id;
        const { trainer_gallery_id, linked_user_id } = req.body;
        const item = await communityGalleryService.adminImportFromTrainer(adminId, trainer_gallery_id, linked_user_id);
        res.status(201).json({ success: true, item });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const adminBulkImportFromTrainer = async (req: Request, res: Response) => {
    try {
        const adminId = req.user!.user_id;
        const { trainer_id } = req.body;
        const items = await communityGalleryService.adminBulkImportFromTrainer(adminId, trainer_id);
        res.status(201).json({ success: true, imported: items.length, items });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
