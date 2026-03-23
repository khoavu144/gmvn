const DEFAULT_SITE_ORIGIN = 'https://gymerviet.com';

function normalizeOrigin(origin?: string): string {
    if (!origin) return DEFAULT_SITE_ORIGIN;
    return origin.trim().replace(/\/+$/, '') || DEFAULT_SITE_ORIGIN;
}

export const SITE_ORIGIN = normalizeOrigin(import.meta.env.VITE_CANONICAL_BASE_URL);
export const SITE_OG_IMAGE = `${SITE_ORIGIN}/og-default.jpg`;
export const SITE_LOGO_URL = `${SITE_ORIGIN}/logo.png`;
export const SITE_TWITTER_HANDLE = '@gymerviet';

export function absoluteUrl(path = ''): string {
    if (!path) return SITE_ORIGIN;
    if (/^https?:\/\//i.test(path)) return path;
    return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;
}
