import React from 'react';
import { Link } from 'react-router-dom';
import type { GymCenter, GymTaxonomyTerm } from '../types';

export type GymCardVariant = 'standard' | 'featured' | 'compact' | 'list';

interface GymCardProps {
    gym: GymCenter;
    variant?: GymCardVariant;
    className?: string;
    index?: number;
}

const BILLING_LABELS: Record<string, string> = {
    per_day: '/ ngày',
    per_month: '/ tháng',
    per_quarter: '/ quý',
    per_year: '/ năm',
    per_session: '/ buổi',
};

const VENUE_LABELS: Record<string, string> = {
    gym: 'Gym',
    fitness_club: 'Fitness Club',
    yoga_studio: 'Yoga Studio',
    pilates_studio: 'Pilates Studio',
    boutique_studio: 'Boutique Studio',
    recovery_venue: 'Recovery & Wellness',
    crossfit_box: 'CrossFit Box',
    martial_arts: 'Võ thuật',
};

function getTerms(gym: GymCenter, type?: GymTaxonomyTerm['term_type']) {
    const terms = (gym.taxonomy_terms || [])
        .map((item) => item.term)
        .filter((term): term is GymTaxonomyTerm => Boolean(term));

    if (!type) return terms;
    return terms.filter((term) => term.term_type === type);
}

function getPrimaryVenueLabel(gym: GymCenter) {
    const primaryTerm = (gym.taxonomy_terms || []).find((item) => item.is_primary && item.term)?.term;
    if (primaryTerm?.label) return primaryTerm.label;
    if (gym.primary_venue_type_slug) return VENUE_LABELS[gym.primary_venue_type_slug] || gym.primary_venue_type_slug;
    return 'Active Space';
}

function getThumbnailUrl(gym: GymCenter) {
    return gym.listing_thumbnail?.image_url || gym.cover_image_url || gym.logo_url || null;
}

function getLocationLabel(gym: GymCenter) {
    const branches = gym.branches || [];
    if (branches.length === 0) return 'Chưa cập nhật địa điểm';

    const firstBranch = branches[0];
    const neighborhood = firstBranch.neighborhood_label;
    const district = firstBranch.district;
    const city = firstBranch.city;

    const label = [neighborhood, district, city].filter(Boolean).join(', ');
    if (branches.length > 1 && label) {
        return `${label} · ${branches.length} cơ sở`;
    }
    return label || `${branches.length} cơ sở`;
}

function formatPrice(gym: GymCenter) {
    if (!gym.price_from_amount) return 'Liên hệ';
    const cycleLabel = gym.price_from_billing_cycle ? (BILLING_LABELS[gym.price_from_billing_cycle] || '') : '';
    return `${Number(gym.price_from_amount).toLocaleString('vi-VN')}₫${cycleLabel ? ` ${cycleLabel}` : ''}`;
}

function getProofValue(gym: GymCenter) {
    const rating = gym.trust_summary?.avg_rating ?? gym.avg_rating;

    if (rating) {
        return `★ ${Number(rating).toFixed(1)}`;
    }

    if (gym.view_count) {
        return `${gym.view_count.toLocaleString('vi-VN')} lượt xem`;
    }

    return 'Mới trên marketplace';
}

function getAudienceLabels(gym: GymCenter) {
    return getTerms(gym, 'audience').map((term) => term.label).slice(0, 2);
}

// ─── Card (grid / featured / compact) ─────────────────────────────────────────

