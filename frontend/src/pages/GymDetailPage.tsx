import { truncateMetaDescription } from "../utils/seo";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { gymService } from '../services/gymService';
import type {
    GymBranch,
    GymCenter,
} from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import GymProgramsSection from '../components/gym-detail/GymProgramsSection';
import GymReviewsSection from '../components/gym-detail/GymReviewsSection';
import GymZonesSection from '../components/gym-detail/GymZonesSection';
import GymFacilitiesSection from '../components/gym-detail/GymFacilitiesSection';
import GymTrainersSection from '../components/gym-detail/GymTrainersSection';
import GymPricingSection from '../components/gym-detail/GymPricingSection';
import GymMapSection from '../components/gym-detail/GymMapSection';
import { GymSectionHeading } from '../components/gym-detail/GymSectionHeading';
import { useMobileReducedEffects } from '../hooks/useMobileReducedEffects';
import { absoluteUrl } from '../lib/site';
import GymDetailHero from '../components/gym-detail/GymDetailHero';
import GymDetailLightbox from '../components/gym-detail/GymDetailLightbox';
import GymDetailSidebar from '../components/gym-detail/GymDetailSidebar';
import GymDetailMobileCTA from '../components/gym-detail/GymDetailMobileCTA';
import {
    getTaxonomyLabels,
    getPrimaryVenueLabel,
    getFallbackGallery,
    resolveLeadRoute,
    getTodayHours,
    OverviewMetaRow
} from '../utils/gymDetailUtils';

const BILLING_LABELS: Record<string, string> = {
    per_day: '/ ngày',
    per_month: '/ tháng',
    per_quarter: '/ quý',
    per_year: '/ năm',
    per_session: '/ buổi',
};



const GymDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [gym, setGym] = useState<GymCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
    const [activeSection, setActiveSection] = useState('overview');

    const [similarGyms, setSimilarGyms] = useState<GymCenter[]>([]);

    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    const [heroSlideIndex, setHeroSlideIndex] = useState(0);
    const reducedEffects = useMobileReducedEffects();

    useEffect(() => {
        if (!id) return;

        let mounted = true;

        (async () => {
            try {
                setLoading(true);
                const response = await gymService.getMarketplaceGym(id);
                if (!mounted) return;

                if (response.success && response.gym) {
                    setGym(response.gym);
                    if (response.canonical_slug && response.canonical_slug !== id) {
                        navigate(`/gyms/${response.canonical_slug}`, { replace: true });
                    }
                    const firstBranch = response.gym.branches?.[0];
                    setActiveBranchId(firstBranch?.id || null);
                } else {
                    setGym(null);
                }
            } catch {
                if (mounted) setGym(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [id, navigate]);

    useEffect(() => {
        if (!gym?.id) return;

        let mounted = true;
        gymService.getSimilarMarketplaceGyms(gym.id, 4)
            .then((response) => {
                if (!mounted) return;
                setSimilarGyms(response.success ? (response.gyms || []) : []);
            })
            .catch(() => {
                if (mounted) setSimilarGyms([]);
            });

        return () => {
            mounted = false;
        };
    }, [gym?.id]);


    const branches = useMemo(() => gym?.branches ?? [], [gym?.branches]);
    const branchDetail = useMemo(() => {
        if (!branches.length) return null;
        return branches.find((branch) => branch.id === activeBranchId) || branches[0];
    }, [branches, activeBranchId]);
    const branchId = branchDetail?.id || null;
    const branchName = branchDetail?.branch_name || gym?.name || 'Venue branch';
    const branchStatusBadges = branchDetail?.branch_status_badges || [];
    const branchAmenities = branchDetail?.amenities || [];
    const branchEquipment = useMemo(() => branchDetail?.equipment ?? [], [branchDetail?.equipment]);
    const branchZones = branchDetail?.zones || [];
    const branchTrainerLinks = branchDetail?.trainer_links || [];
    const branchPricing = useMemo(
        () => [...(branchDetail?.pricing || [])].sort((a, b) => (a.order_number ?? 0) - (b.order_number ?? 0)),
        [branchDetail?.pricing]
    );
    const branchPrograms = branchDetail?.programs || [];
    const branchMapEmbedUrl = branchDetail?.google_maps_embed_url || null;
    const branchLatitude = branchDetail?.latitude ?? null;
    const branchLongitude = branchDetail?.longitude ?? null;
    const branchPhone = branchDetail?.phone || null;
    const branchEmail = branchDetail?.email || null;
    const branchWhatsapp = branchDetail?.whatsapp_number || null;
    const hasCoordinates = branchLatitude !== null && branchLongitude !== null;
    const entryBillingCycle = branchPricing[0]?.billing_cycle || null;
    const branchEquipmentGroups = useMemo(() => {
        return branchEquipment.reduce<Record<string, NonNullable<GymBranch['equipment']>>>((acc, item) => {
            const key = item.category || 'other';
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    }, [branchEquipment]);

    const gallery = useMemo(() => {
        if (branchDetail?.gallery && branchDetail.gallery.length > 0) {
            return branchDetail.gallery;
        }
        return getFallbackGallery(gym, branchId);
    }, [branchDetail?.gallery, branchId, gym]);

    const heroImage = gallery.find((item) => item.is_hero) || gallery[0] || null;

    const heroIndexInGallery = useMemo(() => {
        if (!gallery.length) return 0;
        const idx = gallery.findIndex((item) => item.is_hero);
        return idx >= 0 ? idx : 0;
    }, [gallery]);

    useEffect(() => {
        setHeroSlideIndex(heroIndexInGallery);
    }, [heroIndexInGallery]);

    const safeSlideIndex = gallery.length > 0 ? Math.min(heroSlideIndex, gallery.length - 1) : 0;
    const heroSlideItem = gallery[safeSlideIndex] || heroImage;

    const todayHours = getTodayHours(branchDetail);
    const lowestPrice = useMemo(() => {
        const values = branchPricing.map((plan) => Number(plan.price)).filter((value) => value > 0);
        return values.length > 0 ? Math.min(...values) : null;
    }, [branchPricing]);



    const overviewBadges = useMemo(() => {
        const labels = [
            ...getTaxonomyLabels(gym, 'training_style', 3),
            ...getTaxonomyLabels(gym, 'audience', 2),
            ...getTaxonomyLabels(gym, 'positioning', 2),
        ];
        return Array.from(new Set(labels)).slice(0, 5);
    }, [gym]);

    const visibleSections = useMemo(() => {
        return [
            { id: 'overview', label: 'Tổng quan', visible: true },
            { id: 'zones', label: 'Không gian', visible: branchZones.length > 0 },
            { id: 'facilities', label: 'Tiện ích', visible: branchAmenities.length > 0 || branchEquipment.length > 0 },
            { id: 'trainers', label: 'Chuyên gia', visible: branchTrainerLinks.length > 0 },
            { id: 'pricing', label: 'Gói tập', visible: branchPricing.length > 0 },
            { id: 'schedule', label: 'Lịch lớp', visible: branchPrograms.length > 0 },
            { id: 'reviews', label: 'Đánh giá', visible: true },
            { id: 'similar', label: 'Venue tương tự', visible: similarGyms.length > 0 },
            {
                id: 'map',
                label: 'Bản đồ',
                visible: Boolean(branchMapEmbedUrl || hasCoordinates),
            },
        ].filter((item) => item.visible);
    }, [
        branchAmenities.length,
        branchEquipment.length,
        branchMapEmbedUrl,
        branchPricing.length,
        branchPrograms.length,
        branchTrainerLinks.length,
        branchZones.length,
        hasCoordinates,
        similarGyms.length,
    ]);

    const setRef = useCallback((sectionId: string) => (node: HTMLElement | null) => {
        sectionRefs.current[sectionId] = node;
    }, []);

    const navigateToSection = useCallback((sectionId: string) => {
        const el = sectionRefs.current[sectionId];
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(sectionId);
            const base = `${window.location.pathname}${window.location.search}`;
            window.history.replaceState(null, '', `${base}#${sectionId}`);
        }
    }, []);

    useEffect(() => {
        if (loading || !gym) return;
        const hash = window.location.hash.replace(/^#/, '');
        if (!hash) return;
        if (!visibleSections.some((s) => s.id === hash)) return;
        const t = window.setTimeout(() => {
            const el = sectionRefs.current[hash];
            if (el) {
                el.scrollIntoView({ behavior: 'auto', block: 'start' });
                setActiveSection(hash);
            }
        }, 80);
        return () => window.clearTimeout(t);
    }, [loading, gym, visibleSections]);

    useEffect(() => {
        if (!gym) return;
        const getOffset = () => {
            const root = document.documentElement;
            const h = parseFloat(getComputedStyle(root).getPropertyValue('--header-height')) || 56;
            return h + 56 + 12;
        };

        const offset = getOffset();
        const activeMap = new Map<string, number>();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const id = (entry.target as HTMLElement).id;
                    if (!id) return;
                    if (entry.isIntersecting) {
                        activeMap.set(id, entry.boundingClientRect.top);
                    } else {
                        activeMap.delete(id);
                    }
                });

                if (activeMap.size === 0) return;

                const nearest = [...activeMap.entries()].sort(
                    (a, b) => Math.abs(a[1] - offset) - Math.abs(b[1] - offset)
                )[0]?.[0];

                if (nearest) {
                    setActiveSection((prev) => (prev === nearest ? prev : nearest));
                }
            },
            {
                root: null,
                rootMargin: `-${offset}px 0px -55% 0px`,
                threshold: [0, 0.15, 0.35, 0.6, 0.85],
            }
        );

        visibleSections.forEach((section) => {
            const el = sectionRefs.current[section.id];
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [gym, visibleSections]);

    useEffect(() => {
        if (lightboxIdx === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setLightboxIdx(null);
            } else if (e.key === 'ArrowLeft' && gallery.length > 1) {
                setLightboxIdx((current) => current === null ? 0 : (current - 1 + gallery.length) % gallery.length);
            } else if (e.key === 'ArrowRight' && gallery.length > 1) {
                setLightboxIdx((current) => current === null ? 0 : (current + 1) % gallery.length);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [lightboxIdx, gallery.length]);

    if (loading) {
        return (
            <div className="marketplace-shell min-h-screen">
                <div className="marketplace-container gv-pad-y">
                    <Skeleton className="h-[28rem] w-full rounded-lg" />
                    <div className="mt-6 grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
                        <div className="space-y-4">
                            <Skeleton className="h-6 w-40 rounded-full" />
                            <Skeleton className="h-16 w-3/4 rounded-lg" />
                            <Skeleton className="h-5 w-full rounded-full" />
                            <Skeleton className="h-5 w-4/5 rounded-full" />
                        </div>
                        <Skeleton className="h-40 w-full rounded-lg" />
                    </div>
                </div>
            </div>
        );
    }

    if (!gym) {
        return (
            <div className="marketplace-shell min-h-screen">
                <div className="marketplace-container flex min-h-screen flex-col items-center justify-center gap-5 text-center">
                    <div className="text-[5rem] font-bold leading-none tracking-[-0.08em] text-[color:var(--mk-accent)]/45">404</div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-[-0.05em] text-[color:var(--mk-text)]">Không tìm thấy venue này.</h1>
                        <p className="marketplace-lead">Liên kết có thể đã thay đổi hoặc venue hiện không còn hiển thị trên marketplace.</p>
                    </div>
                    <Link to="/gyms" className="marketplace-chip is-active">Quay lại danh sách</Link>
                </div>
            </div>
        );
    }

    const venueLabel = getPrimaryVenueLabel(gym);
    const leadAction = resolveLeadRoute(gym, branchDetail);
    const canonicalUrl = absoluteUrl(`/gyms/${gym.slug || gym.id}`);
    const seoTitle = `${gym.name} — ${venueLabel} trên GYMERVIET`;
    const seoDescription = gym.discovery_blurb || gym.tagline || gym.description || `${gym.name} — ${venueLabel} trên GYMERVIET.`;
    const metaDescription = truncateMetaDescription(seoDescription, 155);
    const seoImage = heroImage?.image_url || gym.cover_image_url || gym.logo_url || '';

    const quickFacts = [
        { label: 'Loại hình', value: venueLabel },
        {
            label: 'Giá vào từ',
            value: lowestPrice ? `${lowestPrice.toLocaleString('vi-VN')}₫${entryBillingCycle ? ` ${BILLING_LABELS[entryBillingCycle] || ''}` : ''}` : 'Liên hệ để nhận giá',
        },
        {
            label: 'Điểm uy tín',
            value:
                gym.trust_summary?.avg_rating != null
                    ? `★ ${Number(gym.trust_summary.avg_rating).toFixed(1)} · ${gym.trust_summary.review_count} đánh giá`
                    : 'Đang cập nhật đánh giá',
        },
        {
            label: 'Phù hợp',
            value: getTaxonomyLabels(gym, 'audience', 1)[0] || 'Người đang tìm venue phù hợp',
        },
    ];


    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={metaDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="business.business" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={metaDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content="GYMERVIET" />
                {seoImage && <meta property="og:image" content={seoImage} />}
                {seoImage && <meta property="og:image:width" content="1200" />}
                {seoImage && <meta property="og:image:height" content="800" />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={metaDescription} />
                {seoImage && <meta name="twitter:image" content={seoImage} />}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'ExerciseGym',
                    name: gym.name,
                    description: seoDescription,
                    image: seoImage || undefined,
                    url: canonicalUrl,
                    address: branchDetail ? {
                        '@type': 'PostalAddress',
                        streetAddress: branchDetail.address,
                        addressLocality: branchDetail.city || branchDetail.district || undefined,
                        addressCountry: 'VN',
                    } : undefined,
                    telephone: branchDetail?.phone || undefined,
                })}</script>
            </Helmet>

            <GymDetailLightbox
                gymName={gym.name}
                gallery={gallery}
                lightboxIdx={lightboxIdx}
                setLightboxIdx={setLightboxIdx}
            />

            <div className="marketplace-shell gym-detail-page ui-detail-shell ui-detail-shell--marketplace min-h-screen">
                <div className="marketplace-container gv-pad-y-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <Link to="/gyms" className="back-link">← Quay lại danh sách phòng tập</Link>
                        <div className="hidden items-center gap-2 md:flex">
                            {branchStatusBadges.slice(0, 3).map((badge) => (
                                <span key={badge} className="marketplace-badge marketplace-badge--neutral">{badge}</span>
                            ))}
                        </div>
                    </div>

                    <GymDetailHero
                        gym={gym}
                        gallery={gallery}
                        safeSlideIndex={safeSlideIndex}
                        heroSlideItem={heroSlideItem}
                        venueLabel={venueLabel}
                        seoDescription={seoDescription}
                        overviewBadges={overviewBadges}
                        branchStatusBadges={branchStatusBadges}
                        branchDetail={branchDetail}
                        quickFacts={quickFacts}
                        reducedEffects={reducedEffects}
                        navigateToSection={navigateToSection}
                        setHeroSlideIndex={setHeroSlideIndex}
                        setLightboxIdx={setLightboxIdx}
                    />
                </div>

                <div className="marketplace-container gv-pad-y-sm">
                    <div
                        className={`gym-detail-subnav rounded-lg border border-[color:var(--mk-line)] px-3 py-2 ${reducedEffects ? 'bg-[rgba(255,251,244,0.96)]' : 'bg-[rgba(255,251,244,0.82)] backdrop-blur-xl'}`}
                    >
                        <div className="relative">
                            <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                {visibleSections.map((section) => (
                                    <button
                                        key={section.id}
                                        type="button"
                                        onClick={() => navigateToSection(section.id)}
                                        className={`shrink-0 rounded-lg px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.16em] transition ${activeSection === section.id ? 'bg-[color:var(--mk-text)] text-white' : 'text-[color:var(--mk-text-soft)] hover:bg-white/70'}`}
                                    >
                                        {section.label}
                                    </button>
                                ))}
                            </div>
                            {/* Scroll fade indicators */}
                            <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[rgba(255,251,244,0.9)] to-transparent" aria-hidden />
                        </div>
                    </div>
                </div>

                <div className="marketplace-container gv-pad-y-sm grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.45fr)] pb-20 lg:pb-0">
                    <div className="flex flex-col gap-8">
                        <section ref={setRef('overview')} id="overview" className="gym-detail-section marketplace-panel gv-panel-pad">
                                <GymSectionHeading
                                    kicker="Tổng quan"
                                    title="Tóm tắt về cơ sở"
                                    description="Một bức chân dung nhanh để biết nơi này có đúng phong cách tập, mức đầu tư và trải nghiệm bạn đang tìm hay không."
                                />

                                <div className="grid gap-6 lg:grid-cols-[1fr_minmax(16rem,0.4fr)]">
                                    <div className="space-y-5">
                                        <div className="prose max-w-none text-[color:var(--mk-text-soft)]">
                                            {(gym.description || seoDescription)
                                                .split('\n')
                                                .filter((item) => item.trim())
                                                .map((paragraph, index) => (
                                                    <p key={index} className="mb-4 text-[1rem] leading-8">
                                                        {paragraph}
                                                    </p>
                                                ))}
                                        </div>

                                        {(gym.hero_value_props || gym.highlights || []).length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {(gym.hero_value_props || gym.highlights || []).slice(0, 6).map((item) => (
                                                    <span key={item} className="rounded-lg border border-[color:var(--mk-line)] bg-white/80 px-4 py-2 text-sm font-semibold text-[color:var(--mk-text-soft)]">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 px-3 py-1 shadow-[0_10px_28px_rgba(53,41,26,0.04)]">
                                        <OverviewMetaRow label="Chi nhánh" value={branchDetail?.branch_name || 'Chưa chọn'} />
                                        <OverviewMetaRow
                                            label="Khu vực"
                                            value={[branchDetail?.district, branchDetail?.city].filter(Boolean).join(', ') || 'Chưa cập nhật'}
                                        />
                                        {branchDetail?.address ? (
                                            <OverviewMetaRow label="Địa chỉ" value={branchDetail.address} />
                                        ) : null}
                                        <OverviewMetaRow
                                            label="Không khí"
                                            value={getTaxonomyLabels(gym, 'atmosphere', 1)[0] || 'Tập trung vào trải nghiệm thực tế'}
                                        />
                                        <OverviewMetaRow label="Phản hồi" value={gym.response_sla_text || leadAction.helper || '—'} />
                                        {gym.website_url ? (
                                            <div className="flex flex-row items-baseline justify-between gap-3 py-2">
                                                <span className="shrink-0 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Trang web</span>
                                                <a
                                                    href={gym.website_url.startsWith('http') ? gym.website_url : `https://${gym.website_url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="min-w-0 truncate text-right text-sm font-semibold text-[color:var(--mk-text)] underline decoration-[color:var(--mk-line)] underline-offset-2 hover:text-[color:var(--mk-accent-ink)]"
                                                >
                                                    {gym.website_url.replace(/^https?:\/\//i, '')}
                                                </a>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                        </section>

                        {branchZones.length > 0 && <GymZonesSection branchZones={branchZones} setRef={setRef} />}

                        {(branchAmenities.length > 0 || branchEquipment.length > 0) && (
                            <GymFacilitiesSection
                                branchAmenities={branchAmenities}
                                branchEquipment={branchEquipment}
                                branchEquipmentGroups={branchEquipmentGroups}
                                setRef={setRef}
                            />
                        )}

                        {branchTrainerLinks.length > 0 && (
                            <GymTrainersSection branchTrainerLinks={branchTrainerLinks} setRef={setRef} />
                        )}

                        {branchPricing.length > 0 && (
                            <GymPricingSection branchPricing={branchPricing} setRef={setRef} leadAction={leadAction} />
                        )}

                        {branchPrograms.length > 0 && (
                            <GymProgramsSection branchPrograms={branchPrograms} gymId={gym.id} branchId={branchDetail?.id} setRef={setRef} />
                        )}

                        <GymReviewsSection gymId={gym.id} branchId={branchId} gymTrustSummary={gym.trust_summary} setRef={setRef} />

                        {similarGyms.length > 0 && (
                            <div
                                ref={setRef('similar')}
                                id="similar"
                                className="gym-detail-section h-px w-full shrink-0 scroll-mt-[var(--gym-detail-scroll-margin)] opacity-0"
                                aria-hidden
                            />
                        )}

                        {(branchMapEmbedUrl || hasCoordinates) && (
                            <GymMapSection
                                branchMapEmbedUrl={branchMapEmbedUrl}
                                branchLatitude={branchLatitude}
                                branchLongitude={branchLongitude}
                                branchName={branchName}
                                branchDetail={branchDetail}
                                setRef={setRef}
                            />
                        )}
                    </div>

                    <GymDetailSidebar
                        gym={gym}
                        branches={branches}
                        branchDetail={branchDetail}
                        branchName={branchName}
                        branchPhone={branchPhone}
                        branchEmail={branchEmail}
                        branchWhatsapp={branchWhatsapp}
                        branchPrograms={branchPrograms}
                        similarGyms={similarGyms}
                        lowestPrice={lowestPrice}
                        todayHours={todayHours}
                        leadAction={leadAction}
                        canonicalUrl={canonicalUrl}
                        seoTitle={seoTitle}
                        seoDescription={seoDescription}
                        navigateToSection={navigateToSection}
                        setActiveBranchId={setActiveBranchId}
                    />
                </div>

                <GymDetailMobileCTA
                    lowestPrice={lowestPrice}
                    leadAction={leadAction}
                    reducedEffects={reducedEffects}
                />
            </div>
        </>
    );
};

export default GymDetailPage;
