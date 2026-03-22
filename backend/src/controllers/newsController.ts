/**
 * newsController.ts
 * REST API endpoints for the News module:
 *   GET    /api/news                  — List published articles (paginated)
 *   GET    /api/news/:slug            — Get single published article
 *   GET    /api/admin/news            — Admin: list all (including drafts)
 *   PATCH  /api/admin/news/:id/publish— Admin: publish a draft
 *   PATCH  /api/admin/news/:id/archive— Admin: archive an article
 *   DELETE /api/admin/news/:id        — Admin: delete
 *   POST   /api/admin/news/crawl      — Admin: trigger manual crawl
 */
import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { NewsArticle } from '../entities/NewsArticle';
import { newsCrawlerService } from '../services/newsCrawlerService';
import { logger } from '../utils/logger';
import { sanitizeNewsHtml } from '../utils/sanitizeNewsHtml';

// ─── Public Endpoints ────────────────────────────────────────────────────────

export const listNews = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(24, Math.max(1, parseInt(req.query.limit as string) || 12));
        const category = req.query.category as string | undefined;

        const repo = AppDataSource.getRepository(NewsArticle);
        const qb = repo.createQueryBuilder('a')
            .select(['a.id', 'a.title', 'a.slug', 'a.excerpt', 'a.thumbnail_url',
                     'a.category', 'a.tags', 'a.view_count', 'a.read_time_min',
                     'a.published_at', 'a.created_at'])
            .where('a.status = :status', { status: 'published' })
            .orderBy('a.published_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (category) qb.andWhere('a.category = :category', { category });

        const [articles, total] = await qb.getManyAndCount();

        res.json({
            success: true,
            data: articles,
            meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        });
    } catch (err) {
        logger.error('[newsController.listNews]', err);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

export const getNewsBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
        const { slug } = req.params;
        const repo = AppDataSource.getRepository(NewsArticle);

        const article = await repo.findOne({
            where: { slug: String(slug), status: 'published' },
        });

        if (!article) {
            res.status(404).json({ success: false, message: 'Bài viết không tồn tại' });
            return;
        }

        // Increment view count (fire-and-forget)
        repo.increment({ id: article.id }, 'view_count', 1).catch(() => {});

        res.json({
            success: true,
            data: { ...article, content: sanitizeNewsHtml(article.content) },
        });
    } catch (err) {
        logger.error('[newsController.getNewsBySlug]', err);
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

// ─── Admin Endpoints ─────────────────────────────────────────────────────────

export const adminListNews = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.min(50, parseInt(req.query.limit as string) || 20);
        const status = req.query.status as string | undefined;

        const repo = AppDataSource.getRepository(NewsArticle);
        const qb = repo.createQueryBuilder('a')
            .select(['a.id', 'a.title', 'a.slug', 'a.category', 'a.status',
                     'a.ai_processed', 'a.source_domain', 'a.view_count',
                     'a.published_at', 'a.created_at'])
            .orderBy('a.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (status) qb.where('a.status = :status', { status });

        const [articles, total] = await qb.getManyAndCount();
        res.json({ success: true, data: articles, meta: { page, limit, total } });
    } catch {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

export const publishNews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const repo = AppDataSource.getRepository(NewsArticle);
        const article = await repo.findOne({ where: { id: String(id) } });
        if (!article) { res.status(404).json({ success: false, message: 'Không tìm thấy' }); return; }
        await repo.update(String(id), { status: 'published', published_at: new Date() });
        res.json({ success: true, message: 'Đã đăng bài viết' });
    } catch {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

export const archiveNews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await AppDataSource.getRepository(NewsArticle).update(String(id), { status: 'archived' });
        res.json({ success: true, message: 'Đã lưu trữ bài viết' });
    } catch {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

export const deleteNews = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await AppDataSource.getRepository(NewsArticle).delete(String(id));
        res.json({ success: true, message: 'Đã xóa bài viết' });
    } catch {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};

export const triggerCrawl = async (req: Request, res: Response): Promise<void> => {
    try {
        res.json({ success: true, message: 'Đang bắt đầu crawl...' });
        // Run async after response
        newsCrawlerService.runFullCrawl().then((stats) => {
            logger.info('[newsController.triggerCrawl] Complete', stats);
        }).catch((err) => {
            logger.error('[newsController.triggerCrawl] Error', err);
        });
    } catch {
        res.status(500).json({ success: false, message: 'Lỗi hệ thống' });
    }
};
