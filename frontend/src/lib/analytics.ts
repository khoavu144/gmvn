import { logger } from './logger';

export type FunnelStage = 'acquire' | 'activate' | 'retain' | 'monetize';

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
    interface Window {
        dataLayer?: Array<Record<string, unknown>>;
    }
}

function sanitizePayload(payload: AnalyticsPayload) {
    return Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined)
    );
}

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
    if (typeof window === 'undefined') return;

    const detail = {
        event,
        app: 'gymerviet',
        ...sanitizePayload(payload),
        ts: new Date().toISOString(),
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(detail);
    window.dispatchEvent(new CustomEvent('gv:analytics', { detail }));
    logger.log('[analytics]', detail);
}

export function trackPageView(payload: {
    page_id: string;
    funnel: FunnelStage;
    objective: string;
    path: string;
}) {
    trackEvent('page_view', payload);
}
