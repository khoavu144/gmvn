import type { PlatformPlan } from '../entities/PlatformSubscription';
import type { PlatformWebhookEventStatus } from '../entities/PlatformWebhookEvent';
import { AppError } from '../utils/AppError';

export type { PlatformPlan };

export interface PlanLimits {
    maxPrograms: number;
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

const FULL_ACCESS_MAX = 999_999;

export const FULL_ACCESS_LIMITS: PlanLimits = Object.freeze({
    maxPrograms: FULL_ACCESS_MAX,
    maxClients: FULL_ACCESS_MAX,
    maxBranches: FULL_ACCESS_MAX,
    maxGymTrainers: FULL_ACCESS_MAX,
    prioritySearch: true,
    badge: true,
    customShareCard: true,
    unlimitedProgressPhotos: true,
    fullSubscriptionHistory: true,
    coachComparison: true,
});

const LEGACY_LABELS: Record<PlatformPlan, string> = {
    free: 'Miễn phí',
    coach_pro: 'Coach Pro',
    coach_elite: 'Coach Elite',
    athlete_premium: 'Athlete Premium',
    gym_business: 'Gym Business',
};

export const PLAN_CONFIG: Record<PlatformPlan, { price: number; label: string; limits: PlanLimits }> = {
    free: { price: 0, label: LEGACY_LABELS.free, limits: FULL_ACCESS_LIMITS },
    coach_pro: { price: 0, label: LEGACY_LABELS.coach_pro, limits: FULL_ACCESS_LIMITS },
    coach_elite: { price: 0, label: LEGACY_LABELS.coach_elite, limits: FULL_ACCESS_LIMITS },
    athlete_premium: { price: 0, label: LEGACY_LABELS.athlete_premium, limits: FULL_ACCESS_LIMITS },
    gym_business: { price: 0, label: LEGACY_LABELS.gym_business, limits: FULL_ACCESS_LIMITS },
};

const emptyPageMeta = (page: number, limit: number) => ({
    total: 0,
    page,
    limit,
    totalPages: 1,
    deprecated: true,
    billing_enabled: false,
});

class PlatformSubscriptionService {
    async isBillingEnabled(): Promise<boolean> {
        return false;
    }

    async setBillingEnabled(_enabled: boolean): Promise<void> {
        return;
    }

    async getMyPlan(_userId: string): Promise<{ plan: PlatformPlan; expires_at: Date | null; limits: PlanLimits }> {
        return {
            plan: 'free',
            expires_at: null,
            limits: FULL_ACCESS_LIMITS,
        };
    }

    async createCheckout(_userId: string, _plan: PlatformPlan): Promise<never> {
        throw new AppError(
            'Thu phí nền tảng đã bị vô hiệu hóa vĩnh viễn.',
            400,
            'BILLING_DISABLED',
        );
    }

    async recordWebhookEvent(input: {
        provider?: string;
        providerTransactionId?: string | null;
        transferContent?: string | null;
        signature?: string | null;
        payload: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }) {
        return {
            id: `platform-billing-disabled-${Date.now()}`,
            provider: input.provider ?? 'sepay',
            provider_transaction_id: input.providerTransactionId ?? null,
            transfer_content: input.transferContent ?? null,
            signature: input.signature ?? null,
            payload: input.payload,
            metadata: input.metadata ?? {},
            status: 'ignored' as PlatformWebhookEventStatus,
            received_at: new Date(),
            processed_at: new Date(),
        };
    }

    async finalizeWebhookEvent(
        _id: string,
        _status: PlatformWebhookEventStatus,
        _metadata?: Record<string, unknown>,
        _errorMessage?: string | null,
    ): Promise<void> {
        return;
    }

    async activateFromWebhook(_content: string, _transactionId: string, _amount: number) {
        return {
            ignored: true,
            reason: 'platform_billing_disabled' as const,
        };
    }

    async cancelPlan(_userId: string): Promise<void> {
        return;
    }

    async expireOverdue(): Promise<number> {
        return 0;
    }

    async getEffectiveLimits(_userId: string): Promise<PlanLimits> {
        return FULL_ACCESS_LIMITS;
    }

    async listAll(page: number = 1, limit: number = 50) {
        return {
            subscriptions: [],
            ...emptyPageMeta(page, limit),
        };
    }

    async listCheckoutIntents(
        page: number = 1,
        limit: number = 50,
        _filters?: { status?: string; plan?: string; q?: string },
    ) {
        return {
            intents: [],
            ...emptyPageMeta(page, limit),
        };
    }

    async listWebhookEvents(
        page: number = 1,
        limit: number = 50,
        _filters?: { status?: string; q?: string; from?: Date; to?: Date },
    ) {
        return {
            events: [],
            ...emptyPageMeta(page, limit),
        };
    }

    async getOpsOverview(windowMinutes: number = 60) {
        return {
            disabled: true,
            window_minutes: windowMinutes,
            checkout: {
                pending: 0,
                stale_pending: 0,
                paid_without_subscription: 0,
            },
            webhooks: {
                received_last_window: 0,
                failed_last_window: 0,
                processed_last_window: 0,
            },
        };
    }

    async reconcileCheckoutIntents() {
        return {
            disabled: true,
            expiredPendingIntents: 0,
            pendingIntents: 0,
            paidWithoutSubscription: 0,
        };
    }
}

export const platformSubscriptionService = new PlatformSubscriptionService();

export function planSatisfies(_userPlan: PlatformPlan, _required: PlatformPlan): boolean {
    return true;
}
