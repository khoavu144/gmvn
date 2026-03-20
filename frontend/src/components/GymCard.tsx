import React from 'react';
import { Link } from 'react-router-dom';
import type { GymCenter, GymTaxonomyTerm } from '../types';

interface GymCardProps {
    gym: GymCenter;
    variant?: 'standard' | 'featured' | 'compact';
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
                        <span className="text-[0.7rem] font-black uppercase tracking-[0.25em] text-[color:var(--mk-muted)]">
                            {venueLabel}
                        </span>
                        <span className="text-[3rem] font-black leading-none tracking-[-0.08em] text-[color:var(--mk-text)]/25">
                            {gym.name.slice(0, 2).toUpperCase()}
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(31,24,19,0.82)] via-[rgba(31,24,19,0.12)] to-transparent" />

                <div className="absolute left-4 top-4 right-4 flex items-start justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        <span className="marketplace-badge marketplace-badge--accent">
                            {venueLabel}
                        </span>
                        {gym.is_verified && (
                            <span className="marketplace-badge marketplace-badge--verified">Verified</span>
                        )}
                    </div>

                    {gym.response_sla_text && !isCompact && (
                        <span className="marketplace-badge marketplace-badge--neutral max-w-[12rem] justify-center text-center">
                            {gym.response_sla_text}
                        </span>
                    )}
                </div>

                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-white">
                    <div className="min-w-0">
                        <div className="text-[0.68rem] font-bold uppercase tracking-[0.22em] text-white/68">
                            {locationLabel}
                        </div>
                        <div className="mt-1 text-lg font-black tracking-[-0.04em] text-white sm:text-xl">
                            {priceLabel}
                        </div>
                    </div>

                    {!isCompact && (
                        <div className="rounded-lg border border-white/18 bg-white/10 px-3 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/88 backdrop-blur-sm">
                            {proofLabel}
                        </div>
                    )}
                </div>
            </div>

            <div className={isFeatured ? 'p-6 sm:p-7' : isCompact ? 'p-4' : 'p-5'}>
                <div className="space-y-3">
                    <div>
                        <h3 className={isFeatured ? 'text-[clamp(1.6rem,2.4vw,2.15rem)] font-black leading-[0.95] tracking-[-0.06em] text-[color:var(--mk-text)] line-clamp-2' : 'text-[1.28rem] font-black leading-[0.98] tracking-[-0.05em] text-[color:var(--mk-text)] line-clamp-2'}>
                            {gym.name}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-[0.95rem] leading-7 text-[color:var(--mk-muted)]">
                            {blurb}
                        </p>
                    </div>

                    {highlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {highlights.slice(0, isFeatured ? 4 : 3).map((item) => (
                                <span
                                    key={item}
                                    className="inline-flex items-center rounded-lg border border-[color:var(--mk-line)] bg-white/70 px-3 py-1.5 text-[0.75rem] font-semibold text-[color:var(--mk-text-soft)]"
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

                    <div className="shrink-0 text-xs font-bold tracking-wide text-[color:var(--mk-text)] transition-transform duration-300 group-hover:translate-x-1">
                        OPEN →
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default React.memo(GymCard);
