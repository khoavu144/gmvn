import { memo } from 'react';
import { Link } from 'react-router-dom';
import { usePrefetchProfile } from '../../hooks/usePrefetchProfile';

export interface CoachDirectoryTrainer {
    id: string;
    user_type?: 'trainer' | 'athlete' | string;
    profile_slug?: string | null;
    full_name: string;
    headline?: string | null;
    avatar_url: string | null;
    bio: string | null;
    specialties?: string[] | null;
    base_price_monthly?: number | null;
    is_verified?: boolean;
    city?: string | null;
    avg_rating?: number | null;
    review_count?: number | null;
    is_accepting_clients?: boolean | null;
}

function coachHref(t: CoachDirectoryTrainer): string {
    if (t.user_type === 'athlete') {
        return t.profile_slug ? `/athlete/${t.profile_slug}` : `/athletes/${t.id}`;
    }
    return t.profile_slug ? `/coach/${t.profile_slug}` : `/coaches/${t.id}`;
}

export const CoachDirectoryCard = memo(
    ({
        trainer,
        index = 0,
        reducedEffects = false,
        onClick,
    }: {
        trainer: CoachDirectoryTrainer;
        index?: number;
        reducedEffects?: boolean;
        onClick?: () => void;
    }) => {
    const { prefetchCoach, prefetchAthlete } = usePrefetchProfile();
    const href = coachHref(trainer);
    const isAthlete = trainer.user_type === 'athlete';

    const handlePrefetch = () => {
        if (typeof window !== 'undefined') {
            const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
            if (!canHover) return;
        }

        const identifier = trainer.profile_slug || trainer.id;
        if (isAthlete) prefetchAthlete(identifier);
        else prefetchCoach(identifier);
    };

    const hasRealReviews = Number(trainer.review_count ?? 0) > 0;
    const rating =
        hasRealReviews && trainer.avg_rating != null && Number(trainer.avg_rating) > 0
            ? Number(trainer.avg_rating).toFixed(1)
            : null;

    const priceLabel =
        trainer.base_price_monthly != null
            ? `${Number(trainer.base_price_monthly).toLocaleString('vi-VN')} ₫/tháng`
            : 'Chưa công khai giá';

    const specs = trainer.specialties?.filter(Boolean) ?? [];
    const intro = trainer.bio?.trim() || trainer.headline?.trim() || 'Đang cập nhật hồ sơ.';
    const availabilityLabel = trainer.is_accepting_clients === false ? 'Tạm đóng nhận học viên' : 'Đang nhận học viên';
    const availabilityClassName =
        trainer.is_accepting_clients === false
            ? 'border-amber-200 bg-amber-50 text-amber-800'
            : 'border-emerald-200 bg-emerald-50 text-emerald-700';

    const cardClassName = reducedEffects
        ? 'group flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm'
        : 'group flex min-h-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-gray-900/25 hover:shadow-md';

    const heroImageClassName = reducedEffects
        ? 'h-full w-full object-cover'
        : 'h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]';

    const badgeClassName = reducedEffects
        ? 'absolute left-3 top-3 inline-flex items-center rounded border border-white/30 bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white'
        : 'absolute left-3 top-3 inline-flex items-center rounded border border-white/30 bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm';

    const ratingClassName = reducedEffects
        ? 'shrink-0 rounded-md border border-white/25 bg-black/35 px-2 py-1 text-xs font-bold tabular-nums text-white'
        : 'shrink-0 rounded-md border border-white/25 bg-black/35 px-2 py-1 text-xs font-bold tabular-nums text-white backdrop-blur-sm';

    return (
        <Link to={href} className={cardClassName} onPointerEnter={handlePrefetch} onClick={onClick}>
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gray-100">
                {trainer.avatar_url ? (
                    <img
                        src={trainer.avatar_url}
                        alt={trainer.full_name}
                        className={heroImageClassName}
                        loading={index < 2 ? 'eager' : 'lazy'}
                        fetchPriority={index < 2 ? 'high' : 'auto'}
                        decoding="async"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-black tracking-tight text-gray-500/35">
                        {trainer.full_name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-gray-900/55 via-transparent to-transparent" />
                {trainer.is_verified && (
                    <span className={badgeClassName}>
                        Đã xác minh
                    </span>
                )}
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold tracking-tight text-white drop-shadow-sm">
                            {trainer.full_name}
                        </h3>
                        {trainer.headline && (
                            <p className="mt-0.5 line-clamp-1 text-xs font-medium text-white/85">{trainer.headline}</p>
                        )}
                    </div>
                    {rating && (
                        <span className={ratingClassName}>
                            ★ {rating}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-5">
                <div className="flex flex-wrap gap-1.5">
                    {trainer.is_verified ? (
                        <span className="inline-flex rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-900">
                            Hồ sơ xác minh
                        </span>
                    ) : null}
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${availabilityClassName}`}>
                        {availabilityLabel}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-semibold text-gray-900">{priceLabel}</span>
                    {trainer.city && (
                        <>
                            <span className="text-gray-300" aria-hidden>
                                ·
                            </span>
                            <span className="text-gray-500">{trainer.city}</span>
                        </>
                    )}
                </div>

                <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                    {intro}
                </p>

                {specs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {specs.slice(0, 3).map((spec) => (
                            <span
                                key={spec}
                                className="inline-flex rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                            >
                                {spec}
                            </span>
                        ))}
                        {specs.length > 3 && (
                            <span className="inline-flex rounded border border-dashed border-gray-200 px-2 py-0.5 text-[11px] text-gray-500">
                                +{specs.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-200 pt-3 text-sm font-semibold text-gray-900">
                    <div className="min-w-0">
                        {rating ? (
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                                <span aria-hidden>★</span>
                                {rating}
                                <span className="text-xs font-medium text-gray-500">
                                    ({Number(trainer.review_count ?? 0).toLocaleString('vi-VN')} đánh giá)
                                </span>
                            </span>
                        ) : (
                            <span className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                                Chưa có đánh giá
                            </span>
                        )}
                    </div>
                    <span className={reducedEffects ? '' : 'transition-transform duration-200 group-hover:translate-x-1'}>
                        Xem hồ sơ →
                    </span>
                </div>
            </div>
        </Link>
    );
});

CoachDirectoryCard.displayName = 'CoachDirectoryCard';
