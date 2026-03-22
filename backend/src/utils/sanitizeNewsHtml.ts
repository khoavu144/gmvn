import sanitizeHtml from 'sanitize-html';

/** Safe subset for editorial HTML (crawl + AI). Strips scripts, handlers, and dangerous URLs. */
const NEWS_SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: [
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
    allowedAttributes: {
        a: ['href', 'target', 'rel'],
        img: ['src', 'alt', 'loading', 'decoding', 'class', 'width', 'height'],
        '*': ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowProtocolRelative: false,
    transformTags: {
        a: (tagName, attribs) => {
            const next = { ...attribs };
            if (next.target === '_blank' && !next.rel?.includes('noopener')) {
                next.rel = 'noopener noreferrer';
            }
            return { tagName, attribs: next };
        },
    },
};

export function sanitizeNewsHtml(html: string): string {
    if (!html || typeof html !== 'string') return '';
    return sanitizeHtml(html, NEWS_SANITIZE_OPTIONS);
}
