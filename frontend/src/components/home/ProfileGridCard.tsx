// src/components/home/ProfileGridCard.tsx
// Unified profile card for homepage grid — coach / athlete / gym variants

import { Link } from 'react-router-dom';
import { MapPin, Star, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';

/* ── Types ─────────────────────────────────────────────────────── */

export interface ProfileGridItem {
    id: string;
    kind: 'coach' | 'athlete' | 'gym';
    name: string;
    avatarUrl: string | null;
    coverUrl?: string | null;
    slug: string | null;
    headline: string | null;
    location: string | null;
    isVerified: boolean;
    rating: number | null;
    reviewCount: number | null;
    priceLabel: string | null;
    tags: string[];
    /** gym-specific */
    branchCount?: number;
}

/* ── Helpers ───────────────────────────────────────────────────── */

function resolveHref(item: ProfileGridItem): string {
    const id = item.slug || item.id;
    switch (item.kind) {
        case 'coach':
            return item.slug ? `/coach/${id}` : `/coaches/${id}`;
        case 'athlete':
            return item.slug ? `/athlete/${id}` : `/athletes/${id}`;
        case 'gym':
            return item.slug ? `/gyms/${id}` : `/gyms/${id}`;
    }
}

const KIND_LABEL: Record<ProfileGridItem['kind'], string> = {
    coach: 'HLV',
    athlete: 'VĐV',
    gym: 'Phòng tập',
};

/* ── Card ──────────────────────────────────────────────────────── */

export function ProfileGridCard({
    item,
    priority = false,
    onHover,
}: {
    item: ProfileGridItem;
    priority?: boolean;
    onHover?: (item: ProfileGridItem) => void;
}) {
    const href = resolveHref(item);
    const isGym = item.kind === 'gym';
    const imageUrl = isGym ? (item.coverUrl || item.avatarUrl) : item.avatarUrl;
    const initials = item.name.slice(0, 2).toUpperCase();

    return (
        <Link
            to={href}
            onClick={() => trackEvent('homepage_card_click', {
                entity_id: item.id,
                kind: item.kind,
                target: href,
            })}
            onMouseEnter={() => onHover?.(item)}
            onFocus={() => onHover?.(item)}
            className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300"
        >
            {/* Image */}
            <div className={`relative shrink-0 overflow-hidden bg-gray-100 ${isGym ? 'aspect-[16/10]' : 'aspect-[4/5]'}`}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading={priority ? 'eager' : 'lazy'}
                        decoding="async"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-3xl font-black text-gray-300">{initials}</span>
                    </div>
                )}

                {/* Kind badge */}
                <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                    {KIND_LABEL[item.kind]}
                </span>

                {/* Verified badge */}
                {item.isVerified && (
                    <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-bold text-gray-900 shadow-sm">
                        <CheckCircle2 className="h-3 w-3 text-blue-600" strokeWidth={2.5} aria-hidden />
                        Xác minh
                    </span>
                )}

                {/* Gradient overlay for non-gym (name on image) */}
                {!isGym && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-3 pb-3 pt-10">
                        <h3 className="text-[15px] font-bold leading-tight text-white line-clamp-1">
                            {item.name}
                        </h3>
                        {item.headline && (
                            <p className="mt-0.5 text-xs text-white/80 line-clamp-1">{item.headline}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col gap-1.5 px-3 py-2.5">
                {/* Gym: name in body */}
                {isGym && (
                    <>
                        <h3 className="text-[15px] font-bold leading-tight text-gray-900 line-clamp-1 group-hover:underline">
                            {item.name}
                        </h3>
                        {item.headline && (
                            <p className="text-xs text-gray-500 line-clamp-1">{item.headline}</p>
                        )}
                    </>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {item.tags.slice(0, 2).map((tag) => (
                            <span
                                key={tag}
                                className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Meta row */}
                <div className="mt-auto flex items-center justify-between gap-2 pt-1 border-t border-gray-100">
                    {/* Location */}
                    {item.location ? (
                        <span className="flex items-center gap-0.5 text-[11px] text-gray-500 truncate">
                            <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} aria-hidden />
                            {item.location}
                            {isGym && item.branchCount && item.branchCount > 1 && (
                                <span className="ml-0.5">· {item.branchCount} cơ sở</span>
                            )}
                        </span>
                    ) : (
                        <span className="text-[11px] text-gray-400">—</span>
                    )}

                    {/* Rating or Price */}
                    <span className="shrink-0 flex items-center gap-0.5 text-xs font-bold text-gray-900">
                        {item.rating ? (
                            <>
                                <Star className="h-3 w-3 fill-amber-400 text-amber-500" strokeWidth={1.5} aria-hidden />
                                {Number(item.rating).toFixed(1)}
                            </>
                        ) : item.priceLabel ? (
                            item.priceLabel
                        ) : null}
                    </span>
                </div>
            </div>
        </Link>
    );
}
