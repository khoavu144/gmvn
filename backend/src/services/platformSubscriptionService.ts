import { AppDataSource } from '../config/database';
import { PlatformSubscription, PlatformPlan } from '../entities/PlatformSubscription';
import { PlatformCheckoutIntent } from '../entities/PlatformCheckoutIntent';
import { PlatformWebhookEvent, PlatformWebhookEventStatus } from '../entities/PlatformWebhookEvent';
import { AppSetting } from '../entities/AppSetting';
import { User } from '../entities/User';
import redisClient from '../config/redis';
import { AppError } from '../utils/AppError';

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
    private get checkoutRepo() { return AppDataSource.getRepository(PlatformCheckoutIntent); }
    private get webhookRepo() { return AppDataSource.getRepository(PlatformWebhookEvent); }
    private get settingsRepo() { return AppDataSource.getRepository(AppSetting); }
    private get userRepo() { return AppDataSource.getRepository(User); }

    /** Check if platform billing is currently enforced */
    async isBillingEnabled(): Promise<boolean> {
        const now = Date.now();
        if (_billingEnabledCache !== null && now - _cacheTs < CACHE_TTL_MS) {
            return _billingEnabledCache;
        }
        const setting = await this.settingsRepo.findOneBy({ key: 'billing_enabled' });
        _billingEnabledCache = setting?.value !== 'false';
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
        checkout_intent_id: string;
        expires_at: Date;
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
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const intent = await this.checkoutRepo.save(this.checkoutRepo.create({
            user_id: userId,
            plan,
            transfer_content: description,
            amount: config.price,
            status: 'pending',
            expires_at: expiresAt,
            metadata: {
                userShort,
            },
        }));

        try {
            await redisClient.set(`checkout:${description}`, JSON.stringify({ userId, plan, intentId: intent.id }), { EX: 86400 });
        } catch (e) {
            console.warn('[checkout] Failed to mirror intent to Redis cache', e);
        }

        return {
            plan,
            price: config.price,
            label: config.label,
            description,
            amount: config.price,
            checkout_intent_id: intent.id,
            expires_at: intent.expires_at,
        };
    }

    async recordWebhookEvent(input: {
        provider?: string;
        providerTransactionId?: string | null;
        transferContent?: string | null;
        signature?: string | null;
        payload: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }) {
        return this.webhookRepo.save(this.webhookRepo.create({
            provider: input.provider ?? 'sepay',
            provider_transaction_id: input.providerTransactionId ?? null,
            transfer_content: input.transferContent ?? null,
            signature: input.signature ?? null,
            payload: input.payload,
            metadata: input.metadata ?? {},
            status: 'received',
            received_at: new Date(),
        }));
    }

    async finalizeWebhookEvent(id: string, status: PlatformWebhookEventStatus, metadata?: Record<string, unknown>, errorMessage?: string | null) {
        const event = await this.webhookRepo.findOneBy({ id });
        if (!event) {
            return;
        }

        event.status = status;
        event.metadata = metadata ?? {};
        event.error_message = errorMessage ?? null;
        event.processed_at = new Date();
        await this.webhookRepo.save(event);
    }

    async activateFromWebhook(content: string, transactionId: string, amount: number) {
        return AppDataSource.transaction(async (manager) => {
            const checkoutRepo = manager.getRepository(PlatformCheckoutIntent);
            const subRepo = manager.getRepository(PlatformSubscription);

            const intent = await checkoutRepo
                .createQueryBuilder('intent')
                .setLock('pessimistic_write')
                .where('intent.transfer_content = :content', { content })
                .getOne();

            if (!intent) {
                return { ignored: true, reason: 'checkout_intent_not_found' as const };
            }

            if (intent.status === 'paid' && intent.provider_transaction_id === transactionId) {
                return {
                    ignored: false,
                    idempotent: true,
                    user_id: intent.user_id,
                    plan: intent.plan,
                };
            }

            if (intent.status === 'paid' && intent.provider_transaction_id && intent.provider_transaction_id !== transactionId) {
                throw new AppError('Checkout intent already claimed by another transaction', 409);
            }

            if (intent.expires_at < new Date()) {
                intent.status = 'expired';
                await checkoutRepo.save(intent);
                return { ignored: true, reason: 'checkout_intent_expired' as const };
            }

            if (Number(intent.amount) !== Number(amount)) {
                intent.status = 'failed';
                intent.metadata = {
                    ...intent.metadata,
                    last_amount_mismatch: {
                        expected: Number(intent.amount),
                        received: Number(amount),
                        at: new Date().toISOString(),
                    },
                };
                await checkoutRepo.save(intent);
                throw new AppError('Webhook amount mismatch', 400);
            }

            if (transactionId) {
                const existingSub = await subRepo.findOneBy({ sepay_transaction_id: transactionId });
                if (existingSub) {
                    intent.status = 'paid';
                    intent.provider_transaction_id = transactionId;
                    intent.paid_at = existingSub.started_at ?? new Date();
                    await checkoutRepo.save(intent);
                    return {
                        ignored: false,
                        idempotent: true,
                        user_id: intent.user_id,
                        plan: intent.plan,
                    };
                }
            }

            await subRepo.update(
                { user_id: intent.user_id, status: 'active' },
                { status: 'cancelled' }
            );

            const now = new Date();
            const expiresAt = new Date(now);
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);

            const sub = subRepo.create({
                user_id: intent.user_id,
                plan: intent.plan,
                status: 'active',
                price_paid: amount,
                started_at: now,
                expires_at: expiresAt,
                sepay_transaction_id: transactionId,
            });

            await subRepo.save(sub);

            intent.status = 'paid';
            intent.provider_transaction_id = transactionId;
            intent.paid_at = now;
            await checkoutRepo.save(intent);

            try {
                await redisClient.del(`checkout:${content}`);
            } catch (error) {
                console.warn('[platform-webhook] Failed to clear checkout cache', error);
            }

            return {
                ignored: false,
                idempotent: false,
                user_id: intent.user_id,
                plan: intent.plan,
            };
        });
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
        await this.checkoutRepo
            .createQueryBuilder()
            .update()
            .set({ status: 'expired' })
            .where('status = :status AND expires_at < :now', { status: 'pending', now: new Date() })
            .execute();

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

    async listCheckoutIntents(
        page: number = 1,
        limit: number = 50,
        filters?: { status?: string; plan?: string; q?: string },
    ) {
        const qb = this.checkoutRepo.createQueryBuilder('intent')
            .leftJoinAndSelect('intent.user', 'user')
            .orderBy('intent.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (filters?.status) {
            qb.andWhere('intent.status = :status', { status: filters.status });
        }

        if (filters?.plan) {
            qb.andWhere('intent.plan = :plan', { plan: filters.plan });
        }

        if (filters?.q) {
            qb.andWhere(
                `(intent.transfer_content ILIKE :q OR intent.provider_transaction_id ILIKE :q OR user.email ILIKE :q OR user.full_name ILIKE :q)`,
                { q: `%${filters.q}%` },
            );
        }

        const [intents, total] = await qb.getManyAndCount();
        return {
            intents: intents.map((intent) => ({
                id: intent.id,
                user_id: intent.user_id,
                plan: intent.plan,
                transfer_content: intent.transfer_content,
                amount: Number(intent.amount),
                status: intent.status,
                provider_transaction_id: intent.provider_transaction_id,
                expires_at: intent.expires_at,
                paid_at: intent.paid_at,
                created_at: intent.created_at,
                metadata: intent.metadata,
                user: intent.user ? {
                    id: intent.user.id,
                    full_name: intent.user.full_name,
                    email: intent.user.email,
                    user_type: intent.user.user_type,
                } : null,
            })),
            total,
            page,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    async listWebhookEvents(
        page: number = 1,
        limit: number = 50,
        filters?: { status?: string; q?: string; from?: Date; to?: Date },
    ) {
        const qb = this.webhookRepo.createQueryBuilder('event')
            .orderBy('event.received_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (filters?.status) {
            qb.andWhere('event.status = :status', { status: filters.status });
        }

        if (filters?.q) {
            qb.andWhere(
                `(event.provider_transaction_id ILIKE :q OR event.transfer_content ILIKE :q OR event.error_message ILIKE :q)`,
                { q: `%${filters.q}%` },
            );
        }

        if (filters?.from) {
            qb.andWhere('event.received_at >= :from', { from: filters.from });
        }

        if (filters?.to) {
            qb.andWhere('event.received_at <= :to', { to: filters.to });
        }

        const [events, total] = await qb.getManyAndCount();
        return {
            events,
            total,
            page,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    async getOpsOverview(windowMinutes: number = 60) {
        const now = new Date();
        const windowStart = new Date(now.getTime() - windowMinutes * 60_000);
        const stalePendingBefore = new Date(now.getTime() - 30 * 60_000);

        const [
            pendingIntents,
            stalePendingIntents,
            paidWithoutSubscription,
            receivedWebhookCount,
            failedWebhookCount,
            processedWebhookCount,
        ] = await Promise.all([
            this.checkoutRepo.count({ where: { status: 'pending' } }),
            this.checkoutRepo
                .createQueryBuilder('intent')
                .where('intent.status = :status', { status: 'pending' })
                .andWhere('intent.created_at <= :stalePendingBefore', { stalePendingBefore })
                .getCount(),
            this.checkoutRepo
                .createQueryBuilder('intent')
                .leftJoin(PlatformSubscription, 'sub', 'sub.sepay_transaction_id = intent.provider_transaction_id')
                .where('intent.status = :status', { status: 'paid' })
                .andWhere('intent.provider_transaction_id IS NOT NULL')
                .andWhere('sub.id IS NULL')
                .getCount(),
            this.webhookRepo
                .createQueryBuilder('event')
                .where('event.received_at >= :windowStart', { windowStart })
                .getCount(),
            this.webhookRepo
                .createQueryBuilder('event')
                .where('event.received_at >= :windowStart', { windowStart })
                .andWhere('event.status = :status', { status: 'failed' })
                .getCount(),
            this.webhookRepo
                .createQueryBuilder('event')
                .where('event.received_at >= :windowStart', { windowStart })
                .andWhere('event.status = :status', { status: 'processed' })
                .getCount(),
        ]);

        return {
            window_minutes: windowMinutes,
            checkout: {
                pending: pendingIntents,
                stale_pending: stalePendingIntents,
                paid_without_subscription: paidWithoutSubscription,
            },
            webhooks: {
                received_last_window: receivedWebhookCount,
                failed_last_window: failedWebhookCount,
                processed_last_window: processedWebhookCount,
            },
        };
    }

    async reconcileCheckoutIntents() {
        const expired = await this.checkoutRepo
            .createQueryBuilder()
            .update()
            .set({ status: 'expired' })
            .where('status = :status AND expires_at < :now', { status: 'pending', now: new Date() })
            .execute();

        const paidWithoutSubscription = await this.checkoutRepo
            .createQueryBuilder('intent')
            .leftJoin(PlatformSubscription, 'sub', 'sub.sepay_transaction_id = intent.provider_transaction_id')
            .where('intent.status = :status', { status: 'paid' })
            .andWhere('intent.provider_transaction_id IS NOT NULL')
            .andWhere('sub.id IS NULL')
            .getCount();

        const pending = await this.checkoutRepo.count({
            where: { status: 'pending' },
        });

        return {
            expiredPendingIntents: expired.affected ?? 0,
            pendingIntents: pending,
            paidWithoutSubscription,
        };
    }
}

export const platformSubscriptionService = new PlatformSubscriptionService();

/** Helper: does userPlan satisfy a required minimum plan? */
export function planSatisfies(userPlan: PlatformPlan, required: PlatformPlan): boolean {
    // For coach plans: free < pro < elite
    // athlete_premium and gym_business are standalone (only satisfy themselves)
    if (required === 'coach_pro') return userPlan === 'coach_pro' || userPlan === 'coach_elite';
    if (required === 'coach_elite') return userPlan === 'coach_elite';
    if (required === 'athlete_premium') return userPlan === 'athlete_premium';
    if (required === 'gym_business') return userPlan === 'gym_business';
    return true; // 'free' — always satisfied
}
