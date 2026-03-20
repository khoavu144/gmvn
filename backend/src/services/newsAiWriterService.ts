/**
 * NewsAiWriterService
 * Uses Google Gemini to rewrite scraped English fitness articles into
 * unique, SEO-optimised Vietnamese content.
 *
 * Requires: GEMINI_API_KEY in .env
 *           npm install @google/generative-ai  (run in backend/)
 */
import { logger } from '../utils/logger';

interface RewriteInput {
    originalTitle: string;
    originalHtml: string;
    sourceUrl: string;
    category?: string;
}

interface RewriteResult {
    title: string;
    slug: string;
    excerpt: string;
    contentHtml: string;
    seoTitle: string;
    seoDescription: string;
    ogImageAlt: string;
    tags: string[];
}

const SYSTEM_PROMPT = `Bạn là chuyên gia thể hình và biên tập viên nội dung SEO người Việt. 
Nhiệm vụ của bạn là đọc bài viết tiếng Anh được cung cấp và tạo ra một bài viết tiếng Việt hoàn toàn mới.

Quy tắc bắt buộc:
1. Viết lại 100% nội dung gốc, không dịch nguyên văn
2. Hành văn tự nhiên, đúng khẩu ngữ thể hình Việt Nam (ví dụ: tạ đơn, siết chân, căng cơ bắp, xả cơ...)
3. Cấu trúc bài: Tiêu đề hấp dẫn → Intro ngắn gọn → các H2/H3 rõ ràng → Kết luận thực tiễn
4. Độ dài tối thiểu: 1200 từ
5. Giữ nguyên các thuật ngữ kỹ thuật quốc tế: Squat, Deadlift, HIIT, Whey protein, Reps, Sets...
6. Tạo 3-5 thẻ tag phù hợp (tiếng Việt, ví dụ: tập ngực, dinh dưỡng, deadlift)
7. Kết quả phải là JSON hợp lệ theo format sau, không có text ngoài JSON`;

const JSON_SCHEMA = `{
    "title": "Tiêu đề bài (60-70 ký tự, hot, có từ khóa)",
    "slug": "tieu-de-dang-slug-url-friendly",
    "excerpt": "Mô tả ngắn bài viết 140-160 ký tự, nghe có vần điệu, có từ khóa SEO",
    "content_html": "Nội dung HTML đầy đủ với <h2>, <h3>, <p>, <ul>, <strong>. Không chứa <html>, <body>, <head>.",
    "seo_title": "Tiêu đề SEO 55-65 ký tự",
    "seo_description": "Meta description 145-160 ký tự, nghe cuốn hút, có từ khóa chính",
    "og_image_alt": "Mô tả ảnh cho screen reader, 80-120 ký tự, có từ khóa",
    "tags": ["tag1", "tag2", "tag3"]
}`;

class NewsAiWriterService {

    private getApiKey(): string | null {
        return process.env.GEMINI_API_KEY || null;
    }

    async rewriteArticle(input: RewriteInput): Promise<RewriteResult> {
        const apiKey = this.getApiKey();
        if (!apiKey) {
            logger.warn('[NewsAiWriter] GEMINI_API_KEY not set, using mock result');
            return this.mockResult(input.originalTitle);
        }

        // Dynamic import to allow graceful degradation
        let genAI: any;
        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            genAI = new GoogleGenerativeAI(apiKey);
        } catch {
            logger.warn('[NewsAiWriter] @google/generative-ai not installed. Run: npm install @google/generative-ai');
            return this.mockResult(input.originalTitle);
        }

        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: { responseMimeType: 'application/json', temperature: 0.85 },
        });

        const prompt = [
            SYSTEM_PROMPT,
            '\nKết quả JSON schema:',
            JSON_SCHEMA,
            '\n---\nBài gốc tiếng Anh cần xử lý:',
            `Tiêu đề: ${input.originalTitle}`,
            `Nội dung HTML:\n${input.originalHtml.substring(0, 8000)}`, // truncate for token limit
        ].join('\n');

        try {
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            const parsed = JSON.parse(text) as any;

            return {
                title:          parsed.title          || input.originalTitle,
                slug:           parsed.slug           || this.slugify(input.originalTitle),
                excerpt:        parsed.excerpt        || '',
                contentHtml:    parsed.content_html   || '',
                seoTitle:       parsed.seo_title      || parsed.title || '',
                seoDescription: parsed.seo_description|| parsed.excerpt || '',
                ogImageAlt:     parsed.og_image_alt   || parsed.title || '',
                tags:           Array.isArray(parsed.tags) ? parsed.tags : [],
            };
        } catch (err) {
            logger.error('[NewsAiWriter] Gemini call failed', { err });
            return this.mockResult(input.originalTitle);
        }
    }

    // Fallback mock result when API is unavailable
    private mockResult(originalTitle: string): RewriteResult {
        const slug = this.slugify(originalTitle);
        return {
            title: `${originalTitle} — Kiến Thức Thể Hình`,
            slug,
            excerpt: 'Bài viết thể hình được xử lý tự động bởi hệ thống AI của GYMERVIET.',
            contentHtml: `<p>${originalTitle}</p><p>Nội dung đang được xử lý...</p>`,
            seoTitle: originalTitle.substring(0, 65),
            seoDescription: 'Tin tức thể hình tổng hợp từ GYMERVIET.',
            ogImageAlt: originalTitle.substring(0, 120),
            tags: ['thể hình', 'tập luyện'],
        };
    }

    private slugify(text: string): string {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .substring(0, 200) +
            '-' + Date.now().toString(36);
    }
}

export const newsAiWriterService = new NewsAiWriterService();