const GymCard: React.FC<GymCardProps> = ({
    gym,
    variant = 'standard',
    className = '',
    index = 0,
}) => {
    const href = gym.slug ? `/gyms/${gym.slug}` : `/gyms/${gym.id}`;
    const imageUrl = getThumbnailUrl(gym);
    const venueLabel = getPrimaryVenueLabel(gym);
    const locationLabel = getLocationLabel(gym);
    const priceLabel = formatPrice(gym);
    const proofLabel = getProofValue(gym);
    const audienceLabels = getAudienceLabels(gym);
    const highlights = (gym.hero_value_props && gym.hero_value_props.length > 0 ? gym.hero_value_props : gym.highlights) || [];
    const blurb = gym.discovery_blurb || gym.tagline || gym.description || 'Không gian tập luyện đã được tuyển chọn cho hành trình nâng cấp thể lực của bạn.';

    const isFeatured = variant === 'featured';
    const isCompact = variant === 'compact';
    const isList    = variant === 'list';

    // ── List row variant ──────────────────────────────────────────────────────
    if (isList) {
        return (
            <Link
                to={href}
                className={`group flex gap-4 items-center rounded-xl border border-[color:var(--mk-line)] bg-white/80 p-3 hover:shadow-md transition-all duration-200 ${className}`}
            >
                {/* Thumbnail */}
                <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-lg bg-[color:var(--mk-paper-strong)]">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={gym.name}
                            width={112}
                            height={112}
                            loading={index < 6 ? 'eager' : 'lazy'}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-400"
                        />
                    ) : (
                        <div className="flex h-full items-end p-2 bg-gradient-to-br from-[rgba(230,203,154,0.4)] to-[rgba(223,216,206,0.8)]">
                            <span className="text-[1.4rem] font-bold text-[color:var(--mk-text)]/20">{gym.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                    )}
                    {/* Venue badge over thumbnail */}
                    <span className="absolute top-1.5 left-1.5 marketplace-badge marketplace-badge--accent text-[0.6rem] px-1.5 py-0.5">
                        {venueLabel}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[color:var(--mk-muted)]">{locationLabel}</p>
                            <h3 className="text-[0.95rem] font-bold tracking-[-0.03em] text-[color:var(--mk-text)] line-clamp-1">{gym.name}</h3>
                        </div>
                        <div className="shrink-0 text-right">
                            <div className="text-sm font-bold text-[color:var(--mk-text)]">{priceLabel}</div>
                            <div className="text-[0.65rem] text-[color:var(--mk-muted)]">{proofLabel}</div>
                        </div>
                    </div>
                    <p className="line-clamp-1 text-[0.78rem] text-[color:var(--mk-muted)]">{blurb}</p>
                    {highlights.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {highlights.slice(0, 3).map((item) => (
                                <span key={item} className="inline-flex items-center rounded border border-[color:var(--mk-line)] bg-white/60 px-2 py-0.5 text-[0.65rem] font-medium text-[color:var(--mk-text-soft)]">
                                    {item}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <span className="shrink-0 text-[0.7rem] font-semibold tracking-wide text-[color:var(--mk-text)] transition-transform duration-300 group-hover:translate-x-1 pr-1">
                    OPEN →
                </span>
            </Link>
        );
    }

    // ── Card variants (standard / featured / compact) ─────────────────────────
    const wrapperClass = [
        'group relative overflow-hidden marketplace-panel transition duration-300',
        'hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(53,41,26,0.1)]',
        isFeatured ? 'h-full' : '',
        'rounded-lg',
        className,
    ].join(' ').trim();

    const imageClass = isFeatured
        ? 'aspect-[16/10]'
        : isCompact
            ? 'aspect-[1/1]'
            : 'aspect-[3/2]';

    return (
        <Link to={href} className={wrapperClass}>
            <div className={`relative overflow-hidden bg-[color:var(--mk-paper-strong)] ${imageClass}`}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={gym.name}
                        width={400}
                        height={300}
                        loading={index < 4 ? 'eager' : 'lazy'}
                        fetchPriority={index < 4 ? 'high' : 'auto'}
                        decoding="async"
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                ) : (
                    <div className="flex h-full w-full items-end justify-between bg-[radial-gradient(circle_at_top_left,rgba(230,203,154,0.55),transparent_34%),linear-gradient(160deg,rgba(255,255,255,0.45),rgba(223,216,206,0.85))] p-5">
                        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[color:var(--mk-muted)]">
                            {venueLabel}
                        </span>
                        <span className="text-[3rem] font-bold leading-none tracking-[-0.08em] text-[color:var(--mk-text)]/25">
                            {gym.name.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,24,19,0.6)] via-[rgba(31,24,19,0.08)] to-transparent" />

                {/* ── Top-left: venue + verified only — no SLA here to prevent overlap ── */}
                <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <span className="marketplace-badge marketplace-badge--accent">
                        {venueLabel}
                    </span>
                    {gym.is_verified && (
                        <span className="marketplace-badge marketplace-badge--verified">Verified</span>
                    )}
                </div>

                {/* ── Top-right: SLA badge separately to avoid collision ── */}
                {gym.response_sla_text && !isCompact && (
                    <div className="absolute right-3 top-3">
                        <span className="marketplace-badge marketplace-badge--neutral text-center">
                            {gym.response_sla_text}
                        </span>
                    </div>
                )}

                {/* ── Bottom: location + price (left) | proof (right) ── */}
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-white">
                    <div className="min-w-0">
                        <div className="text-[0.62rem] font-medium uppercase tracking-[0.18em] text-white/60">
                            {locationLabel}
                        </div>
                        <div className="mt-1 text-base font-bold tracking-[-0.03em] text-white sm:text-lg">
                            {priceLabel}
                        </div>
                    </div>

                    {!isCompact && (
                        <div className="rounded-md border border-white/15 bg-white/8 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-white/75 backdrop-blur-sm">
                            {proofLabel}
                        </div>
                    )}
                </div>
            </div>

            <div className={isFeatured ? 'p-6 sm:p-7' : isCompact ? 'p-4' : 'p-5'}>
                <div className="space-y-3">
                    <div>
                        <h3 className={isFeatured ? 'text-[clamp(1.3rem,2vw,1.7rem)] font-bold leading-[1.1] tracking-[-0.04em] text-[color:var(--mk-text)] line-clamp-2' : 'text-[1.1rem] font-bold leading-[1.1] tracking-[-0.03em] text-[color:var(--mk-text)] line-clamp-2'}>
                            {gym.name}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-[0.85rem] leading-6 text-[color:var(--mk-muted)]">
                            {blurb}
                        </p>
                    </div>

                    {highlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {highlights.slice(0, isFeatured ? 4 : 3).map((item) => (
                                <span
                                    key={item}
                                    className="inline-flex items-center rounded-md border border-[color:var(--mk-line)] bg-white/60 px-2.5 py-1 text-[0.7rem] font-medium text-[color:var(--mk-text-soft)]"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-[color:var(--mk-line)] pt-3">
                    <div className="min-w-0 flex-1">
                        <span className="text-[0.72rem] font-semibold text-[color:var(--mk-muted)] truncate block">
                            {(audienceLabels.length > 0 ? audienceLabels : ['Người muốn tập thông minh']).slice(0, 2).join(' · ')}
                        </span>
                    </div>

                    <div className="shrink-0 text-[0.7rem] font-semibold tracking-wide text-[color:var(--mk-text)] transition-transform duration-300 group-hover:translate-x-1">
                        OPEN →
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default React.memo(GymCard);
