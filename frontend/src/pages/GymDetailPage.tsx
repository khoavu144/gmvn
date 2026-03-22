import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { getOptimizedUrl, getSrcSet } from '../utils/image';
import { gymService } from '../services/gymService';
import type {
    GymBranch,
    GymCenter,
    GymGallery,
    GymTaxonomyTerm,
} from '../types';
import ShareButton from '../components/ShareButton';
import { Skeleton } from '../components/ui/Skeleton';
import GymProgramsSection from '../components/gym-detail/GymProgramsSection';
import GymReviewsSection from '../components/gym-detail/GymReviewsSection';
import GymZonesSection from '../components/gym-detail/GymZonesSection';
import GymFacilitiesSection from '../components/gym-detail/GymFacilitiesSection';
import GymTrainersSection from '../components/gym-detail/GymTrainersSection';
import GymPricingSection from '../components/gym-detail/GymPricingSection';
import GymSimilarSection from '../components/gym-detail/GymSimilarSection';
import GymMapSection from '../components/gym-detail/GymMapSection';
import { GymSectionHeading } from '../components/gym-detail/GymSectionHeading';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { useMobileReducedEffects } from '../hooks/useMobileReducedEffects';

function truncateMetaDescription(text: string, maxLen: number): string {
    const t = text.trim();
    if (t.length <= maxLen) return t;
    const slice = t.slice(0, maxLen);
    const lastSpace = slice.lastIndexOf(' ');
    const head = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
    return `${head.trimEnd()}…`;
}

const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const TODAY_KEY = DAY_KEYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

const BILLING_LABELS: Record<string, string> = {
    per_day: '/ ngày',
    per_month: '/ tháng',
    per_quarter: '/ quý',
    per_year: '/ năm',
    per_session: '/ buổi',
};
function SummaryPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 px-4 py-3 shadow-[0_10px_28px_rgba(53,41,26,0.04)]">
            <div className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[color:var(--mk-muted)]">{label}</div>
            <div className="mt-1 text-sm font-bold text-[color:var(--mk-text)]">{value}</div>
        </div>
    );
}

function OverviewMetaRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-row items-baseline justify-between gap-3 border-b border-[color:var(--mk-line)] py-2 last:border-b-0">
            <span className="shrink-0 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">{label}</span>
            <span className="min-w-0 truncate text-right text-sm font-semibold text-[color:var(--mk-text)]">{value}</span>
        </div>
    );
}

function getTaxonomyLabels(gym: GymCenter | null, type: GymTaxonomyTerm['term_type'], limit = 3) {
    if (!gym?.taxonomy_terms) return [];
    const values = gym.taxonomy_terms
        .map((item) => item.term)
        .filter((term): term is GymTaxonomyTerm => term != null && term.term_type === type)
        .map((term) => term.label);

    return Array.from(new Set(values)).slice(0, limit);
}

function getPrimaryVenueLabel(gym: GymCenter | null) {
    const primary = gym?.taxonomy_terms?.find((item) => item.is_primary && item.term)?.term;
    return primary?.label || gym?.primary_venue_type_slug || 'Active Space';
}

function getFallbackGallery(gym: GymCenter | null, branchId?: string | null): GymGallery[] {
    const imageUrl = gym?.listing_thumbnail?.image_url || gym?.cover_image_url || gym?.logo_url;
    if (!imageUrl || !gym) return [];

    return [
        {
            id: 'gym-cover-fallback',
            branch_id: branchId || 'fallback',
            image_url: imageUrl,
            caption: gym.name,
            image_type: 'other',
            order_number: 0,
            media_role: 'hero',
            is_hero: true,
        },
    ];
}

function normalizePhone(raw?: string | null) {
    return (raw || '').replace(/[^\d+]/g, '');
}

function buildWhatsappUrl(phone?: string | null, message?: string | null) {
    const normalized = normalizePhone(phone).replace(/^0/, '84');
    if (!normalized) return null;
    const text = message ? `?text=${encodeURIComponent(message)}` : '';
    return `https://wa.me/${normalized}${text}`;
}

function getTodayHours(branch: GymBranch | null) {
    return branch?.opening_hours?.[TODAY_KEY] as { open?: string; close?: string; is_closed?: boolean } | undefined;
}



