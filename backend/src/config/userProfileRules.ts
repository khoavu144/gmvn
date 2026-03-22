/**
 * Ma trận bắt buộc tối thiểu theo ngữ cảnh + user_type (server-side).
 * sectionSlug khớp user_profile_sections.slug
 */

export type UserProfileRuleContext = 'post_signup_wizard' | 'profile' | 'feature_marketplace_listing';

export type AppUserType = 'user' | 'athlete' | 'trainer' | 'gym_owner' | 'admin';

export interface SectionRequirement {
    /** Ít nhất bao nhiêu term trong section này */
    min: number;
    /** Tối đa (0 = không giới hạn) */
    max: number;
}

export type RulesMatrix = Partial<
    Record<UserProfileRuleContext, Partial<Record<AppUserType, Record<string, SectionRequirement>>>>
>;

/** Mặc định: profile luôn mềm (min 0) — chỉ onboarding / feature siết */
export const USER_PROFILE_RULES: RulesMatrix = {
    post_signup_wizard: {
        trainer: {
            coach_specialties: { min: 1, max: 12 },
        },
        athlete: {
            health_goals: { min: 0, max: 8 },
        },
        user: {
            health_goals: { min: 0, max: 8 },
        },
    },
    profile: {
        trainer: {
            coach_specialties: { min: 0, max: 20 },
        },
        athlete: {
            health_goals: { min: 0, max: 20 },
        },
        user: {
            health_goals: { min: 0, max: 20 },
        },
        gym_owner: {},
    },
    feature_marketplace_listing: {
        trainer: {
            coach_specialties: { min: 0, max: 20 },
        },
        athlete: {
            health_goals: { min: 0, max: 20 },
        },
        user: {},
        gym_owner: {},
    },
};

export function getRulesFor(
    context: UserProfileRuleContext,
    userType: AppUserType,
): Record<string, SectionRequirement> {
    const ctx = USER_PROFILE_RULES[context];
    if (!ctx) return {};
    const row = ctx[userType];
    return row ? { ...row } : {};
}
