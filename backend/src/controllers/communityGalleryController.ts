import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { asAppError, getSingleParam, requireRequestUserId } from '../utils/controllerUtils';
import { communityGalleryService } from '../services/communityGalleryService';

export const getPublicGallery = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(String(req.query.page ?? '1'), 10) || 1;
    const limit = parseInt(String(req.query.limit ?? '24'), 10) || 24;
    const category = String(req.query.category ?? 'all');

    const result = await communityGalleryService.getPublicGallery({ page, limit, category });
    res.json({ success: true, ...result });
});

export const getGalleryStats = asyncHandler(async (_req: Request, res: Response) => {
    const stats = await communityGalleryService.getStats();
    res.json({ success: true, ...stats });
});

export const adminGetGallery = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(String(req.query.page ?? '1'), 10) || 1;
    const limit = parseInt(String(req.query.limit ?? '20'), 10) || 20;
    const result = await communityGalleryService.adminGetAll(page, limit);
    res.json({ success: true, ...result });
});

export const adminCreateGalleryItem = asyncHandler(async (req: Request, res: Response) => {
    try {
        const adminId = requireRequestUserId(req);
        const item = await communityGalleryService.adminCreate(adminId, req.body);
        res.status(201).json({ success: true, item });
    } catch (error) {
        throw asAppError(error, 400, 'Không thể tạo ảnh gallery', 'COMMUNITY_GALLERY_CREATE_ERROR');
    }
});

export const adminUpdateGalleryItem = asyncHandler(async (req: Request, res: Response) => {
    try {
        const id = getSingleParam(req.params.id);
        const item = await communityGalleryService.adminUpdate(id, req.body);
        res.json({ success: true, item });
    } catch (error) {
        throw asAppError(error, 400, 'Không thể cập nhật ảnh gallery', 'COMMUNITY_GALLERY_UPDATE_ERROR');
    }
});

export const adminDeleteGalleryItem = asyncHandler(async (req: Request, res: Response) => {
    try {
        const id = getSingleParam(req.params.id);
        await communityGalleryService.adminDelete(id);
        res.json({ success: true, message: 'Deleted' });
    } catch (error) {
        throw asAppError(error, 400, 'Không thể xóa ảnh gallery', 'COMMUNITY_GALLERY_DELETE_ERROR');
    }
});

export const adminImportFromTrainer = asyncHandler(async (req: Request, res: Response) => {
    try {
        const adminId = requireRequestUserId(req);
        const { trainer_gallery_id, linked_user_id } = req.body;
        const item = await communityGalleryService.adminImportFromTrainer(adminId, trainer_gallery_id, linked_user_id);
        res.status(201).json({ success: true, item });
    } catch (error) {
        throw asAppError(error, 400, 'Không thể import ảnh từ trainer', 'COMMUNITY_GALLERY_IMPORT_ERROR');
    }
});

export const adminBulkImportFromTrainer = asyncHandler(async (req: Request, res: Response) => {
    try {
        const adminId = requireRequestUserId(req);
        const { trainer_id } = req.body;
        const items = await communityGalleryService.adminBulkImportFromTrainer(adminId, trainer_id);
        res.status(201).json({ success: true, imported: items.length, items });
    } catch (error) {
        throw asAppError(error, 400, 'Không thể bulk import ảnh từ trainer', 'COMMUNITY_GALLERY_BULK_IMPORT_ERROR');
    }
});
