import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getOptimizedUrl, getSrcSet } from '../utils/image';
import { gymService } from '../services/gymService';
import type {
    GymBranch,
    GymCenter,
    GymGallery,
    GymPricing,
    GymProgram,
    GymProgramSession,
    GymTaxonomyTerm,
    GymTrainerLink,
    GymZone,
    GymAmenity,
    GymEquipment,
} from '../types';
import GymCard from '../components/GymCard';
import GymReviewForm from '../components/GymReviewForm';
import GymReviewList from '../components/GymReviewList';
import ShareButton from '../components/ShareButton';
import { Skeleton } from '../components/ui/Skeleton';



const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const TODAY_KEY = DAY_KEYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

const BILLING_LABELS: Record<string, string> = {
    per_day: '/ ngày',
    per_month: '/ tháng',
    per_quarter: '/ quý',
    per_year: '/ năm',
    per_session: '/ buổi',
};

const PROGRAM_TYPE_LABELS: Record<string, string> = {
    yoga: 'Yoga',
    pilates: 'Pilates',
    hiit: 'HIIT',
    cycling: 'Cycling',
    boxing: 'Boxing',
    dance: 'Dance',
    strength: 'Strength',
    meditation: 'Meditation',
    recovery: 'Recovery',
    mobility: 'Mobility',
    other: 'Class',
};

const BOOKING_MODE_LABELS: Record<string, string> = {
    walk_in: 'Walk-in',
    pre_booking: 'Đặt trước',
    member_only: 'Chỉ hội viên',
};

function useInView(threshold = 0.08): [React.RefObject<HTMLDivElement>, boolean] {
    const ref = useRef<HTMLDivElement>(null!);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setInView(true);
            },
            { threshold }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return [ref, inView];
}

