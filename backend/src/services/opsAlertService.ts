import { getEnv } from '../config/env';
import { logger } from '../utils/logger';

export type OpsAlertSeverity = 'info' | 'warning' | 'critical' | 'resolved';

type OpsAlertInput = {
    key: string;
    severity: OpsAlertSeverity;
    title: string;
    message: string;
    details?: Record<string, unknown>;
    force?: boolean;
};

class OpsAlertService {
    private readonly env = getEnv();
    private readonly cooldownSeconds = this.env.ALERT_COOLDOWN_SECONDS ?? 15 * 60;
    private readonly lastSentAt = new Map<string, number>();

    isEnabled() {
        return Boolean(this.env.OPS_ALERT_WEBHOOK_URL);
    }

    async send(input: OpsAlertInput): Promise<boolean> {
        const webhookUrl = this.env.OPS_ALERT_WEBHOOK_URL;
        if (!webhookUrl) {
            return false;
        }

        const now = Date.now();
        const lastSent = this.lastSentAt.get(input.key) ?? 0;
        const underCooldown = now - lastSent < this.cooldownSeconds * 1000;
        if (!input.force && underCooldown) {
            return false;
        }

        const payload = {
            source: 'gymerviet-api',
            environment: this.env.NODE_ENV,
            key: input.key,
            severity: input.severity,
            title: input.title,
            message: input.message,
            details: input.details ?? {},
            timestamp: new Date().toISOString(),
            text: `[${input.severity.toUpperCase()}] ${input.title} - ${input.message}`,
        };

        try {
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                logger.warn('ops_alert_delivery_failed', {
                    meta: {
                        key: input.key,
                        status: response.status,
                        statusText: response.statusText,
                    },
                });
                return false;
            }

            this.lastSentAt.set(input.key, now);
            logger.info('ops_alert_sent', {
                meta: {
                    key: input.key,
                    severity: input.severity,
                },
            });
            return true;
        } catch (error) {
            logger.warn('ops_alert_delivery_error', {
                meta: {
                    key: input.key,
                    message: error instanceof Error ? error.message : String(error),
                },
            });
            return false;
        }
    }
}

export const opsAlertService = new OpsAlertService();
