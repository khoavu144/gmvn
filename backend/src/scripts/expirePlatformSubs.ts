/**
 * expirePlatformSubs.ts
 * Cron-style job: marks platform_subscriptions as 'expired' when expires_at < now.
 * Runs once immediately on server start, then every 24 hours.
 */
import 'reflect-metadata';
import { AppDataSource } from '../config/database';
import { PlatformSubscription } from '../entities/PlatformSubscription';

export async function expireOverduePlatformSubs(): Promise<void> {
    try {
        const repo = AppDataSource.getRepository(PlatformSubscription);
        const result = await repo
            .createQueryBuilder()
            .update()
            .set({ status: 'expired' })
            .where('status = :status AND expires_at < :now', { status: 'active', now: new Date() })
            .execute();

        const count = result.affected ?? 0;
        if (count > 0) {
            console.log(`[platform-cron] Expired ${count} platform subscription(s)`);
        }
    } catch (err) {
        console.error('[platform-cron] Failed to expire subscriptions:', err);
    }
}

const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Call this once after AppDataSource is initialized */
export function startPlatformSubCron(): void {
    // Run immediately on startup
    expireOverduePlatformSubs();
    // Then every 24h
    setInterval(expireOverduePlatformSubs, INTERVAL_MS);
}
