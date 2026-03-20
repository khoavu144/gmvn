/**
 * newsCronScheduler.ts
 * Schedules the daily fitness news crawl using node-cron.
 * Called from the main server entry point (server.ts / index.ts).
 *
 * Schedule: Daily at 02:00 AM (Vietnam time — UTC+7, so cron runs at 19:00 UTC)
 */
import cron from 'node-cron';
import { newsCrawlerService } from './newsCrawlerService';
import { logger } from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let scheduledTask: any = null;

/**
 * Start the background cron job.
 * Should be called once after the database connection is established.
 */
export function startNewsCron(): void {
    if (scheduledTask) {
        logger.warn('[NewsCron] Already running, skipping start');
        return;
    }

    // Run daily at 02:00 AM Vietnam time (19:00 UTC)
    scheduledTask = cron.schedule('0 19 * * *', async () => {
        logger.info('[NewsCron] Starting scheduled crawl');
        try {
            const stats = await newsCrawlerService.runFullCrawl();
            logger.info('[NewsCron] Scheduled crawl done', stats);
        } catch (err) {
            logger.error('[NewsCron] Scheduled crawl failed', { err });
        }
    }, {
        timezone: 'UTC',
    });

    logger.info('[NewsCron] Cron job registered — will run daily at 02:00 AM Vietnam time (19:00 UTC)');
}

export function stopNewsCron(): void {
    scheduledTask?.stop();
    scheduledTask = null;
    logger.info('[NewsCron] Cron job stopped');
}
