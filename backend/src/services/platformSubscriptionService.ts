import { AppDataSource } from '../config/database';
import { PlatformSubscription, PlatformPlan } from '../entities/PlatformSubscription';
import { AppSetting } from '../entities/AppSetting';
import { User } from '../entities/User';
import redisClient from '../config/redis';

export type { PlatformPlan };

// ─── Plan config ──────────────────────────────────────────────────────────────
export interface PlanLimits {
    maxPrograms: number;       // Infinity = unlimited
    maxClients: number;
    maxBranches: number;
    maxGymTrainers: number;
    prioritySearch: boolean;
    badge: boolean;
    customShareCard: boolean;
    unlimitedProgressPhotos: boolean;
    fullSubscriptionHistory: boolean;
    coachComparison: boolean;
}

export const PLAN_CONFIG: Record<PlatformPlan, { price: number; label: string; limits: PlanLimits }> = {
    free: {
        price: 0,
        label: 'Miễn phí',
        limits: {
            maxPrograms: 3, maxClients: 10, maxBranches: 1, maxGymTrainers: 5,
            prioritySearch: false, badge: false, customShareCard: false,
            unlimitedProgressPhotos: false, fullSubscriptionHistory: false, coachComparison: false,
        },
    },
    coach_pro: {
        price: 499999,
        label: 'Coach Pro',
        limits: {
            maxPrograms: Infinity, maxClients: 50, maxBranches: 1, maxGymTrainers: 5,
            prioritySearch: true, badge: true, customShareCard: true,
            unlimitedProgressPhotos: false, fullSubscriptionHistory: false, coachComparison: false,
        },
    },
    coach_elite: {
        price: 999999,
        label: 'Coach Elite',
        limits: {
            maxPrograms: Infinity, maxClients: Infinity, maxBranches: 1, maxGymTrainers: 5,
            prioritySearch: true, badge: true, customShareCard: true,
            unlimitedProgressPhotos: false, fullSubscriptionHistory: false, coachComparison: false,
        },
    },
    athlete_premium: {
        price: 999999,
        label: 'Athlete Premium',
        limits: {
            maxPrograms: Infinity, maxClients: Infinity, maxBranches: Infinity, maxGymTrainers: Infinity,
            prioritySearch: false, badge: false, customShareCard: false,
            unlimitedProgressPhotos: true, fullSubscriptionHistory: true, coachComparison: true,
        },
    },
    gym_business: {
        price: 999999,
        label: 'Gym Business',
        limits: {
            maxPrograms: Infinity, maxClients: Infinity, maxBranches: Infinity, maxGymTrainers: Infinity,
            prioritySearch: true, badge: false, customShareCard: false,
            unlimitedProgressPhotos: false, fullSubscriptionHistory: false, coachComparison: false,
        },
    },
};

// ─── Billing enabled cache ────────────────────────────────────────────────────
let _billingEnabledCache: boolean | null = null;
let _cacheTs = 0;
const CACHE_TTL_MS = 60_000; // 1 minute

// ─── Service ──────────────────────────────────────────────────────────────────
class PlatformSubscriptionService {
    private get repo() { return AppDataSource.getRepository(PlatformSubscription); }
    private get settingsRepo() { return AppDataSource.getRepository(AppSetting); }
    private get userRepo() { return AppDataSource.getRepository(User); }

    /** Check if platform billing is currently enforced */
    async isBillingEnabled(): Promise<boolean> {
        const now = Date.now();
        if (_billingEnabledCache !== null && now - _cacheTs < CACHE_TTL_MS) {
            return _billingEnabledCache;
        }
        const setting = await this.settingsRepo.findOneBy({ key: 'billing_enabled' });
        _billingEnabledCache = setting?.value === 'true';
        _cacheTs = now;
        return _billingEnabledCache;
    }

    /** Admin: toggle billing enforcement */
    async setBillingEnabled(enabled: boolean): Promise<void> {
        await this.settingsRepo.save({ key: 'billing_enabled', value: enabled ? 'true' : 'false' });
        _billingEnabledCache = enabled; // invalidate cache immediately
        _cacheTs = Date.now();
    }

    /**
     * Get active plan for a user.
     * Returns 'free' if no active paid subscription exists.
     */
    async getMyPlan(userId: string): Promise<{ plan: PlatformPlan; expires_at: Date | null; limits: PlanLimits }> {
        const active = await this.repo.findOne({
            where: { user_id: userId, status: 'active' },
            order: { created_at: 'DESC' },
        });

        if (!active || active.expires_at < new Date()) {
            // Expired — update if needed
            if (active && active.expires_at < new Date()) {
                await this.repo.update(active.id, { status: 'expired' });
            }
            return { plan: 'free', expires_at: null, limits: PLAN_CONFIG.free.limits };
        }

        return {
            plan: active.plan,
            expires_at: active.expires_at,
            limits: PLAN_CONFIG[active.plan].limits,
        };
    }