function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const [ref, inView] = useInView();
    return (
        <div
            ref={ref}
            className={`transition-all duration-700 ${inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
        >
            {children}
        </div>
    );
}

function SectionHeading({
    kicker,
    title,
    description,
}: {
    kicker: string;
    title: string;
    description?: string;
}) {
    return (
        <div className="mb-6 space-y-2">
            <div className="marketplace-section-kicker">{kicker}</div>
            <h2 className="marketplace-section-title">{title}</h2>
            {description && <p className="marketplace-lead max-w-none text-[0.98rem]">{description}</p>}
        </div>
    );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 px-4 py-3 shadow-[0_10px_28px_rgba(53,41,26,0.04)]">
            <div className="text-[0.66rem] font-black uppercase tracking-[0.2em] text-[color:var(--mk-muted)]">{label}</div>
            <div className="mt-1 text-sm font-bold text-[color:var(--mk-text)]">{value}</div>
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

function getTrainerLinkPath(link: GymTrainerLink) {
    const trainer = link.trainer;
    if (!trainer) return null;
    if (trainer.user_type === 'athlete') {
        return trainer.profile_slug ? `/athlete/${trainer.profile_slug}` : `/athletes/${trainer.id}`;
    }
    return trainer.profile_slug ? `/coach/${trainer.profile_slug}` : `/coaches/${trainer.id}`;
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

function formatProgramSubtitle(program: GymProgram) {
    const bits = [PROGRAM_TYPE_LABELS[program.program_type] || program.program_type];
    if (program.level && program.level !== 'all') bits.push(program.level);
    bits.push(`${program.duration_minutes} phút`);
    bits.push(BOOKING_MODE_LABELS[program.booking_mode] || program.booking_mode);
    return bits.join(' · ');
}

function formatSessionDate(value: string) {
    return new Date(value).toLocaleString('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
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


    const branches = gym?.branches || [];
    const branchDetail = useMemo(() => {
        if (!branches.length) return null;
        return branches.find((branch) => branch.id === activeBranchId) || branches[0];
    }, [branches, activeBranchId]);
    const branchId = branchDetail?.id || null;
    const branchName = branchDetail?.branch_name || gym?.name || 'Venue branch';
    const branchStatusBadges = branchDetail?.branch_status_badges || [];
    const branchAmenities = branchDetail?.amenities || [];
    const branchEquipment = branchDetail?.equipment || [];
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

    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        visibleSections.forEach(({ id: sectionId }) => {
            const element = sectionRefs.current[sectionId];
            if (!element) return;

            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) setActiveSection(sectionId);
                },
                { rootMargin: '-28% 0px -58% 0px' }
            );

            observer.observe(element);
            observers.push(observer);
        });

        return () => observers.forEach((observer) => observer.disconnect());
    }, [visibleSections, branchDetail, similarGyms]);

    const setRef = useCallback((sectionId: string) => (node: HTMLElement | null) => {
        sectionRefs.current[sectionId] = node;
    }, []);

    const scrollToSection = useCallback((sectionId: string) => {
        sectionRefs.current[sectionId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

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
        // Prevent body scroll when lightbox is open
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [lightboxIdx, gallery.length]);

    if (loading) {
        return (
            <div className="marketplace-shell min-h-screen pb-20">
                <div className="marketplace-container pt-8">
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
                    <div className="text-[5rem] font-black leading-none tracking-[-0.08em] text-[color:var(--mk-accent)]/45">404</div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-[-0.05em] text-[color:var(--mk-text)]">Không tìm thấy venue này.</h1>
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
    const seoImage = heroImage?.image_url || gym.cover_image_url || gym.logo_url || '';

    const quickFacts = [
        {
            label: 'Venue type',
            value: venueLabel,
        },
        {
            label: 'Entry price',
            value: lowestPrice ? `${lowestPrice.toLocaleString('vi-VN')}₫${entryBillingCycle ? ` ${BILLING_LABELS[entryBillingCycle] || ''}` : ''}` : 'Liên hệ để nhận giá',
        },
        {
            label: 'Trust score',
            value: gym.trust_summary?.avg_rating ? `★ ${gym.trust_summary.avg_rating.toFixed(1)} · ${gym.trust_summary.review_count} reviews` : 'Đang hoàn thiện trust data',
        },
        {
            label: 'Best for',
            value: getTaxonomyLabels(gym, 'audience', 1)[0] || 'Người đang tìm venue phù hợp',
        },
    ];


    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="business.business" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content="GYMERVIET" />
                {seoImage && <meta property="og:image" content={seoImage} />}
                {seoImage && <meta property="og:image:width" content="1200" />}
                {seoImage && <meta property="og:image:height" content="800" />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
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
                    aria-label="Image gallery"
                >
                    <button
                        type="button"
                        onClick={() => setLightboxIdx(null)}
                        className="absolute right-5 top-5 text-3xl font-black text-white/75 transition motion-reduce:transition-none hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-full w-12 h-12 flex items-center justify-center"
                        aria-label="Close gallery"
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
                                className="absolute left-4 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-xl font-black text-white transition motion-reduce:transition-none hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-white/50"
                                aria-label="Previous image"
                            >
                                ‹
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setLightboxIdx((current) => current === null ? 0 : (current + 1) % gallery.length);
                                }}
                                className="absolute right-4 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-xl font-black text-white transition motion-reduce:transition-none hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-white/50"
                                aria-label="Next image"
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

            <div className="marketplace-shell min-h-screen pb-24">
                <div className="marketplace-container pt-6">
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
                            <div className="relative min-h-[24rem] overflow-hidden bg-[color:var(--mk-paper-strong)] lg:min-h-[36rem]">
                                {heroImage ? (
                                    <img
                                        src={getOptimizedUrl(heroImage.image_url, 1440) || heroImage.image_url}
                                        srcSet={getSrcSet(heroImage.image_url, [640, 1024, 1600])}
                                        sizes="(max-width: 1024px) 100vw, 60vw"
                                        alt={heroImage.alt_text || heroImage.caption || gym.name}
                                        className="h-full w-full object-cover"
                                        fetchPriority="high"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(230,203,154,0.45),transparent_36%),linear-gradient(155deg,rgba(255,255,255,0.55),rgba(222,214,201,0.95))]">
                                        <span className="text-[5rem] font-black leading-none tracking-[-0.08em] text-[color:var(--mk-text)]/20">
                                            {gym.name.slice(0, 2).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,20,16,0.82)] via-[rgba(26,20,16,0.14)] to-transparent" />

                                <div className="absolute left-5 right-5 top-5 flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="marketplace-badge marketplace-badge--accent">{venueLabel}</span>
                                        {gym.is_verified && <span className="marketplace-badge marketplace-badge--verified">Verified</span>}
                                        {branchStatusBadges.slice(0, 2).map((badge) => (
                                            <span key={badge} className="marketplace-badge marketplace-badge--neutral border-white/16 bg-white/12 text-white">
                                                {badge}
                                            </span>
                                        ))}
                                    </div>
                                    {branchDetail?.best_visit_time_summary && (
                                        <div className="rounded-lg border border-white/16 bg-white/10 px-4 py-2 text-[0.72rem] font-semibold text-white/84 backdrop-blur-sm">
                                            {branchDetail?.best_visit_time_summary}
                                        </div>
                                    )}
                                </div>

                                {gallery.length > 1 && (
                                    <div className="absolute inset-x-5 bottom-5 flex gap-2 overflow-x-auto pb-1">
                                        {gallery.slice(0, 6).map((item, index) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setLightboxIdx(index)}
                                                className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg border border-white/14 bg-black/20 transition hover:-translate-y-0.5 hover:border-white/35"
                                            >
                                                <img
                                                    src={getOptimizedUrl(item.image_url, 320) || item.image_url}
                                                    alt={item.alt_text || item.caption || gym.name}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                                <div className="absolute inset-0 bg-black/20" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col justify-between p-6 sm:p-8 lg:p-10">
                                <div className="space-y-5">
                                    <div className="marketplace-eyebrow">Marketplace detail</div>

                                    <div>
                                        <h1 className="text-[clamp(2.3rem,4vw,4.2rem)] font-black leading-[0.92] tracking-[-0.07em] text-[color:var(--mk-text)]">
                                            {gym.name}
                                        </h1>
                                        <p className="mt-4 text-[1.02rem] leading-8 text-[color:var(--mk-muted)]">
                                            {seoDescription}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {overviewBadges.map((label) => (
                                            <span key={label} className="marketplace-badge marketplace-badge--neutral">{label}</span>
                                        ))}
                                        {branchDetail?.neighborhood_label && (
                                            <span className="marketplace-badge marketplace-badge--neutral">{branchDetail?.neighborhood_label}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                    {quickFacts.map((fact) => (
                                        <SummaryPill key={fact.label} label={fact.label} value={fact.value} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="marketplace-container mt-6">
                    <div className="sticky top-0 z-30 rounded-lg border border-[color:var(--mk-line)] bg-[rgba(255,251,244,0.82)] px-3 py-2 backdrop-blur-xl">
                        <div className="flex items-center gap-2 overflow-x-auto">
                            {visibleSections.map((section) => (
                                <button
                                    key={section.id}
                                    type="button"
                                    onClick={() => scrollToSection(section.id)}
                                    className={`shrink-0 rounded-lg px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.16em] transition ${activeSection === section.id ? 'bg-[color:var(--mk-text)] text-white' : 'text-[color:var(--mk-text-soft)] hover:bg-white/70'}`}
                                >
                                    {section.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="marketplace-container mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.45fr)]">
                    <div className="space-y-6">
                        <FadeIn>
                            <section ref={setRef('overview')} id="overview" className="marketplace-panel p-6 sm:p-8">
                                <SectionHeading
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

                                    <div className="space-y-3">
                                        <SummaryPill label="Chi nhánh đang xem" value={branchDetail?.branch_name || 'Chưa chọn'} />
                                        <SummaryPill label="Khu vực" value={[branchDetail?.district, branchDetail?.city].filter(Boolean).join(', ') || 'Chưa cập nhật'} />
                                        <SummaryPill label="Không khí" value={getTaxonomyLabels(gym, 'atmosphere', 1)[0] || 'Tập trung vào trải nghiệm thực tế'} />
                                        <SummaryPill label="Phản hồi" value={gym.response_sla_text || leadAction.helper} />
                                    </div>
                                </div>
                            </section>
                        </FadeIn>

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
                            <FadeIn>
                                <section ref={setRef('similar')} id="similar" className="marketplace-panel p-6 sm:p-8">
                                    <SectionHeading
                                        kicker="Cơ sở tương tự"
                                        title="Nếu địa điểm này gần đúng yêu cầu, hãy xem thêm những lựa chọn liên quan"
                                        description="Những cơ sở tương tự được gợi ý theo loại hình, vùng giá và khu vực để bạn so sánh nhanh trước khi quyết định."
                                    />

                                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                                        {similarGyms.map((item) => (
                                            <GymCard key={item.id} gym={item} variant="compact" />
                                        ))}
                                    </div>
                                </section>
                            </FadeIn>
                        )}

                        {(branchMapEmbedUrl || hasCoordinates) && (
                            <FadeIn>
                                <section ref={setRef('map')} id="map" className="marketplace-panel p-6 sm:p-8">
                                    <SectionHeading
                                        kicker="Bản đồ định vị"
                                        title="Định vị chi nhánh và bối cảnh quanh phòng tập"
                                        description="Bản đồ giúp bạn trả lời ngay một câu hỏi thực tế: mình có tiện đường rẽ vào nơi này đều đặn trong tuần hay không."
                                    />

                                    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                                        <div className="space-y-4">
                                            <SummaryPill label="Địa chỉ" value={branchDetail?.address || 'Chưa cập nhật'} />
                                            <SummaryPill label="Gửi xe" value={branchDetail?.parking_summary || 'Chưa cập nhật chỗ gửi xe'} />
                                            <SummaryPill label="Check-in" value={branchDetail?.check_in_instructions || 'Tư vấn tại rail bên phải để được hướng dẫn nhanh'} />
                                        </div>

                                        {branchMapEmbedUrl ? (
                                            <div className="overflow-hidden rounded-lg border border-[color:var(--mk-line)] bg-[color:var(--mk-paper-strong)]">
                                                <iframe
                                                    src={branchMapEmbedUrl}
                                                    width="100%"
                                                    height="420"
                                                    style={{ border: 0 }}
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    title={`Bản đồ ${branchName}`}
                                                />
                                            </div>
                                        ) : (
                                            <div className="overflow-hidden rounded-lg border border-[color:var(--mk-line)] bg-[color:var(--mk-paper-strong)]">
                                                <iframe
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(branchLongitude) - 0.01},${Number(branchLatitude) - 0.01},${Number(branchLongitude) + 0.01},${Number(branchLatitude) + 0.01}&layer=mapnik&marker=${Number(branchLatitude)},${Number(branchLongitude)}`}
                                                    width="100%"
                                                    height="420"
                                                    style={{ border: 0 }}
                                                    loading="lazy"
                                                    title={`Bản đồ ${branchName}`}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </FadeIn>
                        )}
                    </div>

                    <aside className="marketplace-sticky-rail space-y-4" style={{ contain: 'layout paint' }}>
                        <div className="marketplace-panel p-5 sm:p-6">
                            <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Quyết định nhanh</div>
                            <div className="mt-3 text-sm font-semibold text-[color:var(--mk-text-soft)]">Chi nhánh đang xem</div>
                            <h3 className="mt-1 text-[1.55rem] font-black leading-[0.98] tracking-[-0.05em] text-[color:var(--mk-text)]">
                                {branchName}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-[color:var(--mk-muted)]">
                                {branchDetail?.branch_tagline || branchDetail?.description || gym.discovery_blurb || 'Chọn đúng chi nhánh trước khi đặt hẹn tư vấn để nhận thông tin chuẩn nhất về giá mở cửa, lịch và trải nghiệm thực tế tại đó.'}
                            </p>

                            <div className="mt-5 rounded-lg bg-[color:var(--mk-text)] px-5 py-5 text-white">
                                <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/55">Đầu tư ban đầu</div>
                                <div className="mt-2 text-[2.3rem] font-black leading-none tracking-[-0.07em]">
                                    {lowestPrice ? `${lowestPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                </div>
                                <div className="mt-2 text-sm text-white/72">
                                    {lowestPrice ? 'Chi phí tối thiểu tại chi nhánh đang xem' : 'Cơ sở này chưa công khai bảng giá hiện hành'}
                                </div>
                            </div>

                            <div className="mt-5 space-y-3">
                                {renderActionButton(
                                    leadAction,
                                    'block w-full rounded-lg bg-[color:var(--mk-accent)] px-4 py-4 text-center text-xs font-black uppercase tracking-[0.18em] text-[color:var(--mk-accent-ink)] transition hover:translate-y-[-1px]'
                                )}
                                <button
                                    type="button"
                                    onClick={() => scrollToSection(branchPrograms.length > 0 ? 'schedule' : 'pricing')}
                                    className="block w-full rounded-lg border border-[color:var(--mk-line)] bg-white/70 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[color:var(--mk-text)] transition hover:border-[color:var(--mk-accent)]/55"
                                >
                                    {branchPrograms.length > 0 ? 'Xem lịch lớp' : 'Xem bảng giá'}
                                </button>
                            </div>

                            <div className="mt-4 text-sm leading-6 text-[color:var(--mk-muted)]">{leadAction.helper}</div>
                        </div>

                        {branches.length > 1 && (
                            <div className="marketplace-panel p-5">
                                <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Chuyển chi nhánh</div>
                                <div className="mt-4 space-y-2">
                                    {branches.map((branch) => (
                                        <button
                                            key={branch.id}
                                            type="button"
                                            onClick={() => setActiveBranchId(branch.id)}
                                            className={`w-full rounded-lg border px-4 py-3 text-left transition ${branch.id === branchDetail?.id ? 'border-[color:var(--mk-accent)] bg-[color:var(--mk-accent-soft)]/55' : 'border-[color:var(--mk-line)] bg-white/70 hover:border-[color:var(--mk-accent)]/45'}`}
                                        >
                                            <div className="text-sm font-black tracking-[-0.03em] text-[color:var(--mk-text)]">{branch.branch_name}</div>
                                            <div className="mt-1 text-sm text-[color:var(--mk-muted)]">{[branch.district, branch.city].filter(Boolean).join(', ') || branch.address}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="marketplace-panel p-5">
                            <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Lưu ý tại điểm tập</div>
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

                        <div className="marketplace-panel p-5">
                            <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Liên hệ nhanh</div>
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

                        <div className="marketplace-panel p-5">
                            <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Chia sẻ cơ sở</div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <ShareButton
                                    url={canonicalUrl}
                                    title={seoTitle}
                                    text={seoDescription}
                                    label="Share Facebook"
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
                    <div className="rounded-lg border border-white/14 bg-[rgba(29,22,18,0.94)] px-4 py-3 text-white shadow-[color:var(--mk-shadow-soft)] backdrop-blur-xl">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <div className="text-[0.64rem] font-black uppercase tracking-[0.18em] text-white/48">Chí phí ước tính từ</div>
                                <div className="mt-1 text-lg font-black tracking-[-0.04em]">
                                    {lowestPrice ? `${lowestPrice.toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                </div>
                            </div>
                            {renderActionButton(
                                leadAction,
                                'rounded-lg bg-[color:var(--mk-accent)] px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--mk-accent-ink)]'
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default GymDetailPage;

const GymProgramsSection = React.memo(function GymProgramsSection({
    branchPrograms, gymId, branchId, setRef
}: {
    branchPrograms: GymProgram[], gymId: string, branchId?: string | null, setRef: (id: string) => (node: HTMLElement | null) => void
}) {
    const [activeProgramId, setActiveProgramId] = useState<string | null>(null);
    const [programSessions, setProgramSessions] = useState<GymProgramSession[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const activeProgram = branchPrograms.find((p) => p.id === activeProgramId) || branchPrograms[0] || null;

    useEffect(() => {
        if (!branchPrograms.length) {
            setActiveProgramId(null);
            return;
        }
        setActiveProgramId((current) => {
            if (current && branchPrograms.some((program) => program.id === current)) return current;
            return branchPrograms[0].id;
        });
    }, [branchPrograms]);

    useEffect(() => {
        if (!gymId || !branchId || !activeProgramId) {
            setProgramSessions([]);
            return;
        }
        let mounted = true;
        setSessionsLoading(true);

        gymService.getProgramSessions(gymId, branchId, activeProgramId)
            .then((response) => {
                if (!mounted) return;
                setProgramSessions(response.success ? (response.sessions || []) : []);
            })
            .catch(() => {
                if (mounted) setProgramSessions([]);
            })
            .finally(() => {
                if (mounted) setSessionsLoading(false);
            });

        return () => { mounted = false; };
    }, [activeProgramId, branchId, gymId]);

    if (branchPrograms.length === 0) return null;

    return (
        <FadeIn>
            <section ref={setRef('schedule')} id="schedule" className="marketplace-panel p-6 sm:p-8">
                <SectionHeading
                    kicker="Lịch tập"
                    title="Lịch lớp và nhịp hoạt động tại chi nhánh"
                    description="Một cơ sở tốt không chỉ hiển thị đẹp trên hình ảnh — lịch lớp phải đủ rõ để bạn hình dung ngay tuần đầu tiên tập luyện của mình sẽ trông như thế nào."
                />

                <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
                    <div className="space-y-3">
                        {branchPrograms.map((program) => (
                            <button
                                key={program.id}
                                type="button"
                                onClick={() => setActiveProgramId(program.id)}
                                className={`w-full rounded-lg border px-4 py-4 text-left transition ${activeProgram?.id === program.id ? 'border-[color:var(--mk-accent)] bg-[color:var(--mk-accent-soft)]/55' : 'border-[color:var(--mk-line)] bg-white/80 hover:border-[color:var(--mk-accent)]/45'}`}
                            >
                                <div className="text-sm font-black tracking-[-0.03em] text-[color:var(--mk-text)]">{program.title}</div>
                                <div className="mt-1 text-sm text-[color:var(--mk-muted)]">{formatProgramSubtitle(program)}</div>
                                {program.description && (
                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-[color:var(--mk-text-soft)]">{program.description}</p>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-lg border border-[color:var(--mk-line)] bg-white/78 p-5">
                        {activeProgram ? (
                            <>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Chương trình đã chọn</div>
                                        <h3 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[color:var(--mk-text)]">{activeProgram.title}</h3>
                                        <p className="mt-2 text-sm leading-7 text-[color:var(--mk-text-soft)]">{activeProgram.description || 'Chưa có mô tả chi tiết cho lớp này.'}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="marketplace-badge marketplace-badge--neutral">{activeProgram.capacity} chỗ</span>
                                        <span className="marketplace-badge marketplace-badge--neutral">{activeProgram.duration_minutes} phút</span>
                                    </div>
                                </div>

                                {(activeProgram.equipment_required || []).length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {(activeProgram.equipment_required || []).map((item) => (
                                            <span key={item} className="marketplace-badge marketplace-badge--neutral">{item}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-6">
                                    <div className="mb-3 text-[0.72rem] font-black uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Các buổi học sắp tới</div>
                                    {sessionsLoading ? (
                                        <div className="space-y-3">
                                            <Skeleton className="h-16 w-full rounded-lg" />
                                            <Skeleton className="h-16 w-full rounded-lg" />
                                        </div>
                                    ) : programSessions.length > 0 ? (
                                        <div className="space-y-3">
                                            {programSessions.slice(0, 6).map((session: GymProgramSession) => (
                                                <div key={session.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--mk-line)] bg-[color:var(--mk-paper)] px-4 py-3">
                                                    <div>
                                                        <div className="text-sm font-bold text-[color:var(--mk-text)]">{formatSessionDate(session.starts_at)}</div>
                                                        <div className="text-sm text-[color:var(--mk-muted)]">{session.session_note || 'Đang mở đăng ký'}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-[color:var(--mk-muted)]">Còn chỗ</div>
                                                        <div className="mt-1 text-sm font-black text-[color:var(--mk-text)]">{session.seats_remaining}/{session.seats_total}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-dashed border-[color:var(--mk-line)] px-4 py-5 text-sm text-[color:var(--mk-muted)]">
                                            Lịch chi tiết cho lớp này đang được cập nhật. Bạn vẫn có thể dùng CTA bên phải để nhận tư vấn nhanh từ chi nhánh.
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="rounded-lg border border-dashed border-[color:var(--mk-line)] px-4 py-5 text-sm text-[color:var(--mk-muted)]">
                                Chưa có chương trình lớp cho chi nhánh này.
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </FadeIn>
    );
});

const GymReviewsSection = React.memo(function GymReviewsSection({
    gymId, branchId, gymTrustSummary, setRef
}: {
    gymId: string, branchId: string | null, gymTrustSummary?: any, setRef: (id: string) => (node: HTMLElement | null) => void
}) {
    const [canReview, setCanReview] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        if (!gymId) return;
        gymService.checkReviewEligibility(gymId)
            .then((response) => setCanReview(Boolean(response.success && response.canReview)))
            .catch(() => setCanReview(false));
    }, [gymId]);

    return (
        <FadeIn>
            <section ref={setRef('reviews')} id="reviews" className="rounded-lg border border-black/10 bg-[linear-gradient(180deg,rgba(32,25,20,1),rgba(24,18,15,1))] p-6 text-white sm:p-8">
                <div className="mb-6 space-y-2">
                    <div className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white/60">Trust</div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Cộng đồng nói gì về nơi này</h2>
                    <p className="text-sm leading-relaxed text-white/70">Trust block này kết hợp review tổng, dimension ratings và phản hồi từ venue để bạn đỡ phải đoán mò trước khi thử buổi đầu tiên.</p>
                </div>

                <div className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                    {[
                        { label: 'Tổng quan', value: gymTrustSummary?.avg_rating ? `★ ${gymTrustSummary.avg_rating.toFixed(1)}` : '—' },
                        { label: 'Thiết bị', value: gymTrustSummary?.dimensions?.equipment_rating ? gymTrustSummary.dimensions.equipment_rating.toFixed(1) : '—' },
                        { label: 'Sạch sẽ', value: gymTrustSummary?.dimensions?.cleanliness_rating ? gymTrustSummary.dimensions.cleanliness_rating.toFixed(1) : '—' },
                        { label: 'Hướng dẫn', value: gymTrustSummary?.dimensions?.coaching_rating ? gymTrustSummary.dimensions.coaching_rating.toFixed(1) : '—' },
                        { label: 'Không gian', value: gymTrustSummary?.dimensions?.atmosphere_rating ? gymTrustSummary.dimensions.atmosphere_rating.toFixed(1) : '—' },
                        { label: 'Chi phí', value: gymTrustSummary?.dimensions?.value_rating ? gymTrustSummary.dimensions.value_rating.toFixed(1) : '—' },
                    ].map((item) => (
                        <div key={item.label} className="rounded-lg border border-white/10 bg-white/6 px-4 py-4">
                            <div className="text-[0.64rem] font-black uppercase tracking-[0.18em] text-white/55">{item.label}</div>
                            <div className="mt-2 text-lg font-black tracking-[-0.04em] text-white">{item.value}</div>
                        </div>
                    ))}
                </div>

                <GymReviewList gymId={gymId} refreshTick={refreshTick} />

                {branchId && canReview && (
                    <div className="mt-8 border-t border-white/10 pt-8">
                        <GymReviewForm gymId={gymId} branchId={branchId} onSuccess={() => setRefreshTick((current) => current + 1)} />
                    </div>
                )}

                {branchId && !canReview && (
                    <div className="mt-8 rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/68">
                        Bạn cần có gói tập hoặc từng tương tác tư vấn với cơ sở này để để lại một review hợp lệ trên marketplace.
                    </div>
                )}
            </section>
        </FadeIn>
    );
});

const GymZonesSection = React.memo(function GymZonesSection({ branchZones, setRef }: { branchZones: GymZone[], setRef: (id: string) => (node: HTMLElement | null) => void }) {
    if (branchZones.length === 0) return null;
    return (
        <FadeIn>
            <section ref={setRef('zones')} id="zones" className="marketplace-panel p-6 sm:p-8">
                <SectionHeading
                    kicker="Khu vực nổi bật"
                    title="Những không gian quyết định cảm giác tập"
                    description="Không chỉ là danh sách máy móc — đây là các khu vực giúp bạn đánh giá ngay cơ sở này hợp thói quen tập của mình đến đâu."
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {branchZones.map((zone: GymZone) => (
                        <article key={zone.id} className={`rounded-lg border p-5 ${zone.is_signature_zone ? 'border-[color:var(--mk-accent)]/55 bg-[color:var(--mk-accent-soft)]/55' : 'border-[color:var(--mk-line)] bg-white/75'}`}>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-[0.68rem] font-black uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">{zone.zone_type.replace(/_/g, ' ')}</div>
                                    <h3 className="mt-2 text-lg font-black tracking-[-0.04em] text-[color:var(--mk-text)]">{zone.name}</h3>
                                </div>
                                {zone.is_signature_zone && <span className="marketplace-badge marketplace-badge--accent">Signature</span>}
                            </div>

                            {zone.description && (
                                <p className="mt-3 text-sm leading-7 text-[color:var(--mk-text-soft)]">{zone.description}</p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                                {zone.capacity && <span className="marketplace-badge marketplace-badge--neutral">{zone.capacity} người</span>}
                                {zone.area_sqm && <span className="marketplace-badge marketplace-badge--neutral">{zone.area_sqm} m²</span>}
                                {zone.temperature_mode && <span className="marketplace-badge marketplace-badge--neutral">{zone.temperature_mode}</span>}
                                {zone.sound_profile && <span className="marketplace-badge marketplace-badge--neutral">{zone.sound_profile}</span>}
                                {zone.booking_required && <span className="marketplace-badge marketplace-badge--neutral">Đặt trước</span>}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </FadeIn>
    );
});

const GymFacilitiesSection = React.memo(function GymFacilitiesSection({
    branchAmenities, branchEquipment, branchEquipmentGroups, setRef
}: {
    branchAmenities: GymAmenity[], 
    branchEquipment: GymEquipment[], 
    branchEquipmentGroups: Record<string, GymEquipment[]>, 
    setRef: (id: string) => (node: HTMLElement | null) => void
}) {
    if (branchAmenities.length === 0 && branchEquipment.length === 0) return null;
    return (
        <FadeIn>
            <section ref={setRef('facilities')} id="facilities" className="marketplace-panel p-6 sm:p-8">
                <SectionHeading
                    kicker="Tiện ích"
                    title="Tiện ích và thiết bị hỗ trợ quyết định"
                    description="Những chi tiết nhỏ như tủ để đồ, phòng tắm, dịch vụ khăn hay chất lượng trang thiết bị thường là thứ quyết định bạn có duy trì thói quen tạp luyện hay không."
                />

                <div className="space-y-8">
                    {branchAmenities.length > 0 && (
                        <div>
                            <div className="mb-3 text-[0.72rem] font-black uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Danh sách tiện ích</div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {branchAmenities.map((item) => (
                                    <div key={item.id} className={`rounded-lg border px-4 py-4 ${item.is_available ? 'border-[color:var(--mk-line)] bg-white/80' : 'border-[color:var(--mk-line)]/70 bg-[color:var(--mk-paper-strong)]/60 opacity-70'}`}>
                                        <div className="text-sm font-bold text-[color:var(--mk-text)]">{item.name}</div>
                                        {item.note && <p className="mt-2 text-sm leading-6 text-[color:var(--mk-muted)]">{item.note}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {branchEquipment.length > 0 && (
                        <details className="mt-6 rounded-lg border border-[color:var(--mk-line)] bg-white/70 group">
                            <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-4 text-sm font-black uppercase tracking-[0.1em] text-[color:var(--mk-text)] transition hover:bg-white/90">
                                Thư viện thiết bị ({Object.values(branchEquipmentGroups).flat().length} items)
                                <span className="text-xl transition-transform group-open:rotate-180">↓</span>
                            </summary>
                            <div className="border-t border-[color:var(--mk-line)] p-5">
                                <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
                                    {Object.entries(branchEquipmentGroups).map(([category, items]) => (
                                        <div key={category} className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 p-4">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div className="text-sm font-black tracking-[-0.03em] text-[color:var(--mk-text)]">{category}</div>
                                                <span className="marketplace-badge marketplace-badge--neutral">{items.length} items</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((item) => (
                                                    <span key={item.id} className="rounded-lg border border-[color:var(--mk-line)] bg-[color:var(--mk-paper)] px-3 py-1.5 text-[0.8rem] font-semibold text-[color:var(--mk-text)]">
                                                        {item.name}{item.quantity && item.quantity > 1 ? ` ×${item.quantity}` : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </details>
                    )}
                </div>
            </section>
        </FadeIn>
    );
});

const GymTrainersSection = React.memo(function GymTrainersSection({ branchTrainerLinks, setRef }: { branchTrainerLinks: GymTrainerLink[], setRef: (id: string) => (node: HTMLElement | null) => void }) {
    if (branchTrainerLinks.length === 0) return null;
    return (
        <FadeIn>
            <section ref={setRef('trainers')} id="trainers" className="marketplace-panel p-6 sm:p-8">
                <SectionHeading
                    kicker="Chuyên gia"
                    title="Ai đang dẫn dắt trải nghiệm tại chi nhánh này"
                    description="Không chỉ là danh sách Huấn luyện viên — hãy nhìn chuyên môn, ngôn ngữ và nền tảng của họ để đánh giá độ phù hợp với cá nhân bạn."
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {branchTrainerLinks.map((link) => {
                        const trainerPath = getTrainerLinkPath(link);
                        const cardClass = 'group rounded-lg border border-[color:var(--mk-line)] bg-white/80 p-5 transition hover:-translate-y-1 hover:shadow-[color:var(--mk-shadow-soft)]';
                        const cardContent = (
                            <>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 overflow-hidden rounded-full border border-[color:var(--mk-line)] bg-[color:var(--mk-paper-strong)]">
                                        {link.trainer?.avatar_url ? (
                                            <img src={link.trainer.avatar_url} alt={link.trainer.full_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm font-black uppercase text-[color:var(--mk-muted)]">
                                                {(link.trainer?.full_name || 'T').slice(0, 1)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="text-base font-black tracking-[-0.03em] text-[color:var(--mk-text)]">
                                            {link.trainer?.full_name || 'Đối tác huấn luyện'}
                                        </div>
                                        <div className="mt-1 text-sm text-[color:var(--mk-muted)]">
                                            {link.specialization_summary || link.role_at_gym || 'Huấn luyện viên tại cơ sở này'}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {link.featured_at_branch && <span className="marketplace-badge marketplace-badge--accent">Huấn luyện viên nổi bật</span>}
                                    {link.accepts_private_clients && <span className="marketplace-badge marketplace-badge--neutral">Có nhận học viên riêng</span>}
                                    {(link.languages || []).slice(0, 2).map((language) => (
                                        <span key={language} className="marketplace-badge marketplace-badge--neutral">{language}</span>
                                    ))}
                                </div>

                                {link.branch_intro && (
                                    <p className="mt-4 text-sm leading-7 text-[color:var(--mk-text-soft)]">{link.branch_intro}</p>
                                )}
                            </>
                        );

                        return trainerPath ? (
                            <Link key={link.id} to={trainerPath} className={cardClass}>
                                {cardContent}
                            </Link>
                        ) : (
                            <div key={link.id} className={cardClass}>
                                {cardContent}
                            </div>
                        );
                    })}
                </div>
            </section>
        </FadeIn>
    );
});

const GymPricingSection = React.memo(function GymPricingSection({ branchPricing, setRef, leadAction }: { branchPricing: GymPricing[], setRef: (id: string) => (node: HTMLElement | null) => void, leadAction: any }) {
    if (branchPricing.length === 0) return null;
    return (
        <FadeIn>
            <section ref={setRef('pricing')} id="pricing" className="marketplace-panel p-6 sm:p-8">
                <SectionHeading
                    kicker="Bảng giá"
                    title="Các gói vào cửa và cách bắt đầu"
                    description="Đừng chỉ nhìn gói nổi bật. Hãy nhìn gói khởi điểm, các dịch vụ đi kèm và chính sách để biết chi phí thực sự của việc tập luyện."
                />

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {branchPricing.map((plan: GymPricing) => (
                        <article
                            key={plan.id}
                            className={`flex h-full flex-col rounded-lg border p-5 ${plan.is_highlighted ? 'border-[color:var(--mk-accent)] bg-[color:var(--mk-accent-soft)]/55' : 'border-[color:var(--mk-line)] bg-white/80'}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-[0.68rem] font-black uppercase tracking-[0.2em] text-[color:var(--mk-muted)]">
                                        {plan.plan_type || 'membership'}
                                    </div>
                                    <h3 className="mt-2 text-xl font-black tracking-[-0.05em] text-[color:var(--mk-text)]">{plan.plan_name}</h3>
                                </div>
                                {plan.is_highlighted && <span className="marketplace-badge marketplace-badge--accent">Recommended</span>}
                            </div>

                            <div className="mt-5 flex items-end gap-2">
                                <div className="text-[2rem] font-black leading-none tracking-[-0.06em] text-[color:var(--mk-text)]">
                                    {Number(plan.price).toLocaleString('vi-VN')}₫
                                </div>
                                <div className="pb-1 text-sm font-semibold text-[color:var(--mk-muted)]">
                                    {BILLING_LABELS[plan.billing_cycle] || plan.billing_cycle}
                                </div>
                            </div>

                            {plan.description && (
                                <p className="mt-4 text-sm leading-7 text-[color:var(--mk-text-soft)]">{plan.description}</p>
                            )}

                            {(plan.included_services || []).length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2">
                                    {(plan.included_services || []).slice(0, 4).map((item) => (
                                        <span key={item} className="marketplace-badge marketplace-badge--neutral">{item}</span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-5 space-y-2 text-sm text-[color:var(--mk-text-soft)]">
                                {plan.highlighted_reason && <div>• {plan.highlighted_reason}</div>}
                                {plan.trial_available && <div>• Có trial {plan.trial_price ? `${Number(plan.trial_price).toLocaleString('vi-VN')}₫` : ''}</div>}
                                {plan.freeze_policy_summary && <div>• Freeze: {plan.freeze_policy_summary}</div>}
                                {plan.cancellation_policy_summary && <div>• Cancel: {plan.cancellation_policy_summary}</div>}
                            </div>

                            <div className="mt-auto pt-6">
                                {renderActionButton(
                                    leadAction,
                                    'block w-full rounded-lg bg-[color:var(--mk-text)] px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-white transition hover:translate-y-[-1px] hover:bg-[color:var(--mk-accent-ink)]'
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </FadeIn>
    );
});
