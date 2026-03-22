/**
 * NewsCrawlerService
 * Scrapes fitness articles from configured foreign sources using Cheerio.
 * Requires: `npm install cheerio` in backend/
 */
import axios from 'axios';
import { AppDataSource } from '../config/database';
import { NewsArticle } from '../entities/NewsArticle';
import { logger } from '../utils/logger';
import { newsAiWriterService } from './newsAiWriterService';
import { newsImageService } from './newsImageService';
import { sanitizeNewsHtml } from '../utils/sanitizeNewsHtml';

// ─── Crawl Source Configuration ──────────────────────────────────────────────

interface CrawlSource {
    name: string;
    domain: string;
    rssUrl: string;
    category: string;
    maxArticles: number; // per crawl cycle
}

const CRAWL_SOURCES: CrawlSource[] = [
    {
        name: 'Bodybuilding.com',
        domain: 'bodybuilding.com',
        rssUrl: 'https://www.bodybuilding.com/rss/articles',
        category: 'strength-training',
        maxArticles: 3,
    },
    {
        name: "Men's Health",
        domain: 'menshealth.com',
        rssUrl: 'https://www.menshealth.com/rss/all.xml/',
        category: 'fitness',
        maxArticles: 3,
    },
    {
        name: 'Healthline Fitness',
        domain: 'healthline.com',
        rssUrl: 'https://www.healthline.com/rss/health-news',
        category: 'health',
        maxArticles: 2,
    },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawArticle {
    title: string;
    url: string;
    body: string;       // Extracted HTML content
    imageUrls: string[]; // URLs of images in article
    sourceCategory: string;
    sourceDomain: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

class NewsCrawlerService {

    /**
     * Main entry point: crawl all configured sources
     */
    async runFullCrawl(): Promise<{ scraped: number; processed: number; errors: number }> {
        const stats = { scraped: 0, processed: 0, errors: 0 };
        logger.info('[NewsCrawler] Starting full crawl cycle');

        for (const source of CRAWL_SOURCES) {
            try {
                const articles = await this.crawlSource(source);
                stats.scraped += articles.length;

                for (const raw of articles) {
                    try {
                        await this.processArticle(raw);
                        stats.processed++;
                    } catch (err) {
                        logger.error('[NewsCrawler] Process error', { url: raw.url, err });
                        stats.errors++;
                    }
                }
            } catch (err) {
                logger.error('[NewsCrawler] Source crawl error', { source: source.name, err });
                stats.errors++;
            }
        }

        logger.info('[NewsCrawler] Crawl cycle complete', stats);
        return stats;
    }

    /**
     * Crawl a single RSS source, returning new (un-seen) articles only
     */
    private async crawlSource(source: CrawlSource): Promise<RawArticle[]> {
        // Dynamic import cheerio to allow graceful degradation if not installed
        let cheerio: typeof import('cheerio');
        try {
            cheerio = await import('cheerio');
        } catch {
            logger.warn('[NewsCrawler] cheerio not installed. Run: npm install cheerio');
            return [];
        }

        const repo = AppDataSource.getRepository(NewsArticle);
        const results: RawArticle[] = [];

        // Parse RSS feed
        const rssResponse = await axios.get(source.rssUrl, {
            timeout: 15_000,
            headers: { 'User-Agent': 'GymervietBot/1.0 (+https://gymerviet.com)' },
        });

        const $ = cheerio.load(rssResponse.data, { xmlMode: true });
        const items = $('item, entry').toArray().slice(0, source.maxArticles * 2); // fetch extra to account for duplicates

        for (const item of items) {
            const $item = $(item);
            const url = $item.find('link').first().text().trim() ||
                        $item.find('link').first().attr('href') || '';

            if (!url) continue;

            // Skip already-processed articles
            const existing = await repo.findOne({ where: { source_url: url } });
            if (existing) continue;

            if (results.length >= source.maxArticles) break;

            try {
                const raw = await this.scrapeArticlePage(url, source, cheerio);
                if (raw) results.push(raw);
            } catch {
                logger.warn('[NewsCrawler] Failed to scrape article', { url });
            }
        }

        logger.info(`[NewsCrawler] ${source.name}: ${results.length} new articles found`);
        return results;
    }

    /**
     * Scrape the actual article page HTML
     */
    private async scrapeArticlePage(
        url: string,
        source: CrawlSource,
        cheerio: typeof import('cheerio')
    ): Promise<RawArticle | null> {
        const response = await axios.get(url, {
            timeout: 20_000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; GymervietBot/1.0)',
                'Accept-Language': 'en-US,en;q=0.9',
            },
        });

        const $ = cheerio.load(response.data);

        // Extract primary article body (common article selectors)
        const bodySelectors = [
            'article .article-body',
            'article[class*="article"]',
            '[class*="article-content"]',
            '[class*="post-content"]',
            'main article',
            '.entry-content',
        ];

        let bodyHtml = '';
        for (const sel of bodySelectors) {
            const found = $(sel).first();
            if (found.length) {
                bodyHtml = found.html() || '';
                break;
            }
        }

        if (!bodyHtml || bodyHtml.length < 200) {
            logger.warn('[NewsCrawler] Body extraction failed or too short', { url });
            return null;
        }

        // Extract image URLs from the article
        const imageUrls: string[] = [];
        $('article img, [class*="article"] img').each((_, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src && src.startsWith('http') && !imageUrls.includes(src)) {
                imageUrls.push(src);
            }
        });

        const titleText = $('h1').first().text().trim() || $('title').text().trim();

        return {
            title: titleText,
            url,
            body: bodyHtml,
            imageUrls: imageUrls.slice(0, 5), // max 5 images per article
            sourceCategory: source.category,
            sourceDomain: source.domain,
        };
    }

    /**
     * Process a raw article: AI rewrite → image upload → save to DB
     */
    private async processArticle(raw: RawArticle): Promise<void> {
        const repo = AppDataSource.getRepository(NewsArticle);

        // 1. AI rewrite + SEO content generation
        const aiResult = await newsAiWriterService.rewriteArticle({
            originalTitle: raw.title,
            originalHtml: raw.body,
            sourceUrl: raw.url,
            category: raw.sourceCategory,
        });

        // 2. Process & upload images
        let thumbnailUrl: string | null = null;
        const imageMap: Record<string, string> = {}; // old URL -> new CDN URL

        for (const imgUrl of raw.imageUrls) {
            const processed = await newsImageService.processImage(imgUrl, aiResult.slug);
            if (processed) {
                imageMap[imgUrl] = processed.cdnUrl;
                if (!thumbnailUrl) thumbnailUrl = processed.cdnUrl; // first image = thumbnail
            }
        }

        // 3. Replace old image URLs in content with new CDN URLs
        let finalContent = aiResult.contentHtml;
        for (const [oldUrl, newUrl] of Object.entries(imageMap)) {
            finalContent = finalContent.split(oldUrl).join(newUrl);
        }

        finalContent = sanitizeNewsHtml(finalContent);

        // 4. Save article to DB with status 'draft' (requires admin publish)
        const article = repo.create({
            title: aiResult.title,
            slug: aiResult.slug,
            excerpt: aiResult.excerpt,
            content: finalContent,
            thumbnail_url: thumbnailUrl,
            seo_title: aiResult.seoTitle,
            seo_description: aiResult.seoDescription,
            og_image_url: thumbnailUrl,
            og_image_alt: aiResult.ogImageAlt,
            category: raw.sourceCategory,
            tags: aiResult.tags,
            source_url: raw.url,
            source_domain: raw.sourceDomain,
            source_language: 'en',
            status: 'draft',
            ai_processed: true,
            read_time_min: Math.ceil(aiResult.contentHtml.split(' ').length / 200),
        });

        await repo.save(article);
        logger.info(`[NewsCrawler] Saved draft article: ${aiResult.slug}`);
    }
}

export const newsCrawlerService = new NewsCrawlerService();
