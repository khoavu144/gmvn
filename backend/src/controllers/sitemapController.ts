import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { GymCenter } from '../entities/GymCenter';

const BASE_URL = process.env.FRONTEND_URL || 'https://gymerviet.com';

// Static high-value pages
const STATIC_URLS = [
    { path: '/',         priority: '1.0', changefreq: 'daily'   },
    { path: '/coaches',  priority: '0.9', changefreq: 'daily'   },
    { path: '/gyms',     priority: '0.9', changefreq: 'daily'   },
    { path: '/gallery',  priority: '0.6', changefreq: 'weekly'  },
    { path: '/pricing',  priority: '0.7', changefreq: 'monthly' },
];

function toW3CDate(d: Date): string {
    return d.toISOString().split('T')[0];
}

function xmlUrl(loc: string, lastmod: string, changefreq: string, priority: string): string {
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

// Cache the sitemap for 6 hours
let cachedXml: string | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export const generateSitemap = async (_req: Request, res: Response): Promise<void> => {
    try {
        const now = Date.now();
        if (cachedXml && now < cacheExpiry) {
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('Cache-Control', 'public, max-age=21600');
            res.send(cachedXml);
            return;
        }

        const today = toW3CDate(new Date());
        const urls: string[] = [];

        // Static pages
        for (const page of STATIC_URLS) {
            urls.push(xmlUrl(`${BASE_URL}${page.path}`, today, page.changefreq, page.priority));
        }

        // Dynamic: Trainer / Coach profiles
        const trainers = await AppDataSource
            .getRepository(User)
            .createQueryBuilder('u')
            .select(['u.id', 'u.updated_at', 'u.slug'])
            .where("u.user_type = 'trainer'")
            .getMany();

        for (const t of trainers) {
            urls.push(xmlUrl(
                `${BASE_URL}/coaches/${t.slug || t.id}`,
                toW3CDate(t.updated_at ?? new Date()),
                'weekly',
                '0.8',
            ));
        }

        // Dynamic: Gym Centers
        const gyms = await AppDataSource
            .getRepository(GymCenter)
            .createQueryBuilder('g')
            .select(['g.id', 'g.updated_at', 'g.slug'])
            .getMany();

        for (const g of gyms) {
            urls.push(xmlUrl(
                `${BASE_URL}/gyms/${g.slug || g.id}`,
                toW3CDate(g.updated_at ?? new Date()),
                'weekly',
                '0.8',
            ));
        }

        // Dynamic: Public Athlete profiles
        const athletes = await AppDataSource
            .getRepository(User)
            .createQueryBuilder('u')
            .select(['u.id', 'u.updated_at', 'u.slug'])
            .where("u.user_type = 'athlete'")
            .getMany();

        for (const a of athletes) {
            urls.push(xmlUrl(
                `${BASE_URL}/athlete/${a.slug || a.id}`,
                toW3CDate(a.updated_at ?? new Date()),
                'monthly',
                '0.5',
            ));
        }

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

        cachedXml = xml;
        cacheExpiry = now + CACHE_TTL_MS;

        res.setHeader('Content-Type', 'application/xml; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=21600');
        res.send(xml);
    } catch (err: any) {
        console.error('[sitemap] Error generating sitemap:', err);
        res.status(500).send('<!-- sitemap generation error -->');
    }
};