function resolveLeadRoute(gym: GymCenter | null, branch: GymBranch | null) {
    const routes = branch?.lead_routes || [];
    const preferred = routes.find((route) => route.inquiry_type === gym?.default_primary_cta)
        || routes.find((route) => route.inquiry_type === 'consultation')
        || routes[0]
        || null;

    if (!preferred && !branch) {
        return {
            href: '/messages',
            label: 'Nhắn tư vấn',
            isExternal: false,
            helper: 'Tư vấn phù hợp mục tiêu và khu vực',
        };
    }

    const phone = preferred?.phone || branch?.consultation_phone || branch?.phone || null;
    const whatsapp = preferred?.whatsapp || branch?.whatsapp_number || null;
    const messengerUrl = preferred?.messenger_url || branch?.messenger_url || null;
    const email = preferred?.email || branch?.email || null;
    const message = preferred?.auto_prefill_message || `Xin chào, tôi muốn nhận tư vấn về ${branch?.branch_name || gym?.name || 'venue'} trên Gymerviet.`;

    if ((preferred?.primary_channel === 'whatsapp' || !preferred?.primary_channel) && whatsapp) {
        return {
            href: buildWhatsappUrl(whatsapp, message) || '/messages',
            label: 'Nhắn WhatsApp',
            isExternal: true,
            helper: 'Trao đổi trực tiếp với chi nhánh',
        };
    }

    if (preferred?.primary_channel === 'phone' && phone) {
        return {
            href: `tel:${normalizePhone(phone)}`,
            label: 'Gọi tư vấn',
            isExternal: true,
            helper: 'Gọi trực tiếp cho chi nhánh',
        };
    }

    if (preferred?.primary_channel === 'messenger' && messengerUrl) {
        return {
            href: messengerUrl,
            label: 'Mở Messenger',
            isExternal: true,
            helper: 'Chat nhanh với venue',
        };
    }

    if (preferred?.primary_channel === 'email' && email) {
        return {
            href: `mailto:${email}`,
            label: 'Gửi email',
            isExternal: true,
            helper: 'Nhận báo giá qua email',
        };
    }

    if (phone) {
        return {
            href: `tel:${normalizePhone(phone)}`,
            label: 'Gọi tư vấn',
            isExternal: true,
            helper: 'Tư vấn đúng chi nhánh đang chọn',
        };
    }

    if (messengerUrl) {
        return {
            href: messengerUrl,
            label: 'Nhắn Messenger',
            isExternal: true,
            helper: 'Hỏi nhanh về lịch và giá',
        };
    }

    return {
        href: '/messages',
        label: 'Nhắn tư vấn',
        isExternal: false,
        helper: 'Tư vấn phù hợp mục tiêu tập luyện',
    };
}

