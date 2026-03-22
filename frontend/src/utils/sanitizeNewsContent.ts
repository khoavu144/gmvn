import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

/** Match backend `sanitizeNewsHtml` — defense in depth before `dangerouslySetInnerHTML`. */
const CONFIG: Config = {
    ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'a',
        'blockquote',
        'code',
        'pre',
        'span',
        'div',
        'img',
        'figure',
        'figcaption',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'loading', 'decoding', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
};

export function sanitizeNewsArticleHtml(html: string): string {
    if (!html || typeof html !== 'string') return '';
    return DOMPurify.sanitize(html, CONFIG) as string;
}