    /**
     * Create a checkout intent — returns payment info for frontend to show SePay QR.
     * Does NOT create the subscription yet (webhook does that).
     */
    async createCheckout(userId: string, plan: PlatformPlan): Promise<{
        plan: PlatformPlan;
        price: number;
        label: string;
        description: string;
        amount: number;
    }> {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) throw new Error('User not found');

        const config = PLAN_CONFIG[plan];
        if (!config || plan === 'free') throw new Error('Gói không hợp lệ');

        // Check if already on this plan
        const current = await this.getMyPlan(userId);
        if (current.plan === plan) throw new Error('Bạn đã đăng ký gói này rồi');

        // SePay description format: GYMERVIET-PLAN-{plan}-{userId_short}
        const userShort = userId.replace(/-/g, '').substring(0, 8).toUpperCase();
        // Use a unique random suffix to completely prevent collisions in webhook matching
        const uniqueId = Math.random().toString(36).substring(2, 6).toUpperCase();
        const description = `GYMERVIET-PLAN-${plan.toUpperCase()}-${userShort}-${uniqueId}`;

        // Store checkout intent in Redis for 24 hours (86400s)
        try {
            await redisClient.set(`checkout:${description}`, JSON.stringify({ userId, plan }), { EX: 86400 });
        } catch (e) {
            console.warn('[checkout] Failed to write to Redis, falling back to substring match', e);
        }

        return {
            plan,
            price: config.price,
            label: config.label,
            description,
            amount: config.price,
        };
    }

    /**
     * Called by SePay webhook when a platform payment is confirmed.
     * Activates or upgrades the user's platform subscription.
     */
    async activateFromWebhook(userId: string, plan: PlatformPlan, transactionId: string, amount: number): Promise<void> {
        // Cancel any existing active sub
        await this.repo.update(
            { user_id: userId, status: 'active' },
            { status: 'cancelled' }
        );

        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1); // 1 year from now

        const sub = this.repo.create({
            user_id: userId,
            plan,
            status: 'active',
            price_paid: amount,
            started_at: now,
            expires_at: expiresAt,
            sepay_transaction_id: transactionId,
        });

        await this.repo.save(sub);
    }

    /** Cancel active platform subscription (returns to free immediately) */
    async cancelPlan(userId: string): Promise<void> {
        await this.repo.update(
            { user_id: userId, status: 'active' },
            { status: 'cancelled' }
        );
    }

    /**
     * Cron: expire all subscriptions past their expires_at date.
     * Called once on server startup and then every 24h.
     */
    async expireOverdue(): Promise<number> {
        const result = await this.repo
            .createQueryBuilder()
            .update()
            .set({ status: 'expired' })
            .where('status = :status AND expires_at < :now', { status: 'active', now: new Date() })
            .execute();
        return result.affected ?? 0;
    }

    /** Get platform plan limits for a given user (respects billing toggle) */
    async getEffectiveLimits(userId: string): Promise<PlanLimits> {
        const billingEnabled = await this.isBillingEnabled();
        if (!billingEnabled) return PLAN_CONFIG.coach_elite.limits; // No limits when billing is off

        const { limits } = await this.getMyPlan(userId);
        return limits;
    }

    /** Admin: list all paid subscriptions (for admin panel) */
    async listAll(page: number = 1, limit: number = 50) {
        const [subs, total] = await this.repo.findAndCount({
            where: { status: 'active' },
            relations: ['user'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            subscriptions: subs.map(s => ({
                id: s.id,
                plan: s.plan,
                price_paid: s.price_paid,
                started_at: s.started_at,
                expires_at: s.expires_at,
                user: { id: s.user.id, full_name: s.user.full_name, email: s.user.email, user_type: s.user.user_type },
            })),
            total,
        };
    }
}

export const platformSubscriptionService = new PlatformSubscriptionService();

/** Helper: does userPlan satisfy a required minimum plan? */
export function planSatisfies(userPlan: PlatformPlan, required: PlatformPlan): boolean {
    const hierarchy: PlatformPlan[] = ['free', 'coach_pro', 'coach_elite', 'athlete_premium', 'gym_business'];
    // For coach plans: free < pro < elite
    // athlete_premium and gym_business are standalone (only satisfy themselves)
    if (required === 'coach_pro') return userPlan === 'coach_pro' || userPlan === 'coach_elite';
    if (required === 'coach_elite') return userPlan === 'coach_elite';
    if (required === 'athlete_premium') return userPlan === 'athlete_premium';
    if (required === 'gym_business') return userPlan === 'gym_business';
    return true; // 'free' — always satisfied
}
