import { randomUUID } from 'crypto';
import { getEnv } from '../config/env';
import { logger } from '../utils/logger';

type SentryLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

type SentryContext = {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    requestId?: string;
    userId?: string;
    fingerprint?: string[];
};

type ParsedDsn = {
    endpoint: string;
    dsn: string;
};

function parseDsn(rawDsn: string): ParsedDsn | null {
    try {
        const url = new URL(rawDsn);
        const projectId = url.pathname.replace(/^\/+/, '');
        if (!projectId) {
            return null;
        }

        const hostPath = url.pathname.split('/').slice(0, -1).join('/');
        const endpointBase = `${url.protocol}//${url.host}${hostPath ? `/${hostPath}` : ''}`;
        return {
            endpoint: `${endpointBase}/api/${projectId}/envelope/`,
            dsn: rawDsn,
        };
    } catch {
        return null;
    }
}

class SentryService {
    private readonly env = getEnv();
    private readonly parsed = this.env.SENTRY_DSN ? parseDsn(this.env.SENTRY_DSN) : null;

    isEnabled() {
        return Boolean(this.parsed);
    }

    captureException(error: unknown, context: SentryContext = {}) {
        const err = error instanceof Error ? error : new Error(String(error));
        return this.sendEvent(
            'error',
            err.message || 'Unhandled exception',
            {
                exception: {
                    values: [
                        {
                            type: err.name || 'Error',
                            value: err.message,
                            stacktrace: err.stack
                                ? {
                                    frames: err.stack
                                        .split('\n')
                                        .map((line) => line.trim())
                                        .filter(Boolean)
                                        .map((line) => ({ filename: line })),
                                }
                                : undefined,
                        },
                    ],
                },
            },
            context,
        );
    }

    captureMessage(message: string, level: SentryLevel = 'error', context: SentryContext = {}) {
        return this.sendEvent(level, message, {}, context);
    }

    private async sendEvent(
        level: SentryLevel,
        message: string,
        payload: Record<string, unknown>,
        context: SentryContext,
    ) {
        if (!this.parsed) {
            return;
        }

        const eventId = randomUUID().replace(/-/g, '');
        const nowIso = new Date().toISOString();
        const event = {
            event_id: eventId,
            timestamp: Math.floor(Date.now() / 1000),
            level,
            platform: 'node',
            message,
            environment: this.env.SENTRY_ENVIRONMENT || this.env.NODE_ENV,
            release: this.env.SENTRY_RELEASE || undefined,
            tags: {
                service: 'backend',
                ...context.tags,
            },
            user: context.userId ? { id: context.userId } : undefined,
            extra: {
                requestId: context.requestId,
                ...context.extra,
            },
            fingerprint: context.fingerprint,
            ...payload,
        };

        const envelopeHeaders = JSON.stringify({
            event_id: eventId,
            sent_at: nowIso,
            dsn: this.parsed.dsn,
            sdk: {
                name: 'gymerviet.backend.native-sentry',
                version: '1.0.0',
            },
        });
        const itemHeaders = JSON.stringify({ type: 'event' });
        const body = `${envelopeHeaders}\n${itemHeaders}\n${JSON.stringify(event)}`;

        try {
            const response = await fetch(this.parsed.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-sentry-envelope',
                },
                body,
            });

            if (!response.ok) {
                logger.warn('sentry_delivery_failed', {
                    meta: {
                        status: response.status,
                        statusText: response.statusText,
                    },
                });
            }
        } catch (error) {
            logger.warn('sentry_delivery_error', {
                meta: {
                    message: error instanceof Error ? error.message : String(error),
                },
            });
        }
    }
}

export const sentryService = new SentryService();
