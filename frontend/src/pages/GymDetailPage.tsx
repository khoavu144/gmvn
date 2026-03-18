/**
 * GymDetailPage.tsx — wpresidence-inspired property detail layout
 *
 * Structure (top→bottom):
 *   1. Masonry hero gallery (fullwidth, no header overlap)
 *   2. Sticky top nav (section jump links, like ProfileCV)
 *   3. 2-col grid: [left content 2/3] + [right sticky sidebar 1/3]
 *      Left:  About + stats | Amenities | Equipment | Trainers | Reviews
 *      Right: Price from | Branch dropdown | Hours today | CTA | Share
 *   4. Map section (iframe → Leaflet fallback)
 *   5. Lightbox overlay
 *
 * Design: minimalism, flat, no icons — consistent with app global UI
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getSrcSet, getOptimizedUrl } from '../utils/image';
import type { GymTrainerLink } from '../types';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { gymService } from '../services/gymService';
import type { GymCenter, GymBranch, GymGallery, GymEquipment } from '../types';
import GymReviewForm from '../components/GymReviewForm';
import GymReviewList from '../components/GymReviewList';
import ShareButton from '../components/ShareButton';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DAY_VI: Record<string, string> = {
    mon: 'Thứ 2', tue: 'Thứ 3', wed: 'Thứ 4',
    thu: 'Thứ 5', fri: 'Thứ 6', sat: 'Thứ 7', sun: 'CN',
};
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const TODAY_KEY = DAY_KEYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

const BILLING_VI: Record<string, string> = {
    per_day: '/ ngày', per_month: '/ tháng',
    per_quarter: '/ quý', per_year: '/ năm', per_session: '/ buổi',
};

const EQUIP_CATEGORY_VI: Record<string, string> = {
    cardio: 'Cardio', strength: 'Sức mạnh', free_weights: 'Tạ tự do',
    functional: 'Functional', studio: 'Studio', other: 'Khác',
};

function useInView(threshold = 0.1): [React.RefObject<HTMLDivElement>, boolean] {
    const ref = useRef<HTMLDivElement>(null!);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) setInView(true); },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

function FadeIn({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const [ref, inView] = useInView(0.07);
    return (
        <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'} ${className}`}>
            {children}
        </div>
    );
}

// ── Nav sections ──────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
    { id: 'about', label: 'Tổng quan' },
    { id: 'amenities', label: 'Tiện ích' },
    { id: 'equipment', label: 'Thiết bị' },
    { id: 'trainers', label: 'HLV' },
    { id: 'pricing', label: 'Bảng giá' },
    { id: 'reviews', label: 'Đánh giá' },
    { id: 'map', label: 'Bản đồ' },
];

// ── Main Component ─────────────────────────────────────────────────────────────
const GymDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [gym, setGym] = useState<GymCenter | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
    const [branchDetail, setBranchDetail] = useState<GymBranch | null>(null);
    const [gymTrainers, setGymTrainers] = useState<GymTrainerLink[]>([]);
    const [canReview, setCanReview] = useState(false);
    const [lightboxImg, setLightboxImg] = useState<GymGallery | null>(null);
    const [lightboxIdx, setLightboxIdx] = useState(0);
    const [activeSection, setActiveSection] = useState('about');
    const [refreshTick, setRefreshTick] = useState(0);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    // Fetch gym (UUID or slug — backend handles both)
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                setLoading(true);
                const res = await gymService.getGymCenterById(id);
                if (res.success && res.gym) {
                    setGym(res.gym);
                    // SEO: redirect UUID to slug if available
                    if (res.canonical_slug && res.canonical_slug !== id) {
                        navigate(`/gyms/${res.canonical_slug}`, { replace: true });
                    }
                    if (res.gym.branches?.length > 0) {
                        setActiveBranchId(res.gym.branches[0].id);
                    }
                    // fetch trainers
                    try {
                        const tRes = await gymService.getGymTrainers(res.gym.id);
                        if (tRes.success) setGymTrainers(tRes.trainers || []);
                    } catch { /* trainers optional */ }
                }
            } catch { /* handled via !gym below */ }
            finally { setLoading(false); }
        })();
    }, [id]);

    // Fetch branch detail when branch changes
    useEffect(() => {
        if (!gym || !activeBranchId) return;
        (async () => {
            try {
                const res = await gymService.getBranchDetail(gym.id, activeBranchId);
                if (res.success && res.branch) setBranchDetail(res.branch);
            } catch { /* handled */ }
        })();
    }, [gym, activeBranchId]);

    // Review eligibility
    useEffect(() => {
        if (!gym) return;
        gymService.checkReviewEligibility(gym.id)
            .then(r => setCanReview(r.success && r.canReview))
            .catch(() => setCanReview(false));
    }, [gym]);

    // Scroll-spy
    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        NAV_SECTIONS.forEach(({ id: sid }) => {
            const el = sectionRefs.current[sid];
            if (!el) return;
            const obs = new IntersectionObserver(
                ([e]) => { if (e.isIntersecting) setActiveSection(sid); },
                { rootMargin: '-30% 0px -60% 0px' }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, [branchDetail, gymTrainers]);

    const setRef = (sid: string) => (el: HTMLElement | null) => { sectionRefs.current[sid] = el; };
    const scrollTo = useCallback((sid: string) => {
        sectionRefs.current[sid]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    // Lightbox nav
    const gallery = branchDetail?.gallery || [];
    const openLightbox = (img: GymGallery, idx: number) => { setLightboxImg(img); setLightboxIdx(idx); };
    const lightboxNext = () => {
        const next = (lightboxIdx + 1) % gallery.length;
        setLightboxImg(gallery[next]); setLightboxIdx(next);
    };
    const lightboxPrev = () => {
        const prev = (lightboxIdx - 1 + gallery.length) % gallery.length;
        setLightboxImg(gallery[prev]); setLightboxIdx(prev);
    };

    // ── Loading / 404 ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 animate-pulse pb-20">
                <div className="w-full h-[480px] bg-gray-200" />
                <div className="max-w-6xl mx-auto px-4 mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="h-10 bg-gray-300 w-2/3 rounded-sm" />
                            <div className="h-4 bg-gray-200 w-full rounded-sm" />
                            <div className="h-4 bg-gray-200 w-5/6 rounded-sm" />
                            <div className="h-32 bg-gray-200 w-full rounded-sm mt-8" />
                        </div>
                        <div className="space-y-4">
                            <div className="h-64 bg-gray-300 w-full rounded-sm" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!gym) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
                <div className="text-5xl font-black text-gray-200">404</div>
                <p className="text-gray-700 font-medium">Không tìm thấy Gym.</p>
                <Link to="/gyms" className="text-sm font-medium text-black underline underline-offset-4">← Quay lại danh sách</Link>
            </div>
        );
    }

    const branches = gym.branches || [];
    const activeBranch = branches.find((b: GymBranch) => b.id === activeBranchId) || branches[0];

    // Today's hours
    const todayHours = branchDetail?.opening_hours?.[TODAY_KEY];

    // Lowest price
    const allPrices = (branchDetail?.pricing || []).map(p => Number(p.price)).filter(Boolean);
    const lowestPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;

    // Equipment by category
    const equipByCategory = (branchDetail?.equipment || []).reduce<Record<string, GymEquipment[]>>((acc, eq) => {
        const cat = eq.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat]!.push(eq);
        return acc;
    }, {});

    // SEO
    const seoTitle = `${gym.name} — Phòng tập GymViet`;
    const seoDesc = gym.description?.slice(0, 155) || `${gym.name} — hệ thống phòng tập xác thực trên GymViet.`;
    const seoImage = gym.cover_image_url || gym.logo_url || '';
    const canonicalUrl = `https://gymviet.vn/gyms/${gym.slug || gym.id}`;

    // Stats for display
    const gymYear = gym.founded_year;
    const gymAge = gymYear ? new Date().getFullYear() - gymYear : null;

    // Visible sections
    const hasEquipment = (branchDetail?.equipment || []).length > 0;
    const hasAmenities = (branchDetail?.amenities || []).length > 0;
    const hasTrainers = gymTrainers.length > 0;
    const hasPricing = (branchDetail?.pricing || []).length > 0;
    const hasMap = !!(branchDetail?.google_maps_embed_url || (branchDetail?.latitude && branchDetail?.longitude));

    return (
        <>
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="business.business" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDesc} />
                {seoImage && <meta property="og:image" content={seoImage} />}
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content="GymViet" />
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SportsActivityLocation",
                    "name": gym.name,
                    "description": seoDesc,
                    "image": seoImage,
                    "url": canonicalUrl,
                    "address": activeBranch ? { "@type": "PostalAddress", "streetAddress": activeBranch.address, "addressLocality": activeBranch.city } : undefined,
                })}</script>
            </Helmet>

            {/* ── LIGHTBOX ─────────────────────────────────────────────── */}
            {lightboxImg && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    onClick={() => setLightboxImg(null)}>
                    <button className="absolute top-4 right-5 text-white text-3xl font-black hover:text-gray-400 transition-colors"
                        onClick={() => setLightboxImg(null)}>×</button>
                    {gallery.length > 1 && (
                        <>
                            <button className="absolute left-4 text-white text-2xl font-black px-3 py-2 hover:bg-white/10 transition-colors"
                                onClick={(e) => { e.stopPropagation(); lightboxPrev(); }}>‹</button>
                            <button className="absolute right-4 text-white text-2xl font-black px-3 py-2 hover:bg-white/10 transition-colors"
                                onClick={(e) => { e.stopPropagation(); lightboxNext(); }}>›</button>
                        </>
                    )}
                    <img src={lightboxImg.image_url} alt={lightboxImg.caption || 'Gallery'}
                        className="max-h-[88vh] max-w-full object-contain"
                        decoding="async"
                        onClick={e => e.stopPropagation()} />
                    {lightboxImg.caption && (
                        <p className="absolute bottom-5 text-white/70 text-xs text-center px-4">{lightboxImg.caption}</p>
                    )}
                    <div className="absolute bottom-5 right-5 text-white/50 text-xs font-mono">{lightboxIdx + 1} / {gallery.length}</div>
                </div>
            )}

            <div className="bg-gray-50 min-h-screen pb-20">

                {/* 1. IMMERSIVE HERO & IDENTITY (Slice 1) */}
                <div className="relative w-full min-h-[560px] md:min-h-[640px] bg-black overflow-hidden flex flex-col justify-end">
                    {/* Background Image & Gradient */}
                    <div className="absolute inset-0 z-0 bg-black">
                        {gallery.length > 0 ? (
                            <img src={getOptimizedUrl(gallery[0].image_url, 1280) || gallery[0].image_url} srcSet={getSrcSet(gallery[0].image_url, [640, 1024, 1920])} sizes="100vw" alt={gym.name} width={1280} height={640} className="w-full h-full object-cover opacity-60" fetchPriority="high" decoding="async" />
                        ) : gym.cover_image_url ? (
                            <img src={getOptimizedUrl(gym.cover_image_url, 1280) || gym.cover_image_url} srcSet={getSrcSet(gym.cover_image_url, [640, 1024, 1920])} sizes="100vw" alt={gym.name} className="w-full h-full object-cover opacity-60" fetchPriority="high" />
                        ) : (
                            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                                <span className="text-6xl font-black text-gray-800">{gym.name.slice(0, 2).toUpperCase()}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    </div>

                    {/* Identity Content */}
                    <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-32">
                        <div className="max-w-3xl">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {gym.is_verified && (
                                    <span className="text-[10px] font-black tracking-widest uppercase px-2 py-1 bg-white text-black rounded-sm">Xác thực</span>
                                )}
                                {activeBranch && (
                                    <span className="text-xs font-bold text-gray-300 tracking-wider uppercase">
                                        📍 {activeBranch.branch_name} {activeBranch.city ? `• ${activeBranch.city}` : ''}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-4 leading-none">
                                {gym.name}
                            </h1>

                            {gym.tagline && (
                                <p className="text-lg md:text-xl text-gray-300 font-medium mb-8 leading-relaxed max-w-2xl">
                                    {gym.tagline}
                                </p>
                            )}

                            {/* Gym Stats Cluster */}
                            {(gymAge || gym.total_area_sqm || gym.total_equipment_count || branches.length > 1) && (
                                <div className="flex flex-wrap items-center gap-6 md:gap-10 mb-8 border-y border-white/10 py-5">
                                    {gymAge && (
                                        <div>
                                            <div className="text-2xl md:text-3xl font-black text-white">{gymAge}+</div>
                                            <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Năm HĐ</div>
                                        </div>
                                    )}
                                    {gym.total_area_sqm && (
                                        <div>
                                            <div className="text-2xl md:text-3xl font-black text-white">{gym.total_area_sqm.toLocaleString()}</div>
                                            <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">m² Diện tích</div>
                                        </div>
                                    )}
                                    {gym.total_equipment_count && (
                                        <div>
                                            <div className="text-2xl md:text-3xl font-black text-white">{gym.total_equipment_count}+</div>
                                            <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Thiết bị</div>
                                        </div>
                                    )}
                                    {branches.length > 1 && (
                                        <div>
                                            <div className="text-2xl md:text-3xl font-black text-white">{branches.length}</div>
                                            <div className="text-[10px] uppercase tracking-widest text-gray-400 mt-1">Chi nhánh</div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-4">
                                <button onClick={() => scrollTo('reviews')} className="btn-base btn-primary px-8 py-3 text-sm">
                                    Xem đánh giá
                                </button>
                                <button onClick={() => scrollTo('pricing')} className="btn-base bg-white/10 text-white hover:bg-white/20 border border-white/20 px-8 py-3 text-sm transition-colors backdrop-blur-sm">
                                    Chọn gói tập
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECONDARY GALLERY STRIP */}
                {gallery.length > 1 && (
                    <div className="w-full bg-black py-4 hidden sm:block border-b border-gray-100">
                        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                {gallery.map((img, i) => (
                                    <div key={img.id} className="w-40 h-24 shrink-0 relative cursor-pointer group rounded-sm overflow-hidden border border-white/10" onClick={() => openLightbox(img, i)}>
                                        <img src={getOptimizedUrl(img.image_url, 400) || img.image_url} srcSet={getSrcSet(img.image_url, [400, 800])} sizes="(max-width: 768px) 160px, 160px" alt={img.caption || 'Gallery'} width={160} height={96} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-300"></div>
                                        {i === 5 && gallery.length > 6 && (
                                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm">
                                                <span className="text-white font-bold text-sm">+{gallery.length - 6}</span>
                                            </div>
                                        )}
                                    </div>
                                )).slice(0, 6)}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STICKY SECTION NAV ────────────────────────────────── */}
                <div className="sticky top-0 z-40 border-b border-gray-200 backdrop-blur-sm bg-white/90">
                    <div className="max-w-6xl mx-auto px-4 flex items-center h-12 gap-1 overflow-x-auto">
                        <Link to="/gyms" className="text-xs font-medium text-gray-400 hover:text-black transition-colors whitespace-nowrap mr-3 shrink-0">← Gyms</Link>
                        <div className="w-px h-4 bg-gray-200 shrink-0" />
                        {NAV_SECTIONS.filter(({ id: sid }) => {
                            if (sid === 'amenities') return hasAmenities;
                            if (sid === 'equipment') return hasEquipment;
                            if (sid === 'trainers') return hasTrainers;
                            if (sid === 'pricing') return hasPricing;
                            if (sid === 'map') return hasMap;
                            return true;
                        }).map(({ id: sid, label }) => (
                            <button key={sid} onClick={() => scrollTo(sid)}
                                className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap rounded-sm transition-all duration-200 shrink-0 ${activeSection === sid ? 'bg-black text-white' : 'text-gray-500 hover:text-black'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── MAIN CONTENT GRID ─────────────────────────────────── */}
                <div className="max-w-6xl mx-auto px-4 pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── LEFT COLUMN (2/3) ─────────────────────────── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* 3.1 EXPERIENCE PROOF: ABOUT & PHILOSOPHY (Slice 3) */}
                            <FadeIn>
                                <section ref={setRef('about')} id="about" className="py-2">
                                    <h2 className="text-xl font-black text-black tracking-tight mb-6">Tổng quan</h2>
                                    <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                                        <div className="flex-1">
                                            {gym.description ? (
                                                <div className="prose prose-lg prose-gray max-w-none text-gray-700 leading-relaxed font-light">
                                                    {gym.description.split('\n').filter(p => p.trim()).map((p, i) => (
                                                        <p key={i} className="mb-4">{p}</p>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500 italic">Chưa có thông tin giới thiệu.</p>
                                            )}
                                        </div>

                                        {/* Highlights list on the right */}
                                        {gym.highlights && gym.highlights.length > 0 && (
                                            <div className="w-full md:w-64 shrink-0">
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 pb-2 border-b border-gray-100">Điểm nổi bật</h3>
                                                <ul className="space-y-3">
                                                    {gym.highlights.map((h, i) => (
                                                        <li key={i} className="flex items-start gap-2.5">
                                                            <div className="w-1.5 h-1.5 bg-black rounded-full mt-1.5 shrink-0"></div>
                                                            <span className="text-sm font-semibold text-gray-800 leading-tight">{h}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </FadeIn>

                            {/* 3.3 DECISION DRIVERS: FACILITIES (Slice 3) */}
                            {(hasAmenities || hasEquipment) && (
                                <FadeIn>
                                    <section id="facilities" className="bg-gray-50 rounded-2xl p-6 sm:p-8">
                                        <h2 className="text-2xl font-black text-black tracking-tight mb-2">Trang thiết bị & Tiện ích</h2>
                                        <p className="text-gray-500 text-sm mb-6 border-b border-gray-200 pb-4">Cơ sở vật chất hiện đại, đáp ứng mọi nhu cầu tập luyện.</p>

                                        <div className="space-y-8">
                                            {hasAmenities && (
                                                <div ref={setRef('amenities')}>
                                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Các tiện ích đi kèm</h3>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {(branchDetail?.amenities || []).map(am => (
                                                            <div key={am.id} className={`flex items-start gap-2.5 p-3 rounded-xl border ${am.is_available ? 'border-gray-200 bg-white shadow-sm' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                                                <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: am.is_available ? 'black' : 'gray' }} />
                                                                <div className="min-w-0 flex-1">
                                                                    <p className={`text-sm font-semibold truncate leading-tight ${am.is_available ? 'text-black' : 'text-gray-400 line-through'}`}>{am.name}</p>
                                                                    {am.note && <p className="text-[10px] text-gray-500 truncate mt-0.5">{am.note}</p>}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {hasEquipment && (
                                                <div ref={setRef('equipment')}>
                                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Hệ thống thiết bị</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {Object.entries(equipByCategory).map(([cat, items]) => (
                                                            <div key={cat} className="space-y-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="h-px bg-gray-200 flex-1"></div>
                                                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{EQUIP_CATEGORY_VI[cat] || cat}</h4>
                                                                    <span className="text-[10px] font-bold bg-white border border-gray-200 px-1.5 py-0.5 rounded-sm text-gray-400">{items?.length}</span>
                                                                    <div className="h-px bg-gray-200 flex-1"></div>
                                                                </div>
                                                                <div className="flex flex-wrap gap-1.5 justify-center">
                                                                    {(items || []).map(eq => (
                                                                        <span key={eq.id} className="text-xs font-medium px-2.5 py-1.5 border border-gray-200 bg-white rounded-lg text-gray-700 shadow-sm flex items-center whitespace-nowrap">
                                                                            {eq.name}{eq.quantity && eq.quantity > 1 ? <span className="text-gray-400 ml-1 text-[10px] font-black tracking-widest">×{eq.quantity}</span> : ''}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </FadeIn>
                            )}

                            {/* 3.4 DECISION DRIVERS: TRAINERS (Slice 3) */}
                            {hasTrainers && (
                                <FadeIn>
                                    <section ref={setRef('trainers')} id="trainers" className="bg-black text-white rounded-2xl p-6 sm:p-8">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-white/10 pb-4 gap-3">
                                            <div>
                                                <h2 className="text-2xl font-black tracking-tight flex items-baseline gap-2">
                                                    Đội ngũ HLV
                                                    <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded-md">{gymTrainers.length}</span>
                                                </h2>
                                                <p className="text-gray-400 text-sm mt-1">Chuyên gia đồng hành cùng mục tiêu của bạn.</p>
                                            </div>
                                            {gymTrainers.length > 6 && (
                                                <Link to="/coaches" className="text-[10px] font-bold uppercase tracking-widest text-white border border-white/20 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors whitespace-nowrap">
                                                    Xem tất cả ↗
                                                </Link>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {gymTrainers.slice(0, 6).map((t: any) => (
                                                <Link key={t.id} to={t.profile_slug ? `/coach/${t.profile_slug}` : `/coaches/${t.id}`}
                                                    className="group flex items-center p-3.5 border border-white/10 bg-white/5 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all gap-3.5 relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full duration-1000"></div>
                                                    <div className="w-14 h-14 shrink-0 rounded-full overflow-hidden bg-gray-800 border-2 border-transparent group-hover:border-white transition-colors">
                                                        <img src={getOptimizedUrl(t.avatar_url, 400) || t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.full_name || 'T')}&background=000&color=fff&size=80`}
                                                            srcSet={getSrcSet(t.avatar_url, [400, 800])}
                                                            sizes="(max-width: 768px) 50vw, 25vw"
                                                            alt={t.full_name}
                                                            width={400}
                                                            height={400}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            loading="lazy"
                                                            decoding="async" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold text-gray-100 truncate group-hover:text-white transition-colors">{t.full_name}</p>
                                                        {t.headline && <p className="text-[10px] font-semibold tracking-wider uppercase text-gray-500 truncate mt-0.5">{t.headline}</p>}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                </FadeIn>
                            )}

                            {/* 3.5 DECISION DRIVERS: PRICING (Slice 3) */}
                            {hasPricing && (
                                <FadeIn>
                                    <section ref={setRef('pricing')} id="pricing" className="bg-white border border-black/10 rounded-2xl p-6 sm:p-8 shadow-sm">
                                        <div className="mb-6 border-b border-gray-100 pb-4">
                                            <h2 className="text-2xl font-black text-black tracking-tight">Bảng giá</h2>
                                            <p className="text-gray-500 text-sm mt-1">Đầu tư xứng đáng cho sức khoẻ của bạn.</p>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                            {(branchDetail?.pricing || []).sort((a, b) => a.order_number - b.order_number).map(plan => (
                                                <div key={plan.id}
                                                    className={`relative flex flex-col p-6 rounded-2xl border transition-all hover:-translate-y-1 duration-300 ${plan.is_highlighted ? 'border-black bg-black text-white shadow-xl shadow-black/10' : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'}`}>
                                                    {plan.is_highlighted && (
                                                        <div className="absolute top-0 right-6 -translate-y-1/2">
                                                            <span className="text-[9px] font-black tracking-widest px-3 py-1 bg-white text-black rounded-full border-2 border-black inline-block uppercase">Phổ biến nhất</span>
                                                        </div>
                                                    )}

                                                    <div className={`text-sm font-bold mb-1 ${plan.is_highlighted ? 'text-white' : 'text-black'}`}>{plan.plan_name}</div>

                                                    <div className="mb-4">
                                                        <span className={`text-3xl font-black ${plan.is_highlighted ? 'text-white' : 'text-black'}`}>{Number(plan.price).toLocaleString('vi-VN')}</span>
                                                        <span className={`font-semibold ml-1 ${plan.is_highlighted ? 'text-gray-400' : 'text-gray-500'}`}>₫ / {BILLING_VI[plan.billing_cycle] || plan.billing_cycle}</span>
                                                    </div>

                                                    <div className="w-full h-px bg-current opacity-10 mb-4"></div>

                                                    {plan.description && (
                                                        <p className={`text-sm leading-relaxed mb-6 font-medium ${plan.is_highlighted ? 'text-gray-300' : 'text-gray-600'}`}>
                                                            {plan.description}
                                                        </p>
                                                    )}

                                                    <div className="mt-auto">
                                                        <Link to="/messages" className={`block w-full py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-colors ${plan.is_highlighted ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-100 text-black hover:bg-gray-200'}`}>
                                                            Đăng ký ngay
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </FadeIn>
                            )}

                            {/* 3.6 DECISION DRIVERS: REVIEWS (Slice 4) */}
                            <FadeIn>
                                <section ref={setRef('reviews')} id="reviews" className="bg-black text-white rounded-2xl p-6 sm:p-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 border-b border-white/10 pb-4 gap-3">
                                        <div>
                                            <h2 className="text-2xl font-black tracking-tight">Cộng đồng nói gì</h2>
                                            <p className="text-gray-400 text-sm mt-1">Trải nghiệm thực tế từ các hội viên.</p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <GymReviewList gymId={gym.id} refreshTick={refreshTick} />
                                    </div>

                                    {activeBranchId && canReview && (
                                        <div className="mt-8 pt-6 border-t border-white/10">
                                            <GymReviewForm gymId={gym.id} branchId={activeBranchId} onSuccess={() => setRefreshTick(t => t + 1)} />
                                        </div>
                                    )}
                                    {activeBranchId && !canReview && (
                                        <div className="mt-6 border border-white/10 bg-white/5 rounded-xl p-4 text-center">
                                            <p className="text-xs text-gray-400">
                                                Bạn cần có gói tập với HLV tại đây để chia sẻ trải nghiệm xác thực.
                                            </p>
                                        </div>
                                    )}
                                </section>
                            </FadeIn>

                        </div>

                        {/* ── RIGHT STICKY SIDEBAR (1/3) (Slice 2) ────────── */}
                        <div className="space-y-6 pb-10">
                            <div className="lg:sticky lg:top-24 space-y-5">

                                {/* DECISION CARD */}
                                <div className="border-2 border-black bg-black text-white rounded-2xl p-6 shadow-xl">
                                    {branchDetail && (
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
                                            Chi nhánh {branchDetail.branch_name}
                                        </div>
                                    )}
                                    {lowestPrice ? (
                                        <div className="mb-5 flex items-baseline gap-2">
                                            <div className="text-4xl font-black">{lowestPrice.toLocaleString('vi-VN')}₫</div>
                                            <div className="text-xs text-gray-400 font-medium">/ tháng</div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 mb-5 font-medium">Liên hệ để nhận báo giá</p>
                                    )}

                                    {todayHours && (
                                        <div className="mb-6 flex items-center gap-2 text-sm font-semibold border-b border-white/10 pb-5">
                                            {(todayHours as any).is_closed ? (
                                                <><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-red-400">Hôm nay đóng cửa</span></>
                                            ) : (
                                                <><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-gray-200">Đang mở • Đóng lúc {(todayHours as any).close}</span></>
                                            )}
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Link to="/messages" className="block w-full py-4 bg-white text-black text-center text-sm font-black uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors">
                                            Đặt tư vấn miễn phí
                                        </Link>
                                        <button onClick={() => scrollTo('pricing')} className="block w-full py-3 border border-white/30 text-white text-center text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-white/10 transition-colors">
                                            Xem bảng giá chi tiết
                                        </button>
                                    </div>

                                    <div className="mt-5 text-center text-[10px] font-medium text-gray-400 flex items-center justify-center gap-1.5">
                                        <span className="text-green-400 text-sm leading-none flex-shrink-0 relative top-[-1px]">⚡</span> Phản hồi nhanh · Tư vấn đúng chi nhánh
                                    </div>
                                </div>

                                {/* BRANCH SELECTOR (COMPACT) */}
                                {branches.length > 1 && (
                                    <div className="border border-gray-100 bg-white rounded-2xl p-5 shadow-sm">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Chọn chi nhánh khác</div>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                            {branches.map((b: GymBranch) => (
                                                <button
                                                    key={b.id}
                                                    onClick={() => setActiveBranchId(b.id)}
                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeBranchId === b.id ? 'bg-black text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                                                >
                                                    {b.branch_name}
                                                    {b.district && <span className={`block text-[10px] mt-0.5 ${activeBranchId === b.id ? 'text-gray-300' : 'text-gray-500'}`}>{b.district}</span>}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CONTACT & HOURS */}
                                {branchDetail && (
                                    <div className="border border-gray-100 bg-white rounded-2xl p-5 shadow-sm space-y-4">
                                        {branchDetail.address && (
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Địa chỉ</div>
                                                <p className="text-sm text-gray-800 font-medium leading-relaxed">{branchDetail.address}</p>
                                                {(branchDetail.district || branchDetail.city) && (
                                                    <p className="text-xs text-gray-500 mt-0.5">{[branchDetail.district, branchDetail.city].filter(Boolean).join(', ')}</p>
                                                )}
                                            </div>
                                        )}
                                        {branchDetail.phone && (
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1.5">Hotline</div>
                                                <a href={`tel:${branchDetail.phone}`} className="text-sm font-bold text-black hover:text-gray-600 transition-colors">{branchDetail.phone}</a>
                                            </div>
                                        )}

                                        {branchDetail.opening_hours && (
                                            <details className="group border-t border-gray-100 pt-3 opacity-90">
                                                <summary className="text-[10px] font-bold uppercase tracking-widest text-gray-500 cursor-pointer list-none flex justify-between items-center group-open:mb-3">
                                                    Lịch mở cửa chi tiết
                                                    <span className="transition group-open:rotate-180">↓</span>
                                                </summary>
                                                <div className="space-y-2 text-xs">
                                                    {Object.entries(branchDetail.opening_hours).map(([day, hours]) => {
                                                        if (!hours) return null;
                                                        const h = hours as { open: string; close: string; is_closed?: boolean };
                                                        const isToday = day === TODAY_KEY;
                                                        return (
                                                            <div key={day} className={`flex justify-between items-center py-2 border-b border-gray-50 last:border-0 ${isToday ? 'font-bold text-black bg-gray-50 px-2 rounded-md -mx-2' : 'text-gray-600'}`}>
                                                                <span className="w-14">{DAY_VI[day] ?? day}</span>
                                                                {h.is_closed
                                                                    ? <span className="text-red-500 font-medium pb-[1px]">Đóng cửa</span>
                                                                    : <span className="pb-[1px]">{h.open} – {h.close}</span>
                                                                }
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                )}

                                {/* SHARE & SOCIAL */}
                                <div className="flex gap-2.5">
                                    <div className="flex-1 border border-gray-100 bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Chia sẻ</span>
                                        <ShareButton title={`${gym.name} — GymViet`} text={gym.description ?? undefined} label="Chia sẻ" />
                                    </div>

                                    {gym.social_links && Object.values(gym.social_links).some(Boolean) && (
                                        <div className="flex gap-2 flex-wrap items-center bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
                                            {Object.entries(gym.social_links).map(([platform, url]) => {
                                                if (!url) return null;
                                                return (
                                                    <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:text-white hover:bg-black font-bold uppercase text-[10px] transition-all"
                                                        title={platform}>
                                                        {platform.slice(0, 2)}
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

                {/* 3.7 SUPPORT INFO: MAP (Slice 3) */}
                {hasMap && (
                    <div className="max-w-6xl mx-auto px-4 pt-10">
                        <FadeIn>
                            <section ref={setRef('map')} id="map" className="bg-gray-50 rounded-2xl p-6 sm:p-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                                    <div>
                                        <h2 className="text-2xl font-black tracking-tight text-black">Bản đồ & Đường đi</h2>
                                        {branchDetail?.address && (
                                            <p className="text-sm font-semibold text-gray-500 mt-1">
                                                {branchDetail.address}{branchDetail.district ? `, ${branchDetail.district}` : ''}{branchDetail.city ? `, ${branchDetail.city}` : ''}
                                            </p>
                                        )}
                                    </div>
                                    {branchDetail?.google_maps_embed_url && (
                                        <a href={branchDetail.google_maps_embed_url} target="_blank" rel="noopener noreferrer" className="btn-base bg-white border border-gray-200 text-sm font-bold text-black px-4 py-2 shadow-sm whitespace-nowrap">
                                            Mở Google Maps ↗
                                        </a>
                                    )}
                                </div>

                                {branchDetail?.google_maps_embed_url ? (
                                    <div className="w-full h-72 sm:h-[400px] border border-gray-200 overflow-hidden rounded-xl bg-gray-200">
                                        <iframe
                                            src={branchDetail.google_maps_embed_url}
                                            width="100%" height="100%"
                                            style={{ border: 0 }} loading="lazy"
                                            allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                                            title={`Bản đồ ${branchDetail.branch_name}`}
                                            className="grayscale-[0.3] hover:grayscale-0 transition-all duration-700"
                                        />
                                    </div>
                                ) : (branchDetail?.latitude && branchDetail?.longitude) ? (
                                    <div className="w-full h-72 sm:h-[400px] border border-gray-200 overflow-hidden rounded-xl bg-gray-200">
                                        <iframe
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${branchDetail.longitude - 0.01},${branchDetail.latitude - 0.01},${branchDetail.longitude + 0.01},${branchDetail.latitude + 0.01}&layer=mapnik&marker=${branchDetail.latitude},${branchDetail.longitude}`}
                                            width="100%" height="100%"
                                            style={{ border: 0 }} loading="lazy"
                                            title={`Bản đồ ${branchDetail.branch_name}`}
                                            className="grayscale hover:grayscale-0 transition-all duration-700"
                                        />
                                    </div>
                                ) : null}
                            </section>
                        </FadeIn>
                    </div>
                )}

                {/* ── MOBILE STICKY CTA (Slice 2) ─────────────────────────── */}
                <div className="lg:hidden fixed bottom-5 inset-x-4 z-50">
                    <div className="bg-black text-white rounded-2xl shadow-2xl p-2.5 flex items-center justify-between border border-white/20 backdrop-blur-md bg-black/95">
                        <div className="pl-3 py-1">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Đặt tư vấn ngay</div>
                            <div className="text-sm font-black">{lowestPrice ? `${lowestPrice.toLocaleString('vi-VN')}₫/m` : 'Liên hệ'}</div>
                        </div>
                        <Link to="/messages"
                            className="px-6 py-3.5 bg-white text-black text-xs font-black uppercase tracking-wider rounded-xl active:scale-95 transition-transform flex items-center gap-2">
                            Tư vấn <span className="text-[10px] leading-none mb-[1px]">→</span>
                        </Link>
                    </div>
                </div>

            </div>
        </>
    );
};

export default GymDetailPage;
