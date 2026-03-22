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
}

function coachHref(t: CoachDirectoryTrainer): string {
    if (t.user_type === 'athlete') {
        return t.profile_slug ? `/athlete/${t.profile_slug}` : `/athletes/${t.id}`;
    }
    return t.profile_slug ? `/coach/${t.profile_slug}` : `/coaches/${t.id}`;
}

export const CoachDirectoryCard = memo(({ trainer }: { trainer: CoachDirectoryTrainer }) => {
    const { prefetchCoach, prefetchAthlete } = usePrefetchProfile();
    const href = coachHref(trainer);
    const isAthlete = trainer.user_type === 'athlete';

    const handlePrefetch = () => {
        const identifier = trainer.profile_slug || trainer.id;
        if (isAthlete) prefetchAthlete(identifier);
        else prefetchCoach(identifier);
    };

    const rating =
        trainer.avg_rating != null && Number(trainer.avg_rating) > 0
            ? Number(trainer.avg_rating).toFixed(1)
            : null;

    const priceLabel =
        trainer.base_price_monthly != null
            ? `${Number(trainer.base_price_monthly).toLocaleString('vi-VN')} ₫/tháng`
            : 'Liên hệ báo giá';

    const specs = trainer.specialties?.filter(Boolean) ?? [];

    return (
        <Link
            to={href}
            className="group flex min-h-0 flex-col overflow-hidden rounded-xl border border-[color:var(--mk-line)] bg-[color:var(--mk-paper)] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-[color:var(--mk-text)]/25 hover:shadow-[var(--mk-shadow-soft)]"
            onPointerEnter={handlePrefetch}
        >
            <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[color:var(--mk-paper-strong)]">
                {trainer.avatar_url ? (
                    <img
                        src={trainer.avatar_url}
                        alt={trainer.full_name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-black tracking-tight text-[color:var(--mk-muted)]/35">
                        {trainer.full_name.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color:var(--mk-text)]/55 via-transparent to-transparent" />
                {trainer.is_verified && (
                    <span className="absolute left-3 top-3 inline-flex items-center rounded border border-white/30 bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white backdrop-blur-sm">
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
                        <span className="shrink-0 rounded-md border border-white/25 bg-black/35 px-2 py-1 text-xs font-bold tabular-nums text-white backdrop-blur-sm">
                            ★ {rating}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span className="font-semibold text-[color:var(--mk-text)]">{priceLabel}</span>
                    {trainer.city && (
                        <>
                            <span className="text-[color:var(--mk-line)]" aria-hidden>
                                ·
                            </span>
                            <span className="text-[color:var(--mk-muted)]">{trainer.city}</span>
                        </>
                    )}
                </div>

                <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-[color:var(--mk-text-soft)]">
                    {trainer.bio || 'Chưa có thông tin giới thiệu.'}
                </p>

                {specs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {specs.slice(0, 3).map((spec) => (
                            <span
                                key={spec}
                                className="inline-flex rounded border border-[color:var(--mk-line)] bg-[color:var(--mk-bg)] px-2 py-0.5 text-[11px] font-medium text-[color:var(--mk-text-soft)]"
                            >
                                {spec}
                            </span>
                        ))}
                        {specs.length > 3 && (
                            <span className="inline-flex rounded border border-dashed border-[color:var(--mk-line)] px-2 py-0.5 text-[11px] text-[color:var(--mk-muted)]">
                                +{specs.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-[color:var(--mk-line)] pt-3 text-sm font-semibold text-[color:var(--mk-text)]">
                    Xem hồ sơ
                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
            </div>
        </Link>
    );
});

CoachDirectoryCard.displayName = 'CoachDirectoryCard';
