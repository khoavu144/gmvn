/**
 * NewsImageService
 * Downloads images from external sources, renames them with SEO-friendly filenames,
 * and uploads them to Supabase Storage (or S3 if configured).
 *
 * Requires: npm install sharp  (optional — if not installed, skips image optimization)
 */
import axios from 'axios';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/logger';

interface ProcessedImage {
    cdnUrl: string;
    seoFilename: string;
    altText: string;
}

class NewsImageService {

    private getSupabase() {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
        if (!url || !key) return null;
        return createClient(url, key);
    }

    /**
     * Downloads, optionally optimizes, renames (SEO), and uploads an image.
     * Returns null if any step fails — article can continue without that image.
     */
    async processImage(imageUrl: string, articleSlug: string): Promise<ProcessedImage | null> {
        try {
            // 1. Download image
            const response = await axios.get(imageUrl, {
                responseType: 'arraybuffer',
                timeout: 30_000,
                headers: { 'User-Agent': 'GymervietBot/1.0' },
                maxContentLength: 10 * 1024 * 1024, // 10MB cap
            });

            let imageBuffer = Buffer.from(response.data);
            const contentType = response.headers['content-type'] || 'image/jpeg';
            const ext = this.getExtension(contentType, imageUrl);

            // 2. Optimize with sharp if available
            try {
                const sharp = await import('sharp');
                imageBuffer = await sharp.default(imageBuffer)
                    .resize({ width: 1200, withoutEnlargement: true })
                    .webp({ quality: 82 })
                    .toBuffer();
            } catch {
                // sharp not installed — use raw buffer
            }

            // 3. Build SEO-friendly filename
            const timestamp = Date.now().toString(36);
            const slugSuffix = articleSlug.substring(0, 60);
            const finalExt = imageBuffer.slice(0, 4).includes(87) ? 'webp' : ext; // check RIFF/WEBP header
            const seoFilename = `news/${slugSuffix}-${timestamp}.${finalExt}`;

            // 4. Upload to Supabase Storage
            const supabase = this.getSupabase();
            if (!supabase) {
                logger.warn('[NewsImageService] Supabase not configured — skipping image upload');
                return null;
            }

            const { error } = await supabase.storage
                .from('media')
                .upload(seoFilename, imageBuffer, {
                    contentType: finalExt === 'webp' ? 'image/webp' : contentType,
                    upsert: false,
                });

            if (error) {
                logger.warn('[NewsImageService] Upload error', { error: error.message });
                return null;
            }

            const { data: publicData } = supabase.storage.from('media').getPublicUrl(seoFilename);

            return {
                cdnUrl: publicData.publicUrl,
                seoFilename,
                altText: this.generateAltFromSlug(articleSlug),
            };
        } catch (err) {
            logger.warn('[NewsImageService] Failed to process image', { imageUrl, err });
            return null;
        }
    }

    private getExtension(contentType: string, url: string): string {
        if (contentType.includes('webp')) return 'webp';
        if (contentType.includes('png')) return 'png';
        if (contentType.includes('gif')) return 'gif';
        const urlExt = path.extname(url.split('?')[0]).replace('.', '');
        return urlExt || 'jpg';
    }

    private generateAltFromSlug(slug: string): string {
        return slug
            .replace(/-[a-z0-9]{5,}$/, '') // remove timestamp suffix
            .split('-')
            .join(' ')
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .substring(0, 120);
    }
}

export const newsImageService = new NewsImageService();
