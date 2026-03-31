// src/components/home/homeFeedUtils.ts
// Transform raw API data into ProfileGridItem[] and apply weighted shuffle

import type { ProfileGridItem } from './ProfileGridCard';
import type { Trainer, GymCenter } from '../../types';

/* ── Type augmentation for homepage trainer data ─────────────── */

type FeaturedTrainer = Trainer & {
    is_verified?: boolean;
    created_at?: string;
    slug?: string;
    user_type?: string;
};

/* ── Transform functions ─────────────────────────────────────── */

export function trainerToGridItem(t: FeaturedTrainer): ProfileGridItem | null {
    if (!t.avatar_url) return null;
    if (!t.bio || t.bio.length < 20) return null;

    const kind = t.user_type === 'athlete' ? 'athlete' as const : 'coach' as const;

    return {
        id: t.id,
        kind,
        name: t.full_name,
        avatarUrl: t.avatar_url,
        slug: t.slug || null,
        headline: t.specialties?.[0] || t.headline || null,
        location: null, // trainer API doesn't return location on list endpoint
        isVerified: Boolean(t.is_verified),
        rating: t.rating_avg > 0 ? t.rating_avg : null,
        reviewCount: t.review_count > 0 ? t.review_count : null,
        priceLabel: t.base_price_monthly
            ? `${t.base_price_monthly.toLocaleString('vi-VN')}đ/th`
            : null,
        tags: (t.specialties || []).slice(0, 2),
    };
}

export function gymToGridItem(g: GymCenter): ProfileGridItem | null {
    const hasImage = g.cover_image_url || g.logo_url || g.listing_thumbnail?.image_url;
    if (!hasImage) return null;
    if (!g.branches?.length) return null;

    const branches = g.branches || [];
    const firstBranch = branches[0];
    const locationParts = [firstBranch?.district, firstBranch?.city].filter(Boolean);

    const rating = g.trust_summary?.avg_rating ?? g.avg_rating ?? null;

    let priceLabel: string | null = null;
    if (g.price_from_amount) {
        const cycleLabels: Record<string, string> = {
            per_month: '/th', per_day: '/ngày', per_session: '/buổi',
            per_quarter: '/quý', per_year: '/năm',
        };
        const cycle = g.price_from_billing_cycle ? (cycleLabels[g.price_from_billing_cycle] || '') : '';
        priceLabel = `${Number(g.price_from_amount).toLocaleString('vi-VN')}đ${cycle}`;
    }

    return {
        id: g.id,
        kind: 'gym',
        name: g.name,
        avatarUrl: g.logo_url,
        coverUrl: g.listing_thumbnail?.image_url || g.cover_image_url,
        slug: g.slug,
        headline: g.tagline || g.discovery_blurb || null,
        location: locationParts.join(', ') || null,
        isVerified: g.is_verified,
        rating: rating ? Number(rating) : null,
        reviewCount: g.review_count ?? null,
        priceLabel,
        tags: (g.highlights || []).slice(0, 2),
        branchCount: branches.length,
    };
}

/* ── Weighted shuffle ────────────────────────────────────────── */

function scoreItem(item: ProfileGridItem): number {
    let score = 0;
    if (item.isVerified) score += 3;
    if (item.rating && item.rating > 0) score += 2;
    if (item.avatarUrl) score += 1;
    if (item.tags.length > 0) score += 1;
    return score;
}

function fisherYatesShuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Weighted shuffle: sort by quality score, take top N, then shuffle.
 * This ensures quality floor while maintaining randomness.
 */
export function weightedShuffle(
    items: ProfileGridItem[],
    maxItems: number = 12,
): ProfileGridItem[] {
    const scored = items
        .map((item) => ({ item, score: scoreItem(item) }))
        .sort((a, b) => b.score - a.score);

    const topPool = scored.slice(0, Math.max(maxItems * 2, 30));
    const shuffled = fisherYatesShuffle(topPool);
    return shuffled.slice(0, maxItems).map((s) => s.item);
}

/**
 * Mix coaches and gyms into a single feed with controlled distribution.
 * Target: ~60% coaches, ~30% gyms, ~10% athletes.
 * Falls back to more coaches if gyms are insufficient.
 */
export function buildHomeFeed(
    coaches: ProfileGridItem[],
    gyms: ProfileGridItem[],
    maxItems: number = 12,
): ProfileGridItem[] {
    const targetGyms = Math.min(Math.ceil(maxItems * 0.3), gyms.length);
    const targetCoaches = maxItems - targetGyms;

    const selectedGyms = weightedShuffle(gyms, targetGyms);
    const selectedCoaches = weightedShuffle(coaches, targetCoaches);

    // Interleave: insert a gym every 3rd position
    const result: ProfileGridItem[] = [];
    let gi = 0;
    let ci = 0;

    for (let i = 0; i < maxItems; i++) {
        if ((i + 1) % 4 === 0 && gi < selectedGyms.length) {
            result.push(selectedGyms[gi++]);
        } else if (ci < selectedCoaches.length) {
            result.push(selectedCoaches[ci++]);
        } else if (gi < selectedGyms.length) {
            result.push(selectedGyms[gi++]);
        }
    }

    return result;
}
