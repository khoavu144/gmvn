import { getEnv } from '../config/env';
import { emailOutboxService } from './emailOutboxService';
import { opsAlertService } from './opsAlertService';
import { systemHealthService } from './systemHealthService';
import { logger } from '../utils/logger';

class OpsWatchdogService {
    private readonly env = getEnv();
    private readinessFailureCount = 0;
    private readinessInAlert = false;
    private outboxInAlert = false;

    async runCheck() {
        const readinessFailureThreshold = this.env.ALERT_READINESS_CONSECUTIVE_FAILURES ?? 3;
        const outboxThreshold = this.env.ALERT_EMAIL_OUTBOX_PENDING_THRESHOLD ?? 50;

        const [health, outboxSummary] = await Promise.all([
            systemHealthService.getSnapshot(),
            emailOutboxService.getOpsSummary(),
        ]);

        const readinessDegraded = health.status !== 'OK';
        if (readinessDegraded) {
            this.readinessFailureCount += 1;
        } else {
            this.readinessFailureCount = 0;
        }

        if (readinessDegraded && this.readinessFailureCount >= readinessFailureThreshold) {
            this.readinessInAlert = true;
            await opsAlertService.send({
                key: 'readiness-degraded',
                severity: health.status === 'ERROR' ? 'critical' : 'warning',
                title: 'Health readiness degraded',
                message: `Health status is ${health.status} (${this.readinessFailureCount} consecutive checks).`,
                details: {
                    checks: health.checks,
                    threshold: readinessFailureThreshold,
                },
            });
        } else if (!readinessDegraded && this.readinessInAlert) {
            this.readinessInAlert = false;
            await opsAlertService.send({
                key: 'readiness-recovered',
                severity: 'resolved',
                title: 'Health readiness recovered',
                message: 'Health status returned to OK.',
                details: {
                    checks: health.checks,
                },
                force: true,
            });
        }

        const outboxOverThreshold = outboxSummary.pending_ready >= outboxThreshold;
        if (outboxOverThreshold) {
            this.outboxInAlert = true;
            await opsAlertService.send({
                key: 'email-outbox-backlog',
                severity: 'warning',
                title: 'Email outbox backlog',
                message: `Pending ready emails reached ${outboxSummary.pending_ready} records.`,
                details: {
                    threshold: outboxThreshold,
                    outbox: outboxSummary,
                },
            });
        } else if (this.outboxInAlert) {
            this.outboxInAlert = false;
            await opsAlertService.send({
                key: 'email-outbox-recovered',
                severity: 'resolved',
                title: 'Email outbox recovered',
                message: `Pending ready emails back to ${outboxSummary.pending_ready}.`,
                details: {
                    outbox: outboxSummary,
                },
                force: true,
            });
        }

        logger.info('ops_watchdog_check', {
            meta: {
                readiness: health.status,
                readinessFailureCount: this.readinessFailureCount,
                outboxPendingReady: outboxSummary.pending_ready,
            },
        });
    }
}

export const opsWatchdogService = new OpsWatchdogService();
