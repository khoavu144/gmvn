/**
 * newsController.ts
 * REST API endpoints for the News module.
 */
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { NewsArticle } from '../entities/NewsArticle';
import { newsCrawlerService } from '../services/newsCrawlerService';
import { logger } from '../utils/logger';
import { sanitizeNewsHtml } from '../utils/sanitizeNewsHtml';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { getSingleParam } from '../utils/controllerUtils';

export const listNews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(24, Math.max(1, parseInt(String(req.query.limit ?? '12'), 10) || 12));
    const category = req.query.category as string | undefined;

    const repo = AppDataSource.getRepository(NewsArticle);
    const qb = repo.createQueryBuilder('a')
        .select([
            'a.id',
            'a.title',
            'a.slug',
            'a.excerpt',
            'a.thumbnail_url',
            'a.category',
            'a.tags',
            'a.view_count',
            'a.read_time_min',
            'a.published_at',
            'a.created_at',
        ])
        .where('a.status = :status', { status: 'published' })
        .orderBy('a.published_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

    if (category) {
        qb.andWhere('a.category = :category', { category });
    }

    const [articles, total] = await qb.getManyAndCount();

    res.json({
        success: true,
        data: articles,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        },
    });
});

export const getNewsBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const slug = getSingleParam(req.params.slug);
    const repo = AppDataSource.getRepository(NewsArticle);

    const article = await repo.findOne({
        where: { slug, status: 'published' },
    });

    if (!article) {
        throw new AppError('Bài viết không tồn tại', 404, 'NEWS_NOT_FOUND');
    }

    void repo.increment({ id: article.id }, 'view_count', 1).catch(() => undefined);

    res.json({
        success: true,
        data: { ...article, content: sanitizeNewsHtml(article.content) },
    });
});

export const adminListNews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20));
    const status = req.query.status as string | undefined;

    const repo = AppDataSource.getRepository(NewsArticle);
    const qb = repo.createQueryBuilder('a')
        .select([
            'a.id',
            'a.title',
            'a.slug',
            'a.category',
            'a.status',
            'a.ai_processed',
            'a.source_domain',
            'a.view_count',
            'a.published_at',
            'a.created_at',
        ])
        .orderBy('a.created_at', 'DESC')
        .skip((page - 1) * limit)
        .take(limit);

    if (status) {
        qb.where('a.status = :status', { status });
    }

    const [articles, total] = await qb.getManyAndCount();
    res.json({ success: true, data: articles, meta: { page, limit, total } });
});

export const publishNews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = getSingleParam(req.params.id);
    const repo = AppDataSource.getRepository(NewsArticle);
    const article = await repo.findOne({ where: { id } });

    if (!article) {
        throw new AppError('Không tìm thấy', 404, 'NEWS_NOT_FOUND');
    }

    await repo.update(id, { status: 'published', published_at: new Date() });
    res.json({ success: true, message: 'Đã đăng bài viết' });
});

export const archiveNews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = getSingleParam(req.params.id);
    await AppDataSource.getRepository(NewsArticle).update(id, { status: 'archived' });
    res.json({ success: true, message: 'Đã lưu trữ bài viết' });
});

export const deleteNews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const id = getSingleParam(req.params.id);
    await AppDataSource.getRepository(NewsArticle).delete(id);
    res.json({ success: true, message: 'Đã xóa bài viết' });
});

export const triggerCrawl = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    res.json({ success: true, message: 'Đang bắt đầu crawl...' });
    void newsCrawlerService.runFullCrawl()
        .then((stats) => {
            logger.info('[newsController.triggerCrawl] Complete', stats);
        })
        .catch((error) => {
            logger.error('[newsController.triggerCrawl] Error', error);
        });
});
