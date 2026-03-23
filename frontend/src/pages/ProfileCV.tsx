/**
 * ProfileCV.tsx — Op1 Style: rscard-inspired fitness coach CV/Resume
 *
 * Features:
 *   - Sticky top nav with scroll-highlight on active section
 *   - Full-width hero (cover + avatar + animated stat counters)
 *   - Scroll-triggered fade-in on every section (IntersectionObserver)
 *   - Skills with animated progress bars on viewport entry
 *   - Pricing packages (1 / 3 / 6 months)
 *   - Experience timeline
 *   - Testimonials grid
 *   - Gallery grid
 *   - FAQ accordion
 *   - Sticky right-sidebar CTA + specialties + socials
 *   - Full SEO (Helmet: og:*, JSON-LD, canonical)
 *   - Light / Dark theme driven by profile.theme_color
 *   - No icons (minimalism standard)
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { fetchPublicProfile } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import { SITE_ORIGIN, absoluteUrl } from '../lib/site';

interface SimilarCoach {
    id: string;
    slug: string | null;
    full_name: string;
    avatar_url: string | null;
    specialties: string[] | null;
    base_price_monthly: number | null;
    user_type?: string;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useCountUp(target: number, run: boolean, duration = 1200): number {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (!run || target === 0) return;
        let raf: number;
        let start: number | null = null;
        const step = (ts: number) => {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [target, run, duration]);
    return count;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCounter({ value, label, dark }: { value: number; label: string; dark: boolean }) {
    const count = useCountUp(value, true);
    return (
        <div className="flex flex-col items-center sm:items-start">
            <span className={`text-3xl sm:text-4xl font-black tabular-nums transition-all duration-300 ${dark ? 'text-white' : 'text-black'}`}>
                {count}+
            </span>
            <span className={`text-[10px] uppercase tracking-widest mt-1 ${dark ? 'text-[color:var(--mk-muted)]' : 'text-[color:var(--mk-muted)]'}`}>
                {label}
            </span>
        </div>
    );
}

function SkillBar({ name, level, dark }: { name: string; level: number; dark: boolean }) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-baseline">
                <span className={`text-sm font-medium ${dark ? 'text-gray-200' : 'text-[color:var(--mk-text)]'}`}>{name}</span>
                <span className={`text-xs font-mono ${dark ? 'text-[color:var(--mk-muted)]' : 'text-[color:var(--mk-muted)]'}`}>{level}%</span>
            </div>
            <div className={`h-[3px] w-full rounded-full ${dark ? 'bg-gray-700' : 'bg-[color:var(--mk-paper-strong)]'}`}>
                <div
                    className={`h-full rounded-full ${dark ? 'bg-white' : 'bg-black'}`}
                    style={{ width: `${level}%` }}
                />
            </div>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
    { id: 'about', label: 'Giới thiệu' },
    { id: 'skills', label: 'Kỹ năng' },
    { id: 'experience', label: 'Kinh nghiệm' },
    { id: 'pricing', label: 'Gói tập' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'faq', label: 'FAQ' },
];

export default function ProfileCV() {
    const { slug } = useParams<{ slug: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const {
        viewedProfile: profile,
        viewedExperience: experience,
        viewedGallery: gallery,
        viewedFaq: faq,
        viewedSkills: skills,
        viewedPackages: packages,
        viewedTestimonials: testimonials,
        loading,
        error,
    } = useSelector((state: RootState) => state.profile);

    const [activeSection, setActiveSection] = useState('about');
    const [openFaqId, setOpenFaqId] = useState<string | null>(null);
    const [similarCoaches, setSimilarCoaches] = useState<SimilarCoach[]>([]);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    // BUG FIX: now dispatching with slug (not UUID)
    useEffect(() => {
        if (slug) dispatch(fetchPublicProfile(slug));
    }, [slug, dispatch]);

    useEffect(() => {
        const loadSimilarCoaches = async () => {
            if (!profile?.trainer_id) {
                setSimilarCoaches([]);
                return;
            }
            try {
                const res = await apiClient.get(`/users/trainers/${profile.trainer_id}/similar?limit=3`);
                const items = Array.isArray(res.data?.data) ? res.data.data : [];
                setSimilarCoaches(items);

                if (import.meta.env.DEV || window.location.hostname === 'localhost') {
                    console.info('[ProfileCV][debug] similar loaded', {
                        trainerId: profile.trainer_id,
                        similarCount: items.length,
                    });
                }
            } catch {
                setSimilarCoaches([]);
            }
        };

        loadSimilarCoaches();
    }, [profile?.trainer_id]);

    // Scroll-spy: update active nav item
    useEffect(() => {
        const observers: IntersectionObserver[] = [];
        NAV_SECTIONS.forEach(({ id }) => {
            const el = sectionRefs.current[id];
            if (!el) return;
            const obs = new IntersectionObserver(
                ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
                { rootMargin: '-30% 0px -60% 0px' }
            );
            obs.observe(el);
            observers.push(obs);
        });
        return () => observers.forEach(o => o.disconnect());
    }, [profile]);

    const scrollTo = useCallback((id: string) => {
        sectionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const setRef = (id: string) => (el: HTMLElement | null) => {
        sectionRefs.current[id] = el;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[color:var(--mk-paper)] animate-pulse pb-20">
                <div className="h-12 bg-white border-b border-[color:var(--mk-line)] w-full" />
                <div className="w-full h-52 sm:h-72 bg-[color:var(--mk-paper-strong)]" />
                <div className="max-w-5xl mx-auto px-4">
                    <div className="relative -mt-16 sm:-mt-20 border bg-white border-[color:var(--mk-line)] p-5 sm:p-7 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-sm bg-[color:var(--mk-paper-strong)] -mt-14 sm:-mt-16 border-4 border-white" />
                            <div className="flex-1 space-y-3 w-full mt-2">
                                <div className="h-8 bg-[color:var(--mk-paper-strong)] w-1/3 rounded-sm" />
                                <div className="h-4 bg-[color:var(--mk-paper-strong)] w-1/4 rounded-sm" />
                                <div className="h-4 bg-[color:var(--mk-paper-strong)] w-1/5 rounded-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-40 bg-[color:var(--mk-paper-strong)] rounded-sm w-full" />
                            <div className="h-64 bg-[color:var(--mk-paper-strong)] rounded-sm w-full" />
                        </div>
                        <div className="h-80 bg-[color:var(--mk-paper-strong)] rounded-sm w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[color:var(--mk-paper)] text-center px-4">
                <div className="text-4xl font-black text-gray-200">404</div>
                <p className="text-[color:var(--mk-text-soft)] font-medium">Profile không tồn tại hoặc chưa được công khai.</p>
                <Link to="/coaches" className="text-sm font-medium text-black underline underline-offset-4 hover:text-[color:var(--mk-text-soft)] transition-colors">
                    ← Xem danh sách Coach
                </Link>
            </div>
        );
    }

    const trainer = profile.trainer;
    const isAthleteProfile = trainer?.user_type === 'athlete';
    const primaryDetailLink = isAthleteProfile
        ? (profile.slug ? `/athlete/${profile.slug}` : `/athletes/${profile.trainer_id}`)
        : (profile.slug ? `/coach/${profile.slug}` : `/coaches/${profile.trainer_id}`);
    const primaryCtaLabel = isAthleteProfile ? 'Xem hồ sơ athlete →' : 'Xem coach & gói tập →';

    const isDark = profile.theme_color === 'dark';
    const bg = isDark ? 'bg-gray-950' : 'bg-[color:var(--mk-paper)]';
    const card = isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-[color:var(--mk-line)]';
    const text = isDark ? 'text-gray-100' : 'text-[color:var(--mk-text)]';
    const muted = isDark ? 'text-[color:var(--mk-muted)]' : 'text-[color:var(--mk-muted)]';
    const border = isDark ? 'border-gray-800' : 'border-[color:var(--mk-line)]';
    const sectionHdr = isDark ? 'text-white font-bold text-xs uppercase tracking-widest border-b border-gray-800 pb-2 mb-5' : 'text-black font-bold text-xs uppercase tracking-widest border-b border-[color:var(--mk-line)] pb-2 mb-5';

    // SEO
    const seoTitle = `${trainer?.full_name} — ${profile.headline || 'Huấn luyện viên cá nhân'} | GYMERVIET`;
    const seoDesc = profile.bio_short || `${trainer?.full_name} là huấn luyện viên cá nhân trên GYMERVIET với ${profile.years_experience}+ năm kinh nghiệm.`;
    const seoImage = trainer?.avatar_url || profile.cover_image_url || '';
    const canonicalUrl = absoluteUrl(primaryDetailLink);

    const typeLabels: Record<string, string> = {
        work: 'Công việc', education: 'Học vấn', certification: 'Chứng chỉ', achievement: 'Thành tích',
    };

    const visibleSections = NAV_SECTIONS.filter(({ id }) => {
        if (id === 'about') return profile.bio_short || profile.bio_long;
        if (id === 'skills') return skills.length > 0;
        if (id === 'experience') return experience.length > 0;
        if (id === 'pricing') return packages.length > 0;
        if (id === 'gallery') return gallery.length > 0;
        if (id === 'faq') return faq.length > 0;
        return false;
    });

    return (
        <>
            {/* ── SEO ─────────────────────────────────────────────────────── */}
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDesc} />
                <link rel="canonical" href={canonicalUrl} />
                {/* Open Graph */}
                <meta property="og:type" content="profile" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDesc} />
                <meta property="og:image" content={seoImage} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content="GYMERVIET" />
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDesc} />
                <meta name="twitter:image" content={seoImage} />
                {/* JSON-LD */}
                <script type="application/ld+json">{JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "ProfilePage",
                    "mainEntity": {
                        "@type": "Person",
                        "name": trainer?.full_name,
                        "jobTitle": profile.headline,
                        "description": seoDesc,
                        "image": seoImage,
                        "url": canonicalUrl,
                        "worksFor": { "@type": "Organization", "name": "GYMERVIET", "url": SITE_ORIGIN },
                    }
                })}</script>
            </Helmet>

            <div className={`min-h-screen ${bg} pb-20`}>

                {/* ── STICKY TOP NAV ──────────────────────────────────────── */}
                <div className={`sticky top-0 z-40 border-b ${border} backdrop-blur-sm ${isDark ? 'bg-gray-950/90' : 'bg-white/90'}`}>
                    <div className="max-w-5xl mx-auto px-4 flex items-center justify-between gap-3 h-12">
                        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide min-w-0">
                            <Link
                                to="/coaches"
                                className={`text-xs font-medium ${muted} transition-colors whitespace-nowrap mr-3 shrink-0 ${isDark ? 'hover:text-white' : 'hover:text-black'}`}
                            >
                                ← Coaches
                            </Link>
                            <div className="w-px h-4 bg-[color:var(--mk-paper-strong)] shrink-0" />
                            {visibleSections.map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => scrollTo(id)}
                                    className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap rounded-sm transition-all duration-200 shrink-0 ${activeSection === id
                                        ? isDark ? 'bg-white text-black' : 'bg-black text-white'
                                        : isDark ? 'text-[color:var(--mk-muted)] hover:text-white' : 'text-[color:var(--mk-muted)] hover:text-black'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {slug && (
                            <Link
                                to={`/coach/${slug}`}
                                className={`text-[10px] font-semibold uppercase tracking-wider underline underline-offset-4 whitespace-nowrap shrink-0 ${isDark ? 'text-gray-300 hover:text-white' : 'text-black hover:text-[color:var(--mk-text-soft)]'}`}
                            >
                                Permalink chuẩn SEO
                            </Link>
                        )}
                    </div>
                </div>

                {/* ── HERO: COVER + AVATAR + STATS ────────────────────────── */}
                <div className="relative">
                    {/* Cover */}
                    <div className={`w-full h-52 sm:h-72 ${isDark ? 'bg-gray-800' : 'bg-[color:var(--mk-paper-strong)]'} overflow-hidden`}>
                        {profile.cover_image_url ? (
                            <img
                                src={profile.cover_image_url}
                                alt="Cover"
                                className={`w-full h-full object-cover ${isDark ? 'opacity-60' : 'opacity-90 grayscale'}`}
                            />
                        ) : (
                            <div className={`w-full h-full ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 to-gray-300'}`} />
                        )}
                    </div>

                    {/* Info Card overlay */}
                    <div className="max-w-5xl mx-auto px-4">
                        <div className={`relative -mt-16 sm:-mt-20 rounded-sm border ${card} p-5 sm:p-7 shadow-sm`}>
                            <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 items-start">
                                {/* Avatar */}
                                <div className="shrink-0 mx-auto sm:mx-0 -mt-14 sm:-mt-16">
                                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-sm overflow-hidden border-4 border-white shadow-md bg-[color:var(--mk-paper)]">
                                        <img
                                            src={trainer?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(trainer?.full_name || 'T')}&background=000&color=fff&size=200`}
                                            alt={trainer?.full_name}
                                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                        />
                                    </div>
                                </div>

                                {/* Name / Headline */}
                                <div className="flex-1 min-w-0 text-center sm:text-left">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                                        <h1 className={`text-xl sm:text-2xl font-black ${text}`}>{trainer?.full_name}</h1>
                                        {trainer?.is_verified && (
                                            <span className={`text-[9px] font-black tracking-widest uppercase px-1.5 py-0.5 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                                VERIFIED
                                            </span>
                                        )}
                                        {profile.is_accepting_clients && (
                                            <span className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 border ${isDark ? 'border-gray-600 text-[color:var(--mk-muted)]' : 'border-[color:var(--mk-line)] text-[color:var(--mk-text-soft)]'}`}>
                                                AVAILABLE
                                            </span>
                                        )}
                                    </div>
                                    {profile.headline && (
                                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-[color:var(--mk-text-soft)]'} mb-1`}>{profile.headline}</p>
                                    )}
                                    {profile.location && (
                                        <p className={`text-xs ${muted} capitalize`}>{profile.location}</p>
                                    )}
                                    {trainer?.specialties && trainer.specialties.length > 0 && (
                                        <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-3">
                                            {trainer.specialties.slice(0, 4).map(s => (
                                                <span key={s} className={`text-[10px] font-medium px-2 py-0.5 border ${isDark ? 'border-gray-700 text-[color:var(--mk-muted)]' : 'border-[color:var(--mk-line)] text-[color:var(--mk-text-soft)]'}`}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Stats (animated counters) */}
                                <div className="shrink-0 flex sm:flex-col gap-5 sm:gap-4 justify-center sm:justify-start border-t sm:border-t-0 sm:border-l pt-4 sm:pt-0 sm:pl-6 w-full sm:w-auto mt-3 sm:mt-0">
                                    {profile.years_experience != null && (
                                        <StatCounter value={profile.years_experience} label="Năm KN" dark={isDark} />
                                    )}
                                    {profile.clients_trained != null && (
                                        <StatCounter value={profile.clients_trained} label="Học Viên" dark={isDark} />
                                    )}
                                    {profile.success_stories != null && (
                                        <StatCounter value={profile.success_stories} label="Thành Công" dark={isDark} />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── MAIN GRID ────────────────────────────────────────────── */}
                <div className="max-w-5xl mx-auto px-4 mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── LEFT COLUMN (content) ──────────────────────── */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* ABOUT */}
                            {(profile.bio_short || profile.bio_long) && (
                                <>
                                    <section ref={setRef('about')} id="about" className={`border ${card} p-5 sm:p-6`}>
                                        <h2 className={sectionHdr}>Giới thiệu</h2>
                                        <p className={`text-sm leading-7 whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-[color:var(--mk-text-soft)]'}`}>
                                            {profile.bio_long || profile.bio_short}
                                        </p>
                                    </section>
                                </>
                            )}

                            {/* SKILLS */}
                            {skills.length > 0 && (
                                <>
                                    <section ref={setRef('skills')} id="skills" className={`border ${card} p-5 sm:p-6`}>
                                        <h2 className={sectionHdr}>Kỹ năng chuyên môn</h2>
                                        <div className="space-y-5">
                                            {skills.map(skill => (
                                                <SkillBar key={skill.id} name={skill.name} level={skill.level} dark={isDark} />
                                            ))}
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* EXPERIENCE TIMELINE */}
                            {experience.length > 0 && (
                                <>
                                    <section ref={setRef('experience')} id="experience" className={`border ${card} p-5 sm:p-6`}>
                                        <h2 className={sectionHdr}>Kinh nghiệm & Học vấn</h2>
                                        <div className={`relative pl-5 border-l ${border} space-y-7`}>
                                            {experience.map(exp => (
                                                <div key={exp.id} className="relative">
                                                    <div className={`absolute -left-[22px] top-1.5 w-2.5 h-2.5 rounded-full border-2 ${isDark ? 'border-white bg-gray-900' : 'border-black bg-white'}`} />
                                                    <div className="flex flex-wrap items-baseline gap-2 mb-0.5">
                                                        <h3 className={`text-sm font-bold ${text}`}>{exp.title}</h3>
                                                        {exp.is_current && (
                                                            <span className={`text-[9px] font-black tracking-widest px-1.5 py-0.5 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>NOW</span>
                                                        )}
                                                    </div>
                                                    <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-[color:var(--mk-text-soft)]'}`}>{exp.organization}</p>
                                                    <p className={`text-[10px] uppercase tracking-widest ${muted} mt-0.5`}>
                                                        {typeLabels[exp.experience_type]} · {exp.start_date?.slice(0, 7)} — {exp.is_current ? 'Hiện tại' : (exp.end_date?.slice(0, 7) || '?')}
                                                    </p>
                                                    {exp.description && (
                                                        <p className={`text-xs leading-6 mt-2 ${isDark ? 'text-[color:var(--mk-muted)] bg-gray-800' : 'text-[color:var(--mk-text-soft)] bg-[color:var(--mk-paper)]'} p-3 border ${border}`}>
                                                            {exp.description}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* PRICING PACKAGES */}
                            {packages.length > 0 && (
                                <>
                                    <section ref={setRef('pricing')} id="pricing" className={`border ${card} p-5 sm:p-6`}>
                                        <h2 className={sectionHdr}>Gói tập luyện</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {packages.map(pkg => (
                                                <div
                                                    key={pkg.id}
                                                    className={`relative border p-4 flex flex-col transition-all duration-200 hover:-translate-y-0.5 ${pkg.is_popular
                                                        ? isDark ? 'border-white bg-gray-800' : 'border-black bg-gray-950 text-white'
                                                        : isDark ? 'border-gray-700 hover:border-gray-500' : 'border-[color:var(--mk-line)] hover:border-[color:var(--mk-line)]'
                                                        }`}
                                                >
                                                    {pkg.is_popular && (
                                                        <span className={`absolute -top-2.5 left-4 text-[9px] font-black tracking-widest px-2 py-0.5 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                                            PHỔ BIẾN NHẤT
                                                        </span>
                                                    )}
                                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${pkg.is_popular ? (isDark ? 'text-[color:var(--mk-muted)]' : 'text-[color:var(--mk-muted)]') : muted}`}>
                                                        {pkg.duration_months} THÁNG
                                                    </div>
                                                    <div className={`font-black mb-0.5 ${pkg.is_popular ? 'text-white' : text}`}>
                                                        <span className="text-2xl">{Number(pkg.price).toLocaleString('vi-VN')}</span>
                                                        <span className="text-xs ml-1">₫</span>
                                                    </div>
                                                    {pkg.sessions_per_week && (
                                                        <p className={`text-[10px] ${pkg.is_popular ? 'text-[color:var(--mk-muted)]' : muted} mb-3`}>
                                                            {pkg.sessions_per_week} buổi / tuần
                                                        </p>
                                                    )}
                                                    <div className="font-bold text-sm mb-3">{pkg.name}</div>
                                                    {pkg.features.length > 0 && (
                                                        <ul className="space-y-1.5 flex-1 mb-4">
                                                            {pkg.features.map((f, i) => (
                                                                <li key={i} className={`text-xs flex gap-2 ${pkg.is_popular ? 'text-gray-300' : isDark ? 'text-[color:var(--mk-muted)]' : 'text-[color:var(--mk-text-soft)]'}`}>
                                                                    <span className={`shrink-0 font-bold ${pkg.is_popular ? 'text-white' : text}`}>—</span>
                                                                    {f}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                    <Link
                                                        to={primaryDetailLink}
                                                        className={`block text-center py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${pkg.is_popular
                                                            ? 'bg-white text-black hover:bg-[color:var(--mk-paper-strong)]'
                                                            : isDark ? 'border border-gray-600 text-gray-300 hover:border-white hover:text-white' : 'border border-black text-black hover:bg-black hover:text-white'
                                                            }`}
                                                    >
                                                        Xem chi tiết gói
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* TESTIMONIALS */}
                            {testimonials.length > 0 && (
                                <>
                                    <section className={`border ${card} p-5 sm:p-6`}>
                                        <h2 className={sectionHdr}>Học viên nói gì</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {testimonials.map(t => (
                                                <div key={t.id} className={`p-4 border ${isDark ? 'border-gray-800 bg-gray-800/50' : 'border-[color:var(--mk-line)] bg-[color:var(--mk-paper)]'}`}>
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <div className={`w-9 h-9 rounded-full overflow-hidden shrink-0 ${isDark ? 'bg-gray-700' : 'bg-[color:var(--mk-paper-strong)]'}`}>
                                                            {t.client_avatar ? (
                                                                <img src={t.client_avatar} alt={t.client_name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold">
                                                                    {t.client_name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className={`text-sm font-bold ${text}`}>{t.client_name}</p>
                                                            {t.result_achieved && (
                                                                <p className={`text-[10px] ${muted}`}>{t.result_achieved}</p>
                                                            )}
                                                        </div>
                                                        <div className="ml-auto flex gap-0.5">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <span key={i} className={`text-xs ${i < t.rating ? (isDark ? 'text-white' : 'text-black') : (isDark ? 'text-[color:var(--mk-text-soft)]' : 'text-gray-300')}`}>
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className={`text-xs leading-6 ${isDark ? 'text-[color:var(--mk-muted)]' : 'text-[color:var(--mk-text-soft)]'}`}>{t.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* GALLERY */}
                            {gallery.length > 0 && (
                                <>
                                    <section ref={setRef('gallery')} id="gallery" className={`border ${card} p-5 sm:p-6`}>
                                        <h2 className={sectionHdr}>Gallery</h2>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                                            {gallery.map(img => (
                                                <div key={img.id} className="group relative aspect-square overflow-hidden bg-[color:var(--mk-paper)]">
                                                    <img
                                                        src={img.image_url}
                                                        alt={img.caption || 'gallery'}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                    {img.caption && (
                                                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                                                            <p className="text-xs text-gray-200 line-clamp-2">{img.caption}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </>
                            )}

                            {/* FAQ */}
                            {faq.length > 0 && (
                                <>
                                    <section ref={setRef('faq')} id="faq" className={`border ${card} p-5 sm:p-6`}>
                                        <h2 className={sectionHdr}>Câu hỏi thường gặp</h2>
                                        <div className={`divide-y ${border}`}>
                                            {faq.map(item => (
                                                <div key={item.id}>
                                                    <button
                                                        onClick={() => setOpenFaqId(openFaqId === item.id ? null : item.id)}
                                                        className={`w-full flex justify-between items-center py-4 text-left transition-colors ${isDark ? 'hover:text-white' : 'hover:text-black'} focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--mk-text)]/25 focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--mk-paper)] rounded-sm`}
                                                    >
                                                        <span className={`text-sm font-medium pr-4 ${text}`}>{item.question}</span>
                                                        <span className={`font-mono text-xs shrink-0 transition-transform duration-200 ${openFaqId === item.id ? 'rotate-45' : ''} ${muted}`}>+</span>
                                                    </button>
                                                    <div className={`overflow-hidden transition-all duration-300 ${openFaqId === item.id ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                                                        <p className={`text-sm leading-6 ${isDark ? 'text-[color:var(--mk-muted)]' : 'text-[color:var(--mk-text-soft)]'} whitespace-pre-line`}>
                                                            {item.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </>
                            )}

                            {similarCoaches.length > 0 && (
                                <>
                                    <section className={`border ${card} p-5 sm:p-6`}>
                                        <h2 className={sectionHdr}>Huấn luyện viên tương tự</h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {similarCoaches.map((coach) => {
                                                const coachLink = coach.user_type === 'athlete'
                                                    ? (coach.slug ? `/athlete/${coach.slug}` : `/athletes/${coach.id}`)
                                                    : (coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`);
                                                return (
                                                    <Link
                                                        key={coach.id}
                                                        to={coachLink}
                                                        className={`border p-4 transition-colors ${isDark ? 'border-gray-800 hover:border-white' : 'border-[color:var(--mk-line)] hover:border-black'}`}
                                                    >
                                                        <div className="flex items-center gap-3 mb-3">
                                                            {coach.avatar_url ? (
                                                                <img src={coach.avatar_url} alt={coach.full_name} className="w-11 h-11 rounded-full object-cover border border-[color:var(--mk-line)]" />
                                                            ) : (
                                                                <div className={`w-11 h-11 rounded-full border flex items-center justify-center text-sm font-bold ${isDark ? 'border-gray-700 bg-gray-800 text-gray-300' : 'border-[color:var(--mk-line)] bg-[color:var(--mk-paper)] text-[color:var(--mk-muted)]'}`}>
                                                                    {coach.full_name.charAt(0)}
                                                                </div>
                                                            )}
                                                            <div className="min-w-0">
                                                                <h3 className={`text-sm font-bold truncate ${text}`}>{coach.full_name}</h3>
                                                                {coach.base_price_monthly && (
                                                                    <p className={`text-xs mt-0.5 ${muted}`}>{Number(coach.base_price_monthly).toLocaleString('vi-VN')}₫/tháng</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {!!coach.specialties?.length && (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {coach.specialties.slice(0, 2).map((s) => (
                                                                    <span key={s} className={`text-[10px] px-2 py-0.5 border ${isDark ? 'border-gray-700 text-[color:var(--mk-muted)]' : 'border-[color:var(--mk-line)] text-[color:var(--mk-text-soft)]'}`}>
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </section>
                                </>
                            )}

                        </div>

                        {/* ── RIGHT SIDEBAR (sticky) ───────────────────────── */}
                        <div className="space-y-4">
                            <div className="lg:sticky lg:top-16 space-y-4">

                                {/* CTA CARD */}
                                <div className={`border p-5 ${isDark ? 'border-white bg-white text-black' : 'border-black bg-black text-white'}`}>
                                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-[color:var(--mk-muted)]' : 'text-[color:var(--mk-muted)]'}`}>
                                        Đăng ký tập luyện
                                    </div>
                                    {trainer?.base_price_monthly ? (
                                        <div className="mb-4">
                                            <div className={`text-[10px] uppercase tracking-widest mb-0.5 ${isDark ? 'text-[color:var(--mk-muted)]' : 'text-[color:var(--mk-muted)]'}`}>Giá từ</div>
                                            <div className="text-3xl font-black">
                                                {Number(trainer.base_price_monthly).toLocaleString('vi-VN')}₫
                                            </div>
                                            <div className={`text-xs ${isDark ? 'text-[color:var(--mk-muted)]' : 'text-[color:var(--mk-muted)]'}`}>/ tháng</div>
                                        </div>
                                    ) : (
                                        <p className={`text-sm mb-4 ${isDark ? 'text-[color:var(--mk-text-soft)]' : 'text-[color:var(--mk-muted)]'}`}>Liên hệ để nhận báo giá.</p>
                                    )}
                                    <Link
                                        to={primaryDetailLink}
                                        className={`block w-full py-3 text-center text-xs font-black uppercase tracking-wider transition-colors ${isDark ? 'bg-black text-white hover:bg-gray-900' : 'bg-white text-black hover:bg-[color:var(--mk-paper-strong)]'}`}
                                    >
                                        {primaryCtaLabel}
                                    </Link>
                                </div>

                                {/* CERTIFICATIONS */}
                                {profile.certifications && profile.certifications.length > 0 && (
                                    <div className={`border ${card} p-5`}>
                                        <h2 className={sectionHdr}>Chứng chỉ</h2>
                                        <div className={`divide-y ${border}`}>
                                            {profile.certifications.map((cert, i) => (
                                                <div key={i} className="py-3 first:pt-0 last:pb-0">
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div>
                                                            <p className={`text-xs font-bold ${text}`}>{cert.name}</p>
                                                            <p className={`text-[10px] ${muted} mt-0.5`}>{cert.issuer}</p>
                                                        </div>
                                                        <span className={`text-[10px] font-mono shrink-0 ${isDark ? 'bg-gray-800 text-[color:var(--mk-muted)]' : 'bg-[color:var(--mk-paper)] text-[color:var(--mk-text-soft)]'} px-1.5 py-0.5`}>
                                                            {cert.year}
                                                        </span>
                                                    </div>
                                                    {cert.url && (
                                                        <a href={cert.url} target="_blank" rel="noopener noreferrer"
                                                            className={`inline-block mt-1.5 text-[10px] font-medium underline underline-offset-2 ${isDark ? 'text-[color:var(--mk-muted)] hover:text-white' : 'text-[color:var(--mk-muted)] hover:text-black'} transition-colors`}>
                                                            Xác thực ↗
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* LANGUAGES */}
                                {profile.languages && profile.languages.length > 0 && (
                                    <div className={`border ${card} p-5`}>
                                        <h2 className={sectionHdr}>Ngôn ngữ</h2>
                                        <div className="flex flex-wrap gap-1.5">
                                            {profile.languages.map(lang => (
                                                <span key={lang} className={`text-[10px] font-medium px-2 py-1 border ${isDark ? 'border-gray-700 text-[color:var(--mk-muted)]' : 'border-[color:var(--mk-line)] text-[color:var(--mk-text-soft)]'}`}>
                                                    {lang}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* SOCIAL LINKS */}
                                {profile.social_links && Object.values(profile.social_links).some(Boolean) && (
                                    <div className={`border ${card} p-5`}>
                                        <h2 className={sectionHdr}>Kết nối</h2>
                                        <div className="space-y-1.5">
                                            {Object.entries(profile.social_links).map(([platform, url]) => {
                                                if (!url) return null;
                                                return (
                                                    <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                                                        className={`flex justify-between items-center px-3 py-2.5 border text-xs font-medium capitalize transition-colors group ${isDark ? 'border-gray-800 text-[color:var(--mk-muted)] hover:border-white hover:text-white' : 'border-[color:var(--mk-line)] text-[color:var(--mk-text-soft)] hover:border-black hover:text-black'}`}>
                                                        {platform}
                                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>

                {/* ── STICKY BOTTOM CTA (mobile) ───────────────────────────── */}
                <div className={`lg:hidden fixed bottom-0 inset-x-0 border-t ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-[color:var(--mk-line)]'} p-3 z-30`}>
                    <Link
                        to={primaryDetailLink}
                        className={`block w-full py-3 text-center text-xs font-black uppercase tracking-wider ${isDark ? 'bg-white text-black' : 'bg-black text-white'} transition-opacity active:opacity-80`}
                    >
                        {primaryCtaLabel}
                    </Link>
                </div>

            </div>
        </>
    );
}
