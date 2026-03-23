type SentryLevel = 'error' | 'warning' | 'info';

type SentryContext = {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
};

const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;

function resolveEndpoint(rawDsn?: string) {
  if (!rawDsn) return null;
  try {
    const url = new URL(rawDsn);
    const projectId = url.pathname.replace(/^\/+/, '');
    if (!projectId) return null;
    return {
      endpoint: `${url.protocol}//${url.host}/api/${projectId}/envelope/`,
      dsn: rawDsn,
    };
  } catch {
    return null;
  }
}

const resolved = resolveEndpoint(dsn);

export const isSentryEnabled = () => Boolean(resolved);

function send(level: SentryLevel, message: string, context: SentryContext = {}) {
  if (!resolved) return;

  const eventId = crypto.randomUUID().replace(/-/g, '');
  const event = {
    event_id: eventId,
    timestamp: Math.floor(Date.now() / 1000),
    level,
    platform: 'javascript',
    message,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE,
    release: import.meta.env.VITE_SENTRY_RELEASE || undefined,
    tags: context.tags ?? {},
    extra: context.extra ?? {},
  };

  const envelope = `${JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString(), dsn: resolved.dsn })}\n${JSON.stringify({ type: 'event' })}\n${JSON.stringify(event)}`;
  const body = new Blob([envelope], { type: 'application/x-sentry-envelope' });
  navigator.sendBeacon?.(resolved.endpoint, body);
}

export function captureException(error: unknown, context: SentryContext = {}) {
  const err = error instanceof Error ? error : new Error(String(error));
  send('error', err.message || 'Unhandled frontend exception', {
    ...context,
    extra: {
      ...(context.extra ?? {}),
      stack: err.stack,
      name: err.name,
    },
  });
}

export function captureMessage(message: string, level: SentryLevel = 'info', context: SentryContext = {}) {
  send(level, message, context);
}

export function initSentryBrowser() {
  if (!resolved) return;
  window.addEventListener('error', (event) => {
    captureException(event.error ?? event.message, {
      tags: { source: 'window.error' },
    });
  });
  window.addEventListener('unhandledrejection', (event) => {
    captureException(event.reason, {
      tags: { source: 'window.unhandledrejection' },
    });
  });
}
