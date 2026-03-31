import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Trainer } from '../../types';

export type HomeSpotlightProfile = Trainer & {
    slug?: string;
    user_type?: string;
    is_verified?: boolean;
    created_at?: string;
};

function shuffle<T>(items: T[]): T[] {
    const a = [...items];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const MAX_SLIDES = 12;

type BodyProps = {
    slides: HomeSpotlightProfile[];
    resolveHref: (p: HomeSpotlightProfile) => string;
    onPrefetch?: (p: HomeSpotlightProfile) => void;
};

function SpotlightCarouselBody({ slides, resolveHref, onPrefetch }: BodyProps) {
    const [index, setIndex] = useState(0);

    const goPrev = useCallback(() => {
        setIndex((i) => (i - 1 + slides.length) % slides.length);
    }, [slides.length]);

    const goNext = useCallback(() => {
        setIndex((i) => (i + 1) % slides.length);
    }, [slides.length]);

    const current = slides[index];

    return (
        <div className="flex flex-col">
            <p className="marketplace-section-kicker mb-2 lg:mb-3">Khám phá hồ sơ</p>
            <p className="mb-4 text-sm leading-6 text-gray-600 lg:mb-5">
                Vuốt hoặc dùng nút để xem thành viên khác.
            </p>

            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ring-1 ring-gray-900/[0.04]">
                <div className="relative aspect-[4/5] w-full bg-gray-100">
                    <img
                        key={current.id}
                        src={current.avatar_url!}
                        alt={current.full_name}
                        className="h-full w-full object-cover animate-fade-in"
                        loading="lazy"
                        decoding="async"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-4 pb-4 pt-16">
                        <Link
                            to={resolveHref(current)}
                            onMouseEnter={() => onPrefetch?.(current)}
                            onFocus={() => onPrefetch?.(current)}
                            className="text-lg font-bold tracking-tight text-white underline-offset-2 hover:underline"
                        >
                            {current.full_name}
                        </Link>
                        {current.specialties?.[0] && (
                            <p className="mt-1 text-sm text-white/85">{current.specialties[0]}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-gray-200 px-3 py-2">
                    <button
                        type="button"
                        onClick={goPrev}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-800 transition hover:bg-gray-50"
                        aria-label="Trước"
                    >
                        <ChevronLeft className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </button>
                    <span className="text-xs font-semibold tabular-nums text-gray-500">
                        {index + 1} / {slides.length}
                    </span>
                    <button
                        type="button"
                        onClick={goNext}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-800 transition hover:bg-gray-50"
                        aria-label="Tiếp"
                    >
                        <ChevronRight className="h-5 w-5" strokeWidth={2} aria-hidden />
                    </button>
                </div>
            </div>
        </div>
    );
}

type Props = {
    profiles: HomeSpotlightProfile[];
    resolveHref: (p: HomeSpotlightProfile) => string;
    onPrefetch?: (p: HomeSpotlightProfile) => void;
};

export function HomeProfileSpotlight({ profiles, resolveHref, onPrefetch }: Props) {
    const slides = useMemo(() => {
        const withAvatar = profiles.filter((p) => p.avatar_url);
        return shuffle(withAvatar).slice(0, MAX_SLIDES);
    }, [profiles]);

    const rosterKey = useMemo(
        () =>
            [...new Set(slides.map((s) => s.id))]
                .sort()
                .join('|'),
        [slides]
    );

    if (slides.length < 2) {
        return (
            <div className="flex flex-col rounded-xl border border-gray-200 bg-gray-50/80 p-5">
                <p className="marketplace-section-kicker mb-2">Khám phá hồ sơ</p>
                <p className="text-sm leading-6 text-gray-600">
                    {slides.length === 1
                        ? 'Chỉ có một hồ sơ có ảnh. Mở danh sách huấn luyện viên để xem thêm.'
                        : 'Chưa có đủ hồ sơ có ảnh để xem nhanh. Khám phá huấn luyện viên trên GYMERVIET.'}
                </p>
                <Link
                    to="/coaches"
                    className="btn-primary mt-4 inline-flex w-fit px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em]"
                >
                    Xem danh sách huấn luyện viên
                </Link>
            </div>
        );
    }

    return (
        <SpotlightCarouselBody
            key={rosterKey}
            slides={slides}
            resolveHref={resolveHref}
            onPrefetch={onPrefetch}
        />
    );
}
