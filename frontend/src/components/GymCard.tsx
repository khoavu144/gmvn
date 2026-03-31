// src/components/GymCard.tsx
// v3.0 — Badge overlap fix · Tailwind thuần · Không --mk-* · Inter font
// Variants: standard | featured | compact | list

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
  gym: 'Phòng gym',
  fitness_club: 'Câu lạc bộ thể hình',
  yoga_studio: 'Studio yoga',
  pilates_studio: 'Studio pilates',
  boutique_studio: 'Studio chuyên biệt',
  recovery_venue: 'Phục hồi & chăm sóc',
  crossfit_box: 'Phòng CrossFit',
  martial_arts: 'Võ thuật',
};

function getTerms(gym: GymCenter, type?: GymTaxonomyTerm['term_type']) {
  const terms = (gym.taxonomy_terms || [])
    .map((item) => item.term)
    .filter((term): term is GymTaxonomyTerm => Boolean(term));
  if (!type) return terms;
  return terms.filter((t) => t.term_type === type);
}

function getPrimaryVenueLabel(gym: GymCenter) {
  const primaryTerm = (gym.taxonomy_terms || []).find((item) => item.is_primary && item.term)?.term;
  if (primaryTerm?.label) return primaryTerm.label;
  if (gym.primary_venue_type_slug)
    return VENUE_LABELS[gym.primary_venue_type_slug] || gym.primary_venue_type_slug;
  return 'Không gian tập luyện';
}

function getThumbnailUrl(gym: GymCenter) {
  return gym.listing_thumbnail?.image_url || gym.cover_image_url || gym.logo_url || null;
}

function getLocationLabel(gym: GymCenter) {
  const branches = gym.branches || [];
  if (branches.length === 0) return 'Chưa cập nhật địa điểm';
  const firstBranch = branches[0];
  const label = [firstBranch.neighborhood_label, firstBranch.district, firstBranch.city]
    .filter(Boolean)
    .join(', ');
  return branches.length > 1 && label ? `${label} · ${branches.length} cơ sở` : label || `${branches.length} cơ sở`;
}

function formatPrice(gym: GymCenter) {
  if (!gym.price_from_amount) return 'Liên hệ';
  const cycleLabel = gym.price_from_billing_cycle
    ? BILLING_LABELS[gym.price_from_billing_cycle] || ''
    : '';
  return `${Number(gym.price_from_amount).toLocaleString('vi-VN')}₫${cycleLabel ? ` ${cycleLabel}` : ''}`;
}

function getProofLabel(gym: GymCenter) {
  const rating = gym.trust_summary?.avg_rating ?? gym.avg_rating;
  if (rating) return `★ ${Number(rating).toFixed(1)}`;
  if (gym.view_count) return `${gym.view_count.toLocaleString('vi-VN')} lượt xem`;
  return 'Mới';
}

// ─── List variant ────────────────────────────────────────────────────────

