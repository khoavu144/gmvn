import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedUrl, getSrcSet } from '../../utils/image';
import type { GymCenter, GymGallery } from '../../types';
import { SummaryPill } from '../../utils/gymDetailUtils';

export interface GymDetailHeroProps {
    gym: GymCenter;
    gallery: GymGallery[];
    safeSlideIndex: number;
    heroSlideItem: GymGallery | null;
    venueLabel: string;
    seoDescription: string;
    overviewBadges: string[];
    branchStatusBadges: string[];
    branchDetail: { best_visit_time_summary?: string | null; neighborhood_label?: string | null } | null;
    quickFacts: { label: string; value: string }[];
    reducedEffects: boolean;
    navigateToSection: (sectionId: string) => void;
    setHeroSlideIndex: (fn: (i: number) => number) => void;
    setLightboxIdx: (fn: (idx: number | null) => number) => void;
}

const GymDetailHero: React.FC<GymDetailHeroProps> = ({
    gym,
    gallery,
    safeSlideIndex,
    heroSlideItem,
    venueLabel,
    seoDescription,
    overviewBadges,
    branchStatusBadges,
    branchDetail,
    quickFacts,
    reducedEffects,
    navigateToSection,
    setHeroSlideIndex,
    setLightboxIdx,
}) => {
    return (
        <section className="marketplace-panel overflow-hidden">
            <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
                <div className="relative min-h-[13rem] max-h-[14rem] overflow-hidden bg-[color:var(--mk-paper-strong)] sm:min-h-[15rem] sm:max-h-[16rem] lg:min-h-[18rem] lg:max-h-[20rem]">
                    {gallery.length > 0 && heroSlideItem && (
                        <p className="sr-only" aria-live="polite" aria-atomic="true">
                            {`Ảnh ${safeSlideIndex + 1} trên ${gallery.length}`}
                        </p>
                    )}
                    {heroSlideItem ? (
                        <>
                            <img
                                src={getOptimizedUrl(heroSlideItem.image_url, 1440) || heroSlideItem.image_url}
                                srcSet={getSrcSet(heroSlideItem.image_url, [640, 1024, 1600])}
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                alt={heroSlideItem.alt_text || heroSlideItem.caption || gym.name}
                                className="h-full w-full object-cover"
                                fetchPriority="high"
                            />
                            {gallery.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setLightboxIdx(() => safeSlideIndex)}
                                    className="absolute inset-0 z-[1] cursor-zoom-in bg-transparent"
                                    aria-label="Phóng to ảnh"
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(230,203,154,0.45),transparent_36%),linear-gradient(155deg,rgba(255,255,255,0.55),rgba(222,214,201,0.95))]">
                            <span className="text-[5rem] font-bold leading-none tracking-[-0.08em] text-[color:var(--mk-text)]/20">
                                {gym.name.slice(0, 2).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(26,20,16,0.82)] via-[rgba(26,20,16,0.14)] to-transparent" />

                    <div className="absolute left-5 right-5 top-5 z-[2] flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                            <span className="marketplace-badge marketplace-badge--accent">{venueLabel}</span>
                            {gym.is_verified && <span className="marketplace-badge marketplace-badge--verified">Đã xác minh</span>}
                            {branchStatusBadges.slice(0, 2).map((badge) => (
                                <span key={badge} className="marketplace-badge marketplace-badge--neutral border-white/16 bg-white/12 text-white">
                                    {badge}
                                </span>
                            ))}
                        </div>
                        {branchDetail?.best_visit_time_summary && (
                            <div
                                className={`rounded-lg border border-white/16 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold text-white/84 ${reducedEffects ? '' : 'backdrop-blur-sm'}`}
                            >
                                {branchDetail?.best_visit_time_summary}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col justify-between p-6 sm:p-7 lg:p-8">
                    <div className="space-y-4">
                        <div className="marketplace-eyebrow">Chi tiết phòng tập</div>

                        <div>
                            <h1 className="text-[clamp(2.3rem,4vw,4.2rem)] font-bold leading-[0.92] tracking-[-0.07em] text-[color:var(--mk-text)]">
                                {gym.name}
                            </h1>
                            <p className="mt-4 line-clamp-3 text-[1.02rem] leading-7 text-[color:var(--mk-muted)] lg:line-clamp-4 lg:leading-8">
                                {seoDescription}
                            </p>
                            <button
                                type="button"
                                onClick={() => navigateToSection('overview')}
                                className="mt-2 text-left text-sm font-semibold text-[color:var(--mk-text)] underline decoration-[color:var(--mk-line)] underline-offset-4 transition hover:text-[color:var(--mk-accent-ink)]"
                            >
                                Xem thêm
                            </button>
                        </div>

                        {gallery.length > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setHeroSlideIndex((i) => (i - 1 + gallery.length) % gallery.length)}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--mk-line)] bg-white/90 text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/45"
                                    aria-label="Ảnh trước"
                                >
                                    <ChevronLeft className="h-5 w-5" aria-hidden />
                                </button>
                                <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                                    {gallery.map((item, index) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setHeroSlideIndex(() => index)}
                                            className={`relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border transition sm:h-20 sm:w-24 ${index === safeSlideIndex ? 'border-[color:var(--mk-text)] ring-2 ring-[color:var(--mk-text)]/20' : 'border-[color:var(--mk-line)] hover:border-[color:var(--mk-accent)]/45'}`}
                                        >
                                            <img
                                                src={getOptimizedUrl(item.image_url, 320) || item.image_url}
                                                alt={item.alt_text || item.caption || gym.name}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        </button>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setHeroSlideIndex((i) => (i + 1) % gallery.length)}
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color:var(--mk-line)] bg-white/90 text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/45"
                                    aria-label="Ảnh sau"
                                >
                                    <ChevronRight className="h-5 w-5" aria-hidden />
                                </button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {overviewBadges.map((label) => (
                                <span key={label} className="marketplace-badge marketplace-badge--neutral">{label}</span>
                            ))}
                            {branchDetail?.neighborhood_label && (
                                <span className="marketplace-badge marketplace-badge--neutral">{branchDetail?.neighborhood_label}</span>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {quickFacts.map((fact) => (
                            <SummaryPill key={fact.label} label={fact.label} value={fact.value} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GymDetailHero;
