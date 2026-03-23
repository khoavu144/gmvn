import { captureException, isSentryEnabled } from './sentry';
const isProd = import.meta.env.PROD;

export const logger = {
    error: (...args: unknown[]) => {
        if (!isProd) {
            console.error(...args);
        }

        if (isProd && isSentryEnabled()) {
            const [first] = args;
            if (first instanceof Error) {
                captureException(first);
            }
        }
    },
    warn: (...args: unknown[]) => {
        if (!isProd) {
            console.warn(...args);
        }
    },
    log: (...args: unknown[]) => {
        if (!isProd) {
            console.log(...args);
        }
    },
};
