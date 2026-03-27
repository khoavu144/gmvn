import { matchPath, useLocation } from 'react-router-dom';

import type { FunnelStage } from './analytics';

export type AppShellType = 'public' | 'auth' | 'member' | 'detail';

export interface RoutePresentation {
    shellType: AppShellType;
    funnel: FunnelStage;
    analyticsPageId: string;
    businessObjective: string;
    hideHeader: boolean;
    hideFooter: boolean;
    hideBottomNav: boolean;
}

const FLAG_HIDE_HEADER = 1;
const FLAG_HIDE_FOOTER = 2;
const FLAG_HIDE_BOTTOM_NAV = 4;

type RoutePresentationTuple = readonly [
    pattern: string,
    shellType: AppShellType,
    funnel: FunnelStage,
    analyticsPageId: string,
    businessObjective: string,
    flags?: number,
];

const DEFAULT_PRESENTATION: RoutePresentation = {
    shellType: 'public',
    funnel: 'acquire',
    analyticsPageId: 'unknown',
    businessObjective: 'keep_navigation_clear',
    hideHeader: false,
    hideFooter: false,
    hideBottomNav: false,
};

const ROUTE_PRESENTATIONS: RoutePresentationTuple[] = [
    ['/dashboard/marketplace/edit/:productId', 'member', 'monetize', 'seller_edit_product', 'improve_listing_conversion', FLAG_HIDE_FOOTER],
    ['/dashboard/marketplace/new/training', 'member', 'monetize', 'seller_new_training', 'create_training_listing', FLAG_HIDE_FOOTER],
    ['/dashboard/marketplace/new', 'member', 'monetize', 'seller_new_product', 'create_listing', FLAG_HIDE_FOOTER],
    ['/dashboard/marketplace', 'member', 'monetize', 'seller_dashboard', 'manage_seller_inventory', FLAG_HIDE_FOOTER],
    ['/dashboard/subscriptions', 'member', 'retain', 'subscriptions', 'manage_coach_subscriptions', FLAG_HIDE_FOOTER],
    ['/marketplace/product/:slug', 'detail', 'monetize', 'product_detail', 'trust_to_purchase_intent', FLAG_HIDE_BOTTOM_NAV],
    ['/coaches/:trainerId', 'detail', 'acquire', 'coach_detail', 'trust_to_contact', FLAG_HIDE_BOTTOM_NAV],
    ['/coach/:slug', 'detail', 'acquire', 'coach_detail_slug', 'trust_to_contact', FLAG_HIDE_BOTTOM_NAV],
    ['/athlete/:slug', 'detail', 'acquire', 'athlete_detail', 'showcase_athlete_profile', FLAG_HIDE_BOTTOM_NAV],
    ['/gyms/:id', 'detail', 'acquire', 'gym_detail', 'gym_interest_to_contact', FLAG_HIDE_BOTTOM_NAV],
    ['/news/:slug', 'detail', 'acquire', 'news_detail', 'content_to_brand_trust'],
    ['/login', 'auth', 'activate', 'login', 'restore_access', FLAG_HIDE_HEADER | FLAG_HIDE_FOOTER | FLAG_HIDE_BOTTOM_NAV],
    ['/register', 'auth', 'activate', 'register', 'start_signup', FLAG_HIDE_HEADER | FLAG_HIDE_FOOTER | FLAG_HIDE_BOTTOM_NAV],
    ['/onboarding', 'auth', 'activate', 'onboarding', 'activate_account', FLAG_HIDE_HEADER | FLAG_HIDE_FOOTER | FLAG_HIDE_BOTTOM_NAV],
    ['/verify-email', 'auth', 'activate', 'verify_email', 'verify_and_continue', FLAG_HIDE_HEADER | FLAG_HIDE_FOOTER | FLAG_HIDE_BOTTOM_NAV],
    ['/forgot-password', 'auth', 'activate', 'forgot_password', 'recover_access', FLAG_HIDE_HEADER | FLAG_HIDE_FOOTER | FLAG_HIDE_BOTTOM_NAV],
    ['/reset-password', 'auth', 'activate', 'reset_password', 'finish_password_reset', FLAG_HIDE_HEADER | FLAG_HIDE_FOOTER | FLAG_HIDE_BOTTOM_NAV],
    ['/dashboard', 'member', 'retain', 'dashboard', 'continue_member_action', FLAG_HIDE_FOOTER],
    ['/profile', 'member', 'retain', 'profile', 'improve_profile_value', FLAG_HIDE_FOOTER],
    ['/programs', 'member', 'retain', 'programs', 'keep_programs_accessible', FLAG_HIDE_FOOTER],
    ['/messages', 'member', 'retain', 'messages', 'continue_conversation', FLAG_HIDE_FOOTER],
    ['/workouts', 'member', 'retain', 'workouts', 'support_training_habit', FLAG_HIDE_FOOTER],
    ['/', 'public', 'acquire', 'home', 'drive_core_browse'],
    ['/coaches', 'public', 'acquire', 'coaches', 'browse_to_profile'],
    ['/gallery', 'public', 'acquire', 'gallery', 'grow_brand_trust'],
    ['/pricing', 'public', 'acquire', 'pricing', 'announce_free_access'],
    ['/gyms', 'public', 'acquire', 'gyms', 'find_gym_fast'],
    ['/marketplace', 'public', 'monetize', 'marketplace', 'browse_to_product'],
    ['/news', 'public', 'acquire', 'news', 'build_seo_trust'],
];

function tupleToPresentation([, shellType, funnel, analyticsPageId, businessObjective, flags = 0]: RoutePresentationTuple): RoutePresentation {
    return {
        shellType,
        funnel,
        analyticsPageId,
        businessObjective,
        hideHeader: Boolean(flags & FLAG_HIDE_HEADER),
        hideFooter: Boolean(flags & FLAG_HIDE_FOOTER),
        hideBottomNav: Boolean(flags & FLAG_HIDE_BOTTOM_NAV),
    };
}

export function resolveRoutePresentation(pathname: string) {
    const matched = ROUTE_PRESENTATIONS.find(([pattern]) => matchPath({ path: pattern, end: true }, pathname));
    return matched ? tupleToPresentation(matched) : DEFAULT_PRESENTATION;
}

export function useRoutePresentation() {
    const location = useLocation();
    return resolveRoutePresentation(location.pathname);
}

export { ROUTE_PRESENTATIONS };