function renderActionButton(action: { href: string; label: string; isExternal: boolean }, className: string) {
    if (action.isExternal) {
        return (
            <a href={action.href} target={action.href.startsWith('http') ? '_blank' : undefined} rel={action.href.startsWith('http') ? 'noopener noreferrer' : undefined} className={className}>
                {action.label}
            </a>
        );
    }

    return <Link to={action.href} className={className}>{action.label}</Link>;
}



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

    const activeImage = lightboxIdx !== null ? gallery[lightboxIdx] : null;
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

    useBodyScrollLock('gym-detail-lightbox', lightboxIdx !== null);

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
                    <Link to="/gyms" className="marketplace-chip is-active">Quay lại marketplace</Link>
                </div>
            </div>
        );
    }

    const venueLabel = getPrimaryVenueLabel(gym);
    const leadAction = resolveLeadRoute(gym, branchDetail);
    const canonicalUrl = `https://gymerviet.com/gyms/${gym.slug || gym.id}`;
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

            {activeImage && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(16,12,10,0.96)] p-4" 
                    onClick={() => setLightboxIdx(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Thư viện ảnh"
                >
                    <button
                        type="button"
                        onClick={() => setLightboxIdx(null)}
                        className="absolute right-5 top-5 text-3xl font-bold text-white/75 transition motion-reduce:transition-none hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full w-12 h-12 flex items-center justify-center"
                        aria-label="Đóng thư viện ảnh"
                    >
                        ×
                    </button>
                    {gallery.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setLightboxIdx((current) => current === null ? 0 : (current - 1 + gallery.length) % gallery.length);
                                }}
                                className="absolute left-4 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-xl font-bold text-white transition motion-reduce:transition-none hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-white/50"
                                aria-label="Ảnh trước"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setLightboxIdx((current) => current === null ? 0 : (current + 1) % gallery.length);
                                }}
                                className="absolute right-4 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-xl font-bold text-white transition motion-reduce:transition-none hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-white/50"
                                aria-label="Ảnh sau"
                            >
                                ›
                            </button>
                        </>
                    )}
                    <img
                        src={activeImage.image_url}
                        alt={activeImage.alt_text || activeImage.caption || gym.name}
                        className="max-h-[88vh] max-w-full object-contain transition-transform motion-reduce:transition-none"
                        onClick={(event) => event.stopPropagation()}
                    />
                </div>
            )}

            <div className="marketplace-shell gym-detail-page min-h-screen">
                <div className="marketplace-container gv-pad-y-sm">
                    <div className="mb-5 flex items-center justify-between gap-4">
                        <Link to="/gyms" className="back-link">← Quay lại marketplace</Link>
                        <div className="hidden items-center gap-2 md:flex">
                            {branchStatusBadges.slice(0, 3).map((badge) => (
                                <span key={badge} className="marketplace-badge marketplace-badge--neutral">{badge}</span>
                            ))}
                        </div>
                    </div>

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
                                                onClick={() => setLightboxIdx(safeSlideIndex)}
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
                                                        onClick={() => setHeroSlideIndex(index)}
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
                </div>

                <div className="marketplace-container mt-4 md:mt-6">
                    <div
                        className={`gym-detail-subnav rounded-lg border border-[color:var(--mk-line)] px-3 py-2 ${reducedEffects ? 'bg-[rgba(255,251,244,0.96)]' : 'bg-[rgba(255,251,244,0.82)] backdrop-blur-xl'}`}
                    >
                        <div className="flex items-center gap-2 overflow-x-auto">
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
                    </div>
                </div>

                <div className="marketplace-container mt-4 md:mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.45fr)]">
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
                                                <span className="shrink-0 text-[0.66rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Website</span>
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

                    <aside className="gym-detail-sticky-rail space-y-4" style={{ contain: 'layout paint' }}>
                        <div className="marketplace-panel gv-panel-pad-sm">
                            <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Quyết định nhanh</div>
                            <div className="mt-3 text-sm font-semibold text-[color:var(--mk-text-soft)]">Chi nhánh đang xem</div>
                            <h3 className="mt-1 text-[1.55rem] font-bold leading-[0.98] tracking-[-0.05em] text-[color:var(--mk-text)]">
                                {branchName}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-[color:var(--mk-muted)]">
                                {branchDetail?.branch_tagline || branchDetail?.description || gym.discovery_blurb || 'Chọn đúng chi nhánh trước khi đặt hẹn tư vấn để nhận thông tin chuẩn nhất về giá mở cửa, lịch và trải nghiệm thực tế tại đó.'}
                            </p>

                            <div className="mt-5 rounded-lg bg-[color:var(--mk-text)] px-5 py-5 text-white">
                                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-white/55">Đầu tư ban đầu</div>
                                <div className="mt-2 text-[2.3rem] font-bold leading-none tracking-[-0.07em]">
                                    {lowestPrice ? `${lowestPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                </div>
                                <div className="mt-2 text-sm text-white/72">
                                    {lowestPrice ? 'Chi phí tối thiểu tại chi nhánh đang xem' : 'Cơ sở này chưa công khai bảng giá hiện hành'}
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {renderActionButton(
                                    leadAction,
                                    'block w-full rounded-lg bg-[color:var(--mk-accent)] px-4 py-4 text-center text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--mk-accent-ink)] transition hover:translate-y-[-1px]'
                                )}
                                <button
                                    type="button"
                                    onClick={() => navigateToSection(branchPrograms.length > 0 ? 'schedule' : 'pricing')}
                                    className="block w-full rounded-lg border border-[color:var(--mk-line)] bg-white/70 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/55"
                                >
                                    {branchPrograms.length > 0 ? 'Xem lịch lớp' : 'Xem bảng giá'}
                                </button>
                            </div>

                            <div className="mt-4 text-sm leading-6 text-[color:var(--mk-muted)]">{leadAction.helper}</div>
                        </div>

                        {branches.length > 1 && (
                            <div className="marketplace-panel gv-panel-pad-sm">
                                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Chuyển chi nhánh</div>
                                <div className="mt-4 space-y-2">
                                    {branches.map((branch) => (
                                        <button
                                            key={branch.id}
                                            type="button"
                                            onClick={() => setActiveBranchId(branch.id)}
                                            className={`w-full rounded-lg border px-4 py-3 text-left transition ${branch.id === branchDetail?.id ? 'border-[color:var(--mk-accent)] bg-[color:var(--mk-accent-soft)]/55' : 'border-[color:var(--mk-line)] bg-white/70 hover:border-[color:var(--mk-accent)]/45'}`}
                                        >
                                            <div className="text-sm font-bold tracking-[-0.03em] text-[color:var(--mk-text)]">{branch.branch_name}</div>
                                            <div className="mt-1 text-sm text-[color:var(--mk-muted)]">{[branch.district, branch.city].filter(Boolean).join(', ') || branch.address}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {similarGyms.length > 0 && (
                            <div className="marketplace-panel gv-panel-pad-sm">
                                <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Venue tương tự</div>
                                <p className="mt-1 text-sm leading-6 text-[color:var(--mk-muted)]">
                                    Gợi ý theo loại hình và khu vực — cuộn để xem thêm.
                                </p>
                                <GymSimilarSection similarGyms={similarGyms} />
                            </div>
                        )}

                        <div className="marketplace-panel gv-panel-pad-sm">
                            <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Lưu ý tại điểm tập</div>
                            <div className="mt-4 space-y-3">
                                <SummaryPill
                                    label="Hôm nay"
                                    value={todayHours ? (todayHours.is_closed ? 'Đóng cửa' : `${todayHours.open || '—'} → ${todayHours.close || '—'}`) : 'Chưa cập nhật lịch'}
                                />
                                <SummaryPill label="Mật độ" value={branchDetail?.crowd_level_summary || 'Chưa cập nhật mật độ'} />
                                <SummaryPill label="Khung giờ tốt nhất" value={branchDetail?.best_visit_time_summary || 'Gắn thẻ cơ sở để nhắc chọn giờ trải nghiệm'} />
                                <SummaryPill label="Lưu ý đối tượng" value={branchDetail?.women_only_summary || branchDetail?.child_friendly_summary || 'Chưa có ghi chú riêng biệt'} />
                            </div>
                        </div>

                        <div className="marketplace-panel gv-panel-pad-sm">
                            <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Liên hệ nhanh</div>
                            <div className="mt-4 grid gap-2">
                                {branchPhone && (
                                    <a href={`tel:${normalizePhone(branchPhone)}`} className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 px-4 py-3 text-sm font-bold text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/45">
                                        Hotline · {branchPhone}
                                    </a>
                                )}
                                {branchWhatsapp && (
                                    <a href={buildWhatsappUrl(branchWhatsapp, `Xin chào, tôi muốn hỏi thêm về ${branchName}.`) || '#'} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 px-4 py-3 text-sm font-bold text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/45">
                                        WhatsApp · {branchWhatsapp}
                                    </a>
                                )}
                                {branchEmail && (
                                    <a href={`mailto:${branchEmail}`} className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 px-4 py-3 text-sm font-bold text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/45">
                                        Email · {branchEmail}
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="marketplace-panel gv-panel-pad-sm">
                            <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Chia sẻ cơ sở</div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <ShareButton
                                    url={canonicalUrl}
                                    title={seoTitle}
                                    text={seoDescription}
                                    label="Chia sẻ Facebook"
                                    variant="facebook"
                                    className="!rounded-lg !border-[color:var(--mk-line)] !bg-white/75 !px-4 !py-3 !text-sm !font-bold !text-[color:var(--mk-text)]"
                                    titleAttr="Chia sẻ venue này lên Facebook"
                                />
                                <ShareButton
                                    url={canonicalUrl}
                                    title={seoTitle}
                                    text={seoDescription}
                                    label="Sao chép Link"
                                    className="!rounded-lg !border-[color:var(--mk-line)] !bg-white/75 !px-4 !py-3 !text-sm !font-bold !text-[color:var(--mk-text)]"
                                    titleAttr="Sao chép liên kết cơ sở"
                                />
                            </div>
                        </div>
                    </aside>
                </div>

                <div className="fixed inset-x-4 bottom-4 z-40 lg:hidden" style={{ contain: 'layout paint' }}>
                    <div
                        className={`rounded-lg border border-white/14 px-4 py-3 text-white shadow-[color:var(--mk-shadow-soft)] ${reducedEffects ? 'bg-[rgba(29,22,18,0.98)]' : 'bg-[rgba(29,22,18,0.94)] backdrop-blur-xl'}`}
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/48">Chi phí ước tính từ</div>
                                <div className="mt-1 text-lg font-bold tracking-[-0.04em]">
                                    {lowestPrice ? `${lowestPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                </div>
                            </div>
                            {renderActionButton(
                                leadAction,
                                'rounded-lg bg-[color:var(--mk-accent)] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[color:var(--mk-accent-ink)]'
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GymDetailPage;
