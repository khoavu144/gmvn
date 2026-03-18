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
import type { GymTrainerLink } from '../types';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { gymService } from '../services/gymService';
import type { GymCenter, GymBranch, GymGallery } from '../types';
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
    const equipByCategory = (branchDetail?.equipment || []).reduce<Record<string, any[]>>((acc, eq) => {
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

                {/* ── MASONRY HERO GALLERY ──────────────────────────────── */}
                <div className="w-full bg-gray-200 overflow-hidden" style={{ height: '480px' }}>
                    {gallery.length === 0 ? (
                        <div className={`w-full h-full flex items-center justify-center ${gym.cover_image_url ? '' : 'bg-gradient-to-br from-gray-100 to-gray-300'}`}>
                            {gym.cover_image_url
                                ? <img src={gym.cover_image_url} alt={gym.name} className="w-full h-full object-cover grayscale opacity-90" fetchPriority="high" decoding="async" />
                                : <div className="text-center"><p className="text-5xl font-black text-gray-300">{gym.name.slice(0, 2).toUpperCase()}</p></div>
                            }
                        </div>
                    ) : gallery.length === 1 ? (
                        <img src={gallery[0].image_url} alt={gallery[0].caption || gym.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" fetchPriority="high" decoding="async" />
                    ) : (
                        // Masonry-style: 1 large left + up to 4 right grid
                        <div className="h-full flex gap-1">
                            {/* Main large */}
                            <div className="flex-1 relative cursor-pointer group overflow-hidden" onClick={() => openLightbox(gallery[0], 0)}>
                                <img src={gallery[0].image_url} alt={gallery[0].caption || 'Main'}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-[1.02]"
                                    fetchPriority="high"
                                    decoding="async"
                                />
                            </div>
                            {/* Right grid: 2x2 */}
                            {gallery.length > 1 && (
                                <div className="grid grid-cols-2 gap-1" style={{ width: '38%' }}>
                                    {gallery.slice(1, 5).map((img, i) => (
                                        <div key={img.id} className="relative cursor-pointer group overflow-hidden" onClick={() => openLightbox(img, i + 1)}>
                                            <img src={img.image_url} alt={img.caption || 'Gallery'}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            {/* "+N ảnh" overlay on last cell */}
                                            {i === 3 && gallery.length > 5 && (
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                    <span className="text-white font-black text-2xl">+{gallery.length - 5}</span>
                                                    <span className="text-white/70 text-xs ml-1">ảnh</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

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

                            {/* ABOUT + STATS */}
                            <FadeIn>
                                <section ref={setRef('about')} id="about" className="bg-white border border-gray-200 p-5 sm:p-7">
                                    <div className="flex items-start gap-4 mb-5">
                                        {gym.logo_url && (
                                            <div className="w-14 h-14 shrink-0 overflow-hidden border border-gray-100 bg-gray-50">
                                                <img src={gym.logo_url} alt={gym.name} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">{gym.name}</h1>
                                                {gym.is_verified && (
                                                    <span className="text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 bg-black text-white">VERIFIED</span>
                                                )}
                                            </div>
                                            {gym.tagline && <p className="text-sm text-gray-600 font-medium">{gym.tagline}</p>}
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    {(gymAge || gym.total_area_sqm || gym.total_equipment_count || branches.length > 1) && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-gray-100 mb-5">
                                            {gymAge && (
                                                <div>
                                                    <div className="text-2xl font-black text-black">{gymAge}+</div>
                                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">Năm kinh nghiệm</div>
                                                </div>
                                            )}
                                            {gym.total_area_sqm && (
                                                <div>
                                                    <div className="text-2xl font-black text-black">{gym.total_area_sqm.toLocaleString()}</div>
                                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">m² diện tích</div>
                                                </div>
                                            )}
                                            {gym.total_equipment_count && (
                                                <div>
                                                    <div className="text-2xl font-black text-black">{gym.total_equipment_count}+</div>
                                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">Thiết bị</div>
                                                </div>
                                            )}
                                            {branches.length > 1 && (
                                                <div>
                                                    <div className="text-2xl font-black text-black">{branches.length}</div>
                                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mt-0.5">Chi nhánh</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {gym.description && (
                                        <p className="text-sm leading-7 text-gray-700 whitespace-pre-line">{gym.description}</p>
                                    )}

                                    {/* Highlights */}
                                    {gym.highlights && gym.highlights.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {gym.highlights.map((h, i) => (
                                                <span key={i} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 border border-gray-300 text-gray-700">
                                                    {h}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </section>
                            </FadeIn>

                            {/* AMENITIES */}
                            {hasAmenities && (
                                <FadeIn>
                                    <section ref={setRef('amenities')} id="amenities" className="bg-white border border-gray-200 p-5 sm:p-7">
                                        <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-200 pb-2 mb-5">Tiện ích & Dịch vụ</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {(branchDetail?.amenities || []).map(am => (
                                                <div key={am.id} className={`flex items-center gap-2.5 p-3 border ${am.is_available ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-white opacity-50'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${am.is_available ? 'bg-black' : 'bg-gray-300'}`} />
                                                    <div className="min-w-0">
                                                        <p className={`text-xs font-semibold truncate ${am.is_available ? 'text-black' : 'text-gray-400 line-through'}`}>{am.name}</p>
                                                        {am.note && <p className="text-[10px] text-gray-400 truncate">{am.note}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </FadeIn>
                            )}

                            {/* EQUIPMENT by category */}
                            {hasEquipment && (
                                <FadeIn>
                                    <section ref={setRef('equipment')} id="equipment" className="bg-white border border-gray-200 p-5 sm:p-7">
                                        <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-200 pb-2 mb-5">Hệ thống thiết bị</h2>
                                        <div className="space-y-5">
                                            {Object.entries(equipByCategory).map(([cat, items]) => (
                                                <div key={cat}>
                                                    <div className="flex items-baseline gap-3 mb-2">
                                                        <h3 className="text-xs font-bold uppercase tracking-widest text-black">{EQUIP_CATEGORY_VI[cat] || cat}</h3>
                                                        <span className="text-[10px] font-mono text-gray-400">{items?.length} thiết bị</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {(items || []).map(eq => (
                                                            <span key={eq.id} className="text-[11px] font-medium px-2.5 py-1 border border-gray-200 text-gray-700 bg-gray-50">
                                                                {eq.name}{eq.quantity && eq.quantity > 1 ? ` ×${eq.quantity}` : ''}
                                                                {eq.brand ? <span className="text-gray-400 ml-1">({eq.brand})</span> : ''}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </FadeIn>
                            )}

                            {/* TRAINERS */}
                            {hasTrainers && (
                                <FadeIn>
                                    <section ref={setRef('trainers')} id="trainers" className="bg-white border border-gray-200 p-5 sm:p-7">
                                        <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-200 pb-2 mb-5">Huấn luyện viên</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                            {gymTrainers.map((t: any) => (
                                                <Link
                                                    key={t.id}
                                                    to={t.profile_slug ? `/coach/${t.profile_slug}` : `/coaches/${t.id}`}
                                                    className="group flex flex-col items-center text-center p-4 border border-gray-100 hover:border-black transition-colors"
                                                >
                                                    <div className="w-14 h-14 rounded-sm overflow-hidden bg-gray-100 mb-3 border border-gray-100">
                                                        <img
                                                            src={t.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.full_name || 'T')}&background=000&color=fff&size=80`}
                                                            alt={t.full_name}
                                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-300"
                                                            loading="lazy"
                                                            decoding="async"
                                                        />
                                                    </div>
                                                    <p className="text-xs font-bold text-black line-clamp-1">{t.full_name}</p>
                                                    {t.headline && <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{t.headline}</p>}
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                </FadeIn>
                            )}

                            {/* PRICING */}
                            {hasPricing && (
                                <FadeIn>
                                    <section ref={setRef('pricing')} id="pricing" className="bg-white border border-gray-200 p-5 sm:p-7">
                                        <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-200 pb-2 mb-5">Bảng giá</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {(branchDetail?.pricing || []).sort((a, b) => a.order_number - b.order_number).map(plan => (
                                                <div key={plan.id}
                                                    className={`relative flex flex-col p-5 border transition-all hover:-translate-y-0.5 duration-200 ${plan.is_highlighted ? 'border-black bg-black text-white' : 'border-gray-200 bg-white hover:border-gray-400'}`}>
                                                    {plan.is_highlighted && (
                                                        <span className="absolute -top-2.5 left-4 text-[9px] font-black tracking-widest px-2 py-0.5 bg-black text-white border border-white">PHỔ BIẾN</span>
                                                    )}
                                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${plan.is_highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        {BILLING_VI[plan.billing_cycle] || plan.billing_cycle}
                                                    </div>
                                                    <div className={`font-black mb-1 ${plan.is_highlighted ? 'text-white' : 'text-black'}`}>
                                                        <span className="text-2xl">{Number(plan.price).toLocaleString('vi-VN')}</span>
                                                        <span className="text-xs ml-1">₫</span>
                                                    </div>
                                                    <div className="font-semibold text-sm mb-2">{plan.plan_name}</div>
                                                    {plan.description && (
                                                        <p className={`text-xs leading-5 flex-1 ${plan.is_highlighted ? 'text-gray-400' : 'text-gray-500'}`}>{plan.description}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </FadeIn>
                            )}

                            {/* REVIEWS */}
                            <FadeIn>
                                <section ref={setRef('reviews')} id="reviews" className="bg-white border border-gray-200 p-5 sm:p-7">
                                    <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-200 pb-2 mb-5">Đánh giá từ cộng đồng</h2>
                                    <GymReviewList gymId={gym.id} refreshTick={refreshTick} />
                                    {activeBranchId && canReview && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <GymReviewForm gymId={gym.id} branchId={activeBranchId} onSuccess={() => setRefreshTick(t => t + 1)} />
                                        </div>
                                    )}
                                    {activeBranchId && !canReview && (
                                        <p className="mt-4 text-xs text-gray-400 border border-dashed border-gray-200 p-3 text-center">
                                            Bạn cần có gói tập với HLV tại đây để gửi đánh giá xác thực.
                                        </p>
                                    )}
                                </section>
                            </FadeIn>

                            {/* MAP */}
                            {hasMap && (
                                <FadeIn>
                                    <section ref={setRef('map')} id="map" className="bg-white border border-gray-200 p-5 sm:p-7">
                                        <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-gray-200 pb-2 mb-5">Bản đồ & Đường đi</h2>
                                        {branchDetail?.google_maps_embed_url ? (
                                            <div className="w-full h-72 sm:h-96 border border-gray-200 overflow-hidden">
                                                <iframe
                                                    src={branchDetail.google_maps_embed_url}
                                                    width="100%" height="100%"
                                                    style={{ border: 0 }} loading="lazy"
                                                    allowFullScreen referrerPolicy="no-referrer-when-downgrade"
                                                    title={`Bản đồ ${branchDetail.branch_name}`}
                                                />
                                            </div>
                                        ) : (branchDetail?.latitude && branchDetail?.longitude) ? (
                                            <div className="w-full h-72 sm:h-96 border border-gray-200 overflow-hidden">
                                                <iframe
                                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${branchDetail.longitude - 0.01},${branchDetail.latitude - 0.01},${branchDetail.longitude + 0.01},${branchDetail.latitude + 0.01}&layer=mapnik&marker=${branchDetail.latitude},${branchDetail.longitude}`}
                                                    width="100%" height="100%"
                                                    style={{ border: 0 }} loading="lazy"
                                                    title={`Bản đồ ${branchDetail.branch_name}`}
                                                />
                                            </div>
                                        ) : null}
                                        {branchDetail?.address && (
                                            <div className="mt-3 flex items-start gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 shrink-0" />
                                                <p className="text-sm text-gray-700">{branchDetail.address}{branchDetail.district ? `, ${branchDetail.district}` : ''}{branchDetail.city ? `, ${branchDetail.city}` : ''}</p>
                                            </div>
                                        )}
                                    </section>
                                </FadeIn>
                            )}

                        </div>

                        {/* ── RIGHT STICKY SIDEBAR (1/3) ────────────────── */}
                        <div className="space-y-4">
                            <div className="lg:sticky lg:top-16 space-y-4">

                                {/* PRICE + CTA */}
                                <div className="border border-black bg-black text-white p-5">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Giá từ</div>
                                    {lowestPrice ? (
                                        <div className="mb-4">
                                            <div className="text-3xl font-black">{lowestPrice.toLocaleString('vi-VN')}₫</div>
                                            <div className="text-xs text-gray-400">/ tháng</div>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 mb-4">Liên hệ để nhận báo giá</p>
                                    )}
                                    <Link to="/messages"
                                        className="block w-full py-3 bg-white text-black text-center text-xs font-black uppercase tracking-wider hover:bg-gray-200 transition-colors mb-2">
                                        Liên hệ tư vấn →
                                    </Link>
                                    <button
                                        onClick={() => scrollTo('pricing')}
                                        className="block w-full py-2.5 border border-gray-700 text-gray-400 text-center text-xs font-semibold uppercase tracking-wider hover:border-white hover:text-white transition-colors">
                                        Xem bảng giá chi tiết
                                    </button>
                                </div>

                                {/* BRANCH SELECTOR */}
                                {branches.length > 1 && (
                                    <div className="border border-gray-200 bg-white p-5">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Chọn chi nhánh</div>
                                        <select
                                            value={activeBranchId || ''}
                                            onChange={e => setActiveBranchId(e.target.value)}
                                            className="w-full px-3 py-2.5 border border-gray-200 text-sm font-medium text-black bg-white focus:outline-none focus:border-black transition-colors appearance-none"
                                        >
                                            {branches.map((b: GymBranch) => (
                                                <option key={b.id} value={b.id}>{b.branch_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* BRANCH INFO */}
                                {branchDetail && (
                                    <div className="border border-gray-200 bg-white p-5">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Chi nhánh đang xem</div>
                                        <div className="space-y-3 text-xs">
                                            {/* Today hours */}
                                            {todayHours && (
                                                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                                                    <span className="font-semibold text-black">Hôm nay</span>
                                                    {(todayHours as any).is_closed ? (
                                                        <span className="text-red-500 font-semibold">Đóng cửa</span>
                                                    ) : (
                                                        <span className="font-bold text-black">{(todayHours as any).open} – {(todayHours as any).close}</span>
                                                    )}
                                                </div>
                                            )}
                                            {branchDetail.address && (
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Địa chỉ</div>
                                                    <p className="text-gray-700 font-medium leading-4">{branchDetail.address}</p>
                                                    {(branchDetail.district || branchDetail.city) && (
                                                        <p className="text-gray-400">{[branchDetail.district, branchDetail.city].filter(Boolean).join(', ')}</p>
                                                    )}
                                                </div>
                                            )}
                                            {branchDetail.phone && (
                                                <div>
                                                    <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Hotline</div>
                                                    <a href={`tel:${branchDetail.phone}`} className="font-bold text-black hover:text-gray-600 transition-colors">{branchDetail.phone}</a>
                                                </div>
                                            )}
                                            {/* Full hours */}
                                            {branchDetail.opening_hours && (
                                                <div className="pt-2 border-t border-gray-100">
                                                    <div className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Lịch mở cửa</div>
                                                    <div className="space-y-1.5">
                                                        {Object.entries(branchDetail.opening_hours).map(([day, hours]) => {
                                                            if (!hours) return null;
                                                            const h = hours as { open: string; close: string; is_closed?: boolean };
                                                            const isToday = day === TODAY_KEY;
                                                            return (
                                                                <div key={day} className={`flex justify-between ${isToday ? 'font-bold text-black' : 'text-gray-600'}`}>
                                                                    <span className="w-14">{DAY_VI[day] ?? day}{isToday ? ' ●' : ''}</span>
                                                                    {h.is_closed
                                                                        ? <span className="text-red-400">Đóng</span>
                                                                        : <span>{h.open}–{h.close}</span>
                                                                    }
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* SHARE */}
                                <div className="border border-gray-200 bg-white p-4 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Chia sẻ</span>
                                    <ShareButton title={`${gym.name} — GymViet`} text={gym.description ?? undefined} label="Chia sẻ" />
                                </div>

                                {/* SOCIAL LINKS */}
                                {gym.social_links && Object.values(gym.social_links).some(Boolean) && (
                                    <div className="border border-gray-200 bg-white p-5 space-y-1.5">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Kết nối</div>
                                        {Object.entries(gym.social_links).map(([platform, url]) => {
                                            if (!url) return null;
                                            return (
                                                <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                                                    className="flex justify-between items-center px-3 py-2 border border-gray-200 text-xs font-medium text-gray-700 capitalize hover:border-black hover:text-black transition-colors group">
                                                    {platform}
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}

                            </div>
                        </div>

                    </div>
                </div>

                {/* ── MOBILE STICKY CTA ─────────────────────────────────── */}
                <div className="lg:hidden fixed bottom-0 inset-x-0 border-t border-gray-200 bg-white p-3 z-30">
                    <Link to="/messages"
                        className="block w-full py-3 bg-black text-white text-center text-xs font-black uppercase tracking-wider active:opacity-80 transition-opacity">
                        Liên hệ tư vấn →
                    </Link>
                </div>

            </div>
        </>
    );
};

export default GymDetailPage;