function GymCardList({ gym, className }: { gym: GymCenter; className?: string }) {
  const href = gym.slug ? `/gyms/${gym.slug}` : `/gyms/${gym.id}`;
  const venueLabel = getPrimaryVenueLabel(gym);
  const thumbnailUrl = getThumbnailUrl(gym);
  const priceLabel = formatPrice(gym);
  const locationLabel = getLocationLabel(gym);
  const blurb =
    gym.discovery_blurb ||
    gym.tagline ||
    gym.description ||
    'Không gian tập luyện đã được tuyển chọn.';

  return (
    <Link
      to={href}
      className={[
        'group flex gap-4 bg-white border border-gray-200 rounded-lg p-4 shadow-sm',
        'hover:border-black hover:shadow-md transition-[border-color,box-shadow,transform] duration-150',
        className || '',
      ]
        .join(' ')
        .trim()}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-28 overflow-hidden rounded-lg bg-gray-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={gym.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-3xl font-black text-gray-300">
              {gym.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        {/* Venue badge — top-left */}
        <span className="absolute top-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/70 text-white uppercase tracking-[0.08em] max-w-[90%] truncate">
          {venueLabel}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="text-[15px] font-bold leading-tight text-black group-hover:underline line-clamp-1">
            {gym.name}
          </h3>
          <p className="text-[13px] text-gray-500 mt-1 line-clamp-2">{blurb}</p>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <span className="text-[12px] text-gray-500 truncate">{locationLabel}</span>
          <span className="shrink-0 text-[13px] font-bold text-black ml-3">{priceLabel}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── Card (standard / featured / compact) ────────────────────────────────

const GymCard: React.FC<GymCardProps> = ({
  gym,
  variant = 'standard',
  className = '',
  index = 0,
}) => {
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  if (variant === 'list') return <GymCardList gym={gym} className={className} />;

  const href = gym.slug ? `/gyms/${gym.slug}` : `/gyms/${gym.id}`;
  const venueLabel = getPrimaryVenueLabel(gym);
  const thumbnailUrl = getThumbnailUrl(gym);
  const priceLabel = formatPrice(gym);
  const locationLabel = getLocationLabel(gym);
  const proofLabel = getProofLabel(gym);
  const blurb =
    gym.discovery_blurb ||
    gym.tagline ||
    gym.description ||
    'Không gian tập luyện đã được tuyển chọn cho hành trình nâng cấp thể lực của bạn.';

  const highlights = getTerms(gym, 'training_style')
    .map((t) => t.label)
    .slice(0, isFeatured ? 4 : 3);

  const audienceLabels = getTerms(gym, 'audience')
    .map((t) => t.label)
    .slice(0, 2);
  const audienceSummary = (audienceLabels.length > 0 ? audienceLabels : ['Mọi đối tượng'])
    .slice(0, isCompact ? 1 : 2)
    .join(' · ');

  // Image aspect ratio by variant
  const imageClass = isFeatured ? 'aspect-[16/10]' : isCompact ? 'aspect-[4/3]' : 'aspect-[3/2]';

  return (
    <Link
      to={href}
      className={[
        'group relative flex min-h-0 h-full flex-col overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm',
        'hover:-translate-y-0.5 hover:shadow-lg hover:border-gray-300 transition-[transform,box-shadow,border-color] duration-200',
        className,
      ]
        .join(' ')
        .trim()}
    >
      {/* ── Thumbnail ── */}
      <div className={`relative shrink-0 overflow-hidden bg-gray-100 ${imageClass}`}>
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={gym.name}
            width={400}
            height={300}
            loading={index < 4 ? 'eager' : 'lazy'}
            fetchPriority={index < 4 ? 'high' : 'auto'}
            decoding="async"
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-[transform,filter,opacity] duration-500"
          />
        ) : (
          /* Placeholder */
          <div className="flex h-full w-full items-end justify-between bg-gradient-to-br from-gray-100 to-gray-200 p-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
              {venueLabel}
            </span>
            <span className="text-[3rem] font-black leading-none text-gray-300/60">
              {gym.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/08 to-transparent" />

        {/* ── TOP BADGE STACK ───────────────────────────────────────────── */}
        <div className="absolute inset-x-3 top-3 flex flex-col items-start gap-2">
          <div className="flex w-full items-start justify-between gap-2">
            <span className="max-w-[calc(100%-74px)] truncate rounded bg-black/72 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-sm">
              {venueLabel}
            </span>

            {gym.is_verified && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-black">
                ✓{!isCompact && <span className="hidden sm:inline"> Đã xác minh</span>}
              </span>
            )}
          </div>

          {gym.response_sla_text && !isCompact && (
            <span className="max-w-[11rem] truncate rounded border border-white/18 bg-black/28 px-2 py-1 text-[10px] font-medium text-white/88 backdrop-blur-sm">
              {gym.response_sla_text}
            </span>
          )}
        </div>

        {/* ── BOTTOM ROW: location + price | proof ── */}
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            {!isCompact && (
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/60 mb-0.5 truncate">
                {locationLabel}
              </p>
            )}
            <p className="text-[15px] sm:text-[17px] font-black tracking-tight text-white">
              {priceLabel}
            </p>
          </div>

          {!isCompact && (
            <span className="shrink-0 rounded border border-white/20 bg-white/10 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.1em] text-white/80">
              {proofLabel}
            </span>
          )}
        </div>
      </div>

      {/* ── Card body ── */}
      <div
        className={[
          'flex min-h-0 flex-1 flex-col',
          isFeatured ? 'p-5 sm:p-6' : isCompact ? 'p-3.5' : 'p-4',
        ].join(' ')}
      >
        <div className={`flex min-h-0 flex-1 flex-col ${isCompact ? 'space-y-2' : 'space-y-2.5'}`}>
          {/* Name + blurb */}
          <div>
            <h3
              className={[
                'font-bold leading-tight tracking-tight text-black line-clamp-2',
                isFeatured
                  ? 'min-h-[3rem] sm:min-h-[3.45rem] text-[1.35rem] sm:text-[1.5rem] tracking-[-0.03em]'
                  : 'min-h-[2.625rem] text-[1.05rem]',
              ].join(' ')}
            >
              {gym.name}
            </h3>
            {!isCompact && (
              <p className="mt-1 text-[13px] leading-[1.55] text-gray-500 line-clamp-2">
                {blurb}
              </p>
            )}
          </div>

          {/* Taxonomy highlights */}
          {highlights.length > 0 && !isCompact && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {highlights.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          {/* Footer row */}
          <div
            className={[
              'mt-auto flex items-center justify-between gap-2',
              isCompact ? 'pt-1' : 'border-t border-gray-100 pt-3',
            ].join(' ')}
          >
            <span className={isCompact ? 'truncate text-[11px] font-medium text-gray-500' : 'truncate text-[12px] text-gray-500'}>
              {audienceSummary}
            </span>
            <span
              className={[
                'shrink-0 font-semibold tracking-wide text-black transition-transform duration-200 group-hover:translate-x-0.5',
                isCompact ? 'text-[11px]' : 'text-[12px]',
              ].join(' ')}
            >
              Xem →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GymCard;
