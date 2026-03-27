import {
    FULL_ACCESS_LIMITS,
    PLAN_CONFIG,
    platformSubscriptionService,
    planSatisfies,
} from '../services/platformSubscriptionService';
import {
    MarketplaceSellerRuleError,
    assertSellerListingMembershipQuota,
    assertSellerStandardProductType,
    assertSellerTrainingPackageRole,
} from '../services/marketplaceService';
import type { User } from '../entities/User';

describe('platform plan rules', () => {
    it('legacy plan comparisons always allow access in free-first mode', () => {
        expect(planSatisfies('free', 'coach_elite')).toBe(true);
        expect(planSatisfies('coach_pro', 'gym_business')).toBe(true);
        expect(planSatisfies('athlete_premium', 'coach_pro')).toBe(true);
    });

    it('plan config returns full-access limits for the free plan', () => {
        expect(PLAN_CONFIG.free.price).toBe(0);
        expect(PLAN_CONFIG.free.limits).toEqual(FULL_ACCESS_LIMITS);
    });

    it('getMyPlan always returns free plan with full access', async () => {
        await expect(platformSubscriptionService.getMyPlan('user-1')).resolves.toEqual({
            plan: 'free',
            expires_at: null,
            limits: FULL_ACCESS_LIMITS,
        });
    });
});

describe('marketplace seller guardrails', () => {
    const baseUser = {
        id: 'u1',
        email: 'u1@example.com',
        full_name: 'U One',
    } as User;

    it('rejects non-physical products for normal user', () => {
        const user = { ...baseUser, user_type: 'user' } as User;
        expect(() =>
            assertSellerStandardProductType(user, {
                title: 'Digital plan',
                category_id: 'cat1',
                product_type: 'digital',
                price: 100000,
            }),
        ).toThrow(MarketplaceSellerRuleError);
    });

    it('allows physical products for normal user', () => {
        const user = { ...baseUser, user_type: 'user' } as User;
        expect(() =>
            assertSellerStandardProductType(user, {
                title: 'Protein',
                category_id: 'cat1',
                product_type: 'physical',
                price: 100000,
            }),
        ).not.toThrow();
    });

    it('allows training package role for trainer', () => {
        const trainer = { ...baseUser, user_type: 'trainer' } as User;
        expect(() => assertSellerTrainingPackageRole(trainer)).not.toThrow();
    });

    it('rejects training package role for gym owner', () => {
        const gymOwner = { ...baseUser, user_type: 'gym_owner' } as User;
        expect(() => assertSellerTrainingPackageRole(gymOwner)).toThrow(
            MarketplaceSellerRuleError,
        );
    });

    it('does not enforce seller membership quota anymore', async () => {
        const seller = {
            ...baseUser,
            user_type: 'athlete',
            marketplace_membership_active: false,
        } as User;

        await expect(assertSellerListingMembershipQuota(seller)).resolves.toBeUndefined();
    });
});
