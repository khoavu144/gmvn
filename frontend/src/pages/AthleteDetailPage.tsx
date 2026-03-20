import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicProfile } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import { getSrcSet, getOptimizedUrl } from '../utils/image';
import ShareButton from '../components/ShareButton';
import apiClient from '../services/api';
import { buildProfileShareUrl } from '../utils/share';
import '../styles/athleteProfile.css';

// ─── Social helpers ────────────────────────────────────────────────
interface SocialLinks {
    instagram?: string | null;
    tiktok?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    twitter?: string | null;
    website?: string | null;
}
const SOCIAL_META: { key: keyof SocialLinks; label: string }[] = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'youtube', label: 'YouTube' },
];
function toAbsoluteUrl(raw: string): string {
    if (!raw) return '#';
    return raw.startsWith('http') ? raw : `https://${raw}`;
}

// ─── Related athlete ────────────────────────────────────────────────
interface RelatedAthlete {
    id: string;
    slug: string | null;
    profile_slug?: string | null;
    full_name: string;
    avatar_url: string | null;
    specialties: string[] | null;
    user_type?: string;
}

const RELATED_PAGE_SIZE = 2;

function RelatedAthletesSection({ athletes }: { athletes: RelatedAthlete[] }) {
    const [page, setPage] = useState(0);
    if (!athletes.length) return null;
    const totalPages = Math.ceil(athletes.length / RELATED_PAGE_SIZE);
    const visible = athletes.slice(page * RELATED_PAGE_SIZE, (page + 1) * RELATED_PAGE_SIZE);

    return (
        <section className="athlete-related-section">
            <div className="athlete-related-inner">
                <div className="athlete-related-header">
                    <h3 className="athlete-related-title">Vận động viên tương tự</h3>
                    <div className="athlete-related-nav">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="athlete-related-nav-btn"
                            aria-label="Previous"
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        <span className="athlete-related-page">{page + 1} / {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="athlete-related-nav-btn"
                            aria-label="Next"
                        >
                            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="athlete-related-grid">
                    {visible.map(a => {
                        const resolvedSlug = a.profile_slug ?? a.slug;
                        const link = resolvedSlug ? `/athlete/${resolvedSlug}` : `/athlete/${a.id}`;
                        return (
                            <Link key={a.id} to={link} className="athlete-related-card">
                                {a.avatar_url ? (
                                    <img src={getOptimizedUrl(a.avatar_url, 80)} alt={a.full_name} className="athlete-related-avatar" />
                                ) : (
                                    <div className="athlete-related-avatar athlete-related-avatar--fallback">
                                        {a.full_name.charAt(0)}
                                    </div>
                                )}
                                <div className="athlete-related-info">
                                    <div className="athlete-related-name">{a.full_name}</div>
                                    {a.specialties && a.specialties.length > 0 && (
                                        <div className="athlete-related-spec">
                                            {a.specialties.slice(0, 2).join(' · ')}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// ─── Main component ─────────────────────────────────────────────────
export default function AthleteDetailPage() {
    const { identifier, slug } = useParams<{ identifier?: string; slug?: string }>();
    const resolvedIdentifier = identifier || slug;
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const {
        viewedProfile: profile,
        viewedExperience: experience,
        viewedGallery: gallery,
        viewedPackages: packages,
        loading,
        error,
    } = useSelector((state: RootState) => state.profile);

    const [relatedAthletes, setRelatedAthletes] = useState<RelatedAthlete[]>([]);
    const [progressPhotos, setProgressPhotos] = useState<{
        id: string; before_url?: string | null; after_url?: string | null; caption?: string | null;
    }[]>([]);
    const [activeSection, setActiveSection] = useState('about');

    useEffect(() => {
        if (resolvedIdentifier) dispatch(fetchPublicProfile(resolvedIdentifier));
    }, [resolvedIdentifier, dispatch]);

    const athlete = profile?.trainer;
    const isAthleteProfile = athlete?.user_type === 'athlete';

    useEffect(() => {
        if (!profile || !athlete) return;
        if (!isAthleteProfile) {
            const coachRoute = profile.slug ? `/coach/${profile.slug}` : `/coaches/${profile.trainer_id}`;
            navigate(coachRoute, { replace: true });
        }
    }, [profile, athlete, isAthleteProfile, navigate]);

    useEffect(() => {
        if (!profile?.trainer_id || !isAthleteProfile) return;
        apiClient.get(`/users/trainers/${profile.trainer_id}/similar?limit=6&user_type=athlete`)
            .then(res => { const d = res.data?.data; if (Array.isArray(d)) setRelatedAthletes(d); })
            .catch(() => { });
        apiClient.get(`/profiles/trainer/${profile.trainer_id}/progress-photos`)
            .then(res => { const d = res.data?.photos || res.data?.data || []; if (Array.isArray(d)) setProgressPhotos(d); })
            .catch(() => { });
    }, [profile?.trainer_id, isAthleteProfile]);

    const canonicalPath = useMemo(() => {
        if (profile?.slug) return `/athlete/${profile.slug}`;
        if (profile?.trainer_id) return `/athletes/${profile.trainer_id}`;
        return resolvedIdentifier ? `/athletes/${resolvedIdentifier}` : '/coaches?type=athlete';
    }, [profile?.slug, profile?.trainer_id, resolvedIdentifier]);

    const canonicalUrl = `${window.location.origin}${canonicalPath}`;
    const shareIdentifier = profile?.slug || profile?.trainer_id || resolvedIdentifier || '';
    const shareUrl = shareIdentifier ? buildProfileShareUrl('athlete', shareIdentifier) : canonicalUrl;
    const seoTitle = useMemo(() => `${athlete?.full_name || 'Athlete'} | Athlete Profile | GYMERVIET`, [athlete?.full_name]);
    const seoDescription = useMemo(() => {
        const bio = profile?.bio_short || profile?.bio_long || athlete?.bio || '';
        return bio ? bio.slice(0, 155) : 'Hồ sơ vận động viên trên GYMERVIET.';
    }, [profile?.bio_short, profile?.bio_long, athlete?.bio]);

    // Data derivation
    const athleteAchievements = experience.filter(e => e.experience_type === 'achievement' || e.experience_type === 'certification');
    const athleteExperiences = experience.filter(e => e.experience_type === 'work' || e.experience_type === 'education');
    const achievementCount = athleteAchievements.length;
    const socialLinks: SocialLinks = profile?.social_links || {};
    const visibleSocials = SOCIAL_META.filter(m => !!socialLinks[m.key]);

    // Metrics for dark stats card
    const displayMetrics = [
        { value: `${profile?.years_experience ?? 0}+`, label: 'Năm kinh nghiệm' },
        { value: String(achievementCount), label: 'Thành tích' },
        { value: String(gallery.length), label: 'Ảnh' },
    ];

    // Top achievement for bento PR card
    const topAchievement = athleteAchievements[0];

    const handleMessage = () => {
        if (!profile?.trainer_id) return;
        if (!user) { navigate('/login'); return; }
        navigate(`/messages?to=${profile.trainer_id}`);
    };

    const navItems = [
        { id: 'about', label: 'Giới thiệu' },
        { id: 'achievements', label: 'Thành tích' },
        ...(packages.length ? [{ id: 'services', label: 'Dịch vụ' }] : []),
        ...(gallery.length ? [{ id: 'gallery', label: 'Gallery' }] : []),
        ...(progressPhotos.length ? [{ id: 'progress', label: 'Hành trình' }] : []),
    ];

    const scrollTo = (id: string) => {
        setActiveSection(id);
        document.getElementById(`athlete-section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ─── Loading ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#f7f9fb', paddingBottom: '80px' }}>
                <div style={{ display: 'flex' }}>
                    <div style={{ width: 256, minWidth: 256, background: '#1a1a1a', height: 'calc(100vh - 64px)', position: 'sticky', top: 64 }} />
                    <div style={{ flex: 1, padding: 28 }}>
                        <div style={{ height: 260, background: '#e5e7eb', borderRadius: 24, marginBottom: 16 }} />
                        <div style={{ height: 180, background: '#e5e7eb', borderRadius: 24 }} />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !profile || !athlete) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-gray-800 font-medium">Không tìm thấy hồ sơ vận động viên.</p>
                <Link to="/coaches?type=athlete" className="btn-primary mt-4 px-6">← Về danh sách Vận động viên</Link>
            </div>
        );
    }

    if (!isAthleteProfile) return null;

    const displayBio = profile.bio_long || profile.bio_short || athlete.bio || '';
    const avatarUrl = athlete.avatar_url;

    return (
        <div className="athlete-profile-shell">
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={canonicalUrl} />
                {/* Open Graph */}
                <meta property="og:type" content="profile" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:site_name" content="GYMERVIET" />
                <meta property="og:locale" content="vi_VN" />
                {avatarUrl && <meta property="og:image" content={avatarUrl} />}
                {avatarUrl && <meta property="og:image:width" content="400" />}
                {avatarUrl && <meta property="og:image:height" content="400" />}
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@gymerviet" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {avatarUrl && <meta name="twitter:image" content={avatarUrl} />}
                {/* JSON-LD: Person (Athlete) */}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Person',
                    name: athlete?.full_name,
                    description: seoDescription,
                    image: avatarUrl || undefined,
                    url: canonicalUrl,
                    knowsAbout: athlete?.specialties ?? [],
                })}</script>
                {/* JSON-LD: BreadcrumbList */}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://gymerviet.vn' },
                        { '@type': 'ListItem', position: 2, name: 'Vận động viên', item: 'https://gymerviet.vn/coaches?type=athlete' },
                        { '@type': 'ListItem', position: 3, name: athlete?.full_name },
                    ],
                })}</script>
            </Helmet>


            {/* Breadcrumb */}
            <nav className="athlete-profile-breadcrumb">
                <div className="athlete-profile-breadcrumb-inner">
                    <Link to="/coaches?type=athlete" className="athlete-profile-breadcrumb-back">
                        ← Vận động viên
                    </Link>
                    <ShareButton
                        url={shareUrl}
                        title={seoTitle}
                        text={seoDescription}
                        label="Chia sẻ Facebook"
                        variant="facebook"
                        titleAttr="Chia sẻ hồ sơ này lên Facebook"
                    />
                </div>
            </nav>

            <div className="athlete-profile-layout">
                {/* ── Sidebar ── */}
                <aside className="athlete-sidebar">
                    {/* Avatar */}
                    <div className="athlete-sidebar-avatar-wrap">
                        {avatarUrl ? (
                            <img
                                src={getOptimizedUrl(avatarUrl, 160)}
                                srcSet={getSrcSet(avatarUrl)}
                                alt={athlete.full_name}
                                className="athlete-sidebar-avatar"
                            />
                        ) : (
                            <div className="athlete-sidebar-avatar-fallback">
                                {athlete.full_name.charAt(0)}
                            </div>
                        )}
                        <span className="athlete-sidebar-online" />
                    </div>

                    {/* Identity */}
                    <div className="athlete-sidebar-identity">
                        <div className="athlete-sidebar-name">{athlete.full_name}</div>
                        {athlete.is_verified && (
                            <span className="athlete-sidebar-badge">✓ Elite Athlete</span>
                        )}
                        {profile.headline && (
                            <div className="athlete-sidebar-headline">{profile.headline}</div>
                        )}
                        {profile.location && (
                            <div className="athlete-sidebar-location">
                                <span>📍</span> {profile.location}
                            </div>
                        )}
                    </div>

                    {/* Mini stats */}
                    <div className="athlete-sidebar-stats">
                        {displayMetrics.map((m, i) => (
                            <div key={i} className="athlete-sidebar-stat">
                                <div className="athlete-sidebar-stat-val">{m.value}</div>
                                <div className="athlete-sidebar-stat-label">{m.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Nav */}
                    <nav className="athlete-sidebar-nav">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => scrollTo(item.id)}
                                className={`athlete-sidebar-nav-item${activeSection === item.id ? ' active' : ''}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    {/* Social links */}
                    {visibleSocials.length > 0 && (
                        <div className="athlete-sidebar-social">
                            <div className="athlete-sidebar-social-label">Mạng xã hội</div>
                            <div className="athlete-sidebar-social-links">
                                {visibleSocials.map(({ key, label }) => (
                                    <a
                                        key={key}
                                        href={toAbsoluteUrl(socialLinks[key] as string)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="athlete-sidebar-social-link"
                                    >
                                        {label}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <button onClick={handleMessage} className="athlete-sidebar-cta">
                        💬 Nhắn tin
                    </button>
                </aside>

                {/* ── Main content ── */}
                <main className="athlete-profile-main">
                    {/* ── Hero Bento ── */}
                    <div id="athlete-section-about" className="athlete-section-anchor">
                        <div className="athlete-hero-bento">
                            {/* Row 1 */}
                            <div className="athlete-bento-row1">
                                {/* Identity card */}
                                <div className="athlete-bento-identity">
                                    {avatarUrl && (
                                        <div className="athlete-bento-avatar-bg">
                                            <img src={avatarUrl} alt="" aria-hidden="true" />
                                        </div>
                                    )}
                                    <div className="athlete-bento-identity-inner">
                                        <span className="athlete-bento-badge">
                                            {athlete.specialties?.[0] || 'Pro Athlete'}
                                        </span>
                                        <h1 className="athlete-bento-name">
                                            {athlete.full_name}
                                            {athlete.is_verified && (
                                                <svg className="athlete-bento-verified" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                        </h1>
                                        {profile.headline && (
                                            <p className="athlete-bento-headline">{profile.headline}</p>
                                        )}
                                        {profile.location && (
                                            <div className="athlete-bento-location">
                                                <span>📍</span> {profile.location}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Dark stats card */}
                                <div className="athlete-bento-stats">
                                    {avatarUrl && (
                                        <div className="athlete-bento-stats-bg">
                                            <img src={avatarUrl} alt="" aria-hidden="true" />
                                        </div>
                                    )}
                                    <div className="athlete-bento-stats-list">
                                        {displayMetrics.map((m, i) => (
                                            <div key={i}>
                                                <div className="athlete-bento-stat-value">{m.value}</div>
                                                <div className="athlete-bento-stat-label">{m.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="athlete-bento-stats-footer">
                                        <button onClick={handleMessage} className="athlete-bento-portfolio-btn">
                                            Liên hệ ngay
                                            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2 */}
                            <div className="athlete-bento-row2">
                                {/* Bio card */}
                                <div className="athlete-bento-bio">
                                    <h2 className="athlete-bento-bio-title">Athlete Dossier</h2>
                                    <p className="athlete-bento-bio-text">{displayBio || 'Chưa có giới thiệu.'}</p>
                                    {athlete.specialties && athlete.specialties.length > 0 && (
                                        <div className="athlete-bento-tags">
                                            {athlete.specialties.map((s, i) => (
                                                <span key={i} className="athlete-bento-tag">{s}</span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="athlete-bento-cta-row">
                                        <button onClick={handleMessage} className="athlete-bento-cta-primary">
                                            💬 Nhắn tin
                                        </button>
                                    </div>
                                </div>

                                {/* Achievement card */}
                                {topAchievement && (
                                    <div className="athlete-bento-achievement">
                                        <div className="athlete-bento-achievement-inner">
                                            <div className="athlete-bento-achievement-badge">Top Achievement</div>
                                            <div className="athlete-bento-achievement-value">
                                                {topAchievement.start_date?.slice(0, 4) || '—'}
                                            </div>
                                            <div className="athlete-bento-achievement-label">{topAchievement.title}</div>
                                            {topAchievement.organization && (
                                                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                                                    {topAchievement.organization}
                                                </div>
                                            )}
                                            {athleteAchievements.length > 1 && (
                                                <div className="athlete-bento-achievement-subs">
                                                    {athleteAchievements.slice(1, 3).map((a, i) => (
                                                        <div key={i} className="athlete-bento-achievement-sub">
                                                            <span className="athlete-bento-achievement-sub-val">
                                                                {a.start_date?.slice(0, 4)}
                                                            </span>
                                                            <span className="athlete-bento-achievement-sub-label">{a.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <span className="athlete-bento-achievement-watermark">★</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Achievements + certs 2-col ── */}
                    {(athleteAchievements.length > 0 || athleteExperiences.length > 0) && (
                        <div id="athlete-section-achievements" className="athlete-section-anchor athlete-section">
                            <div className="athlete-section-inner">
                                <h2 className="athlete-section-title">Thành tích & Kinh nghiệm</h2>
                                <p className="athlete-section-subtitle">Hành trình thi đấu và huấn luyện</p>
                                <div className="athlete-ach-grid">
                                    {/* Left: experience timeline */}
                                    <div>
                                        {athleteExperiences.length > 0 ? (
                                            <div className="athlete-timeline">
                                                {athleteExperiences.map((e, i) => {
                                                    const isActive = e.is_current;
                                                    return (
                                                        <div key={e.id} className="athlete-timeline-item">
                                                            <div className={`athlete-timeline-dot${isActive ? ' athlete-timeline-dot--active' : ''}`}>
                                                                <div className="athlete-timeline-dot-inner" />
                                                            </div>
                                                            <div className={`athlete-timeline-date${i === 0 ? ' athlete-timeline-date--active' : ''}`}>
                                                                {e.start_date?.slice(0, 7)}
                                                                {isActive ? ' - Hiện tại' : e.end_date ? ` — ${e.end_date.slice(0, 7)}` : ''}
                                                            </div>
                                                            <div className="athlete-timeline-title">{e.title}</div>
                                                            <div className="athlete-timeline-org">{e.organization}</div>
                                                            {e.description && (
                                                                <p className="athlete-timeline-desc">{e.description}</p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: '0.82rem', color: '#9ca3af' }}>Chưa có kinh nghiệm.</p>
                                        )}
                                    </div>

                                    {/* Right: awards/certs rows */}
                                    <div>
                                        {athleteAchievements.length > 0 && (
                                            <div className="athlete-awards-list">
                                                {athleteAchievements.map((a) => (
                                                    <div key={a.id} className="athlete-award-row">
                                                        <div className="athlete-award-icon">
                                                            {a.experience_type === 'achievement' ? '🏆' : '📜'}
                                                        </div>
                                                        <div>
                                                            <div className="athlete-award-name">{a.title}</div>
                                                            <div className="athlete-award-issuer">
                                                                {a.organization}{a.start_date ? ` · ${a.start_date.slice(0, 4)}` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Packages / Services ── */}
                    {packages.length > 0 && (
                        <div id="athlete-section-services" className="athlete-section-anchor athlete-section-alt">
                            <div className="athlete-section-inner">
                                <h2 className="athlete-section-title">Gói dịch vụ</h2>
                                <p className="athlete-section-subtitle">Đăng ký huấn luyện cùng {athlete.full_name}</p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                                    {packages.map(pkg => (
                                        <div key={pkg.id} style={{
                                            background: pkg.is_popular ? '#111' : '#fff',
                                            border: pkg.is_popular ? 'none' : '1.5px solid #e5e7eb',
                                            borderRadius: 20,
                                            padding: 24,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 8,
                                            color: pkg.is_popular ? '#fff' : '#111',
                                        }}>
                                            {pkg.is_popular && (
                                                <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', marginBottom: 4 }}>
                                                    Phổ biến nhất
                                                </span>
                                            )}
                                            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{pkg.name}</h3>
                                            <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                                                {pkg.price ? `${Number(pkg.price).toLocaleString('vi-VN')}₫` : 'Liên hệ'}
                                                <span style={{ fontSize: '0.72rem', fontWeight: 500, opacity: 0.6 }}>/{pkg.duration_months === 1 ? 'tháng' : `${pkg.duration_months} tháng`}</span>
                                            </div>
                                            {pkg.sessions_per_week && (
                                                <p style={{ fontSize: '0.78rem', opacity: 0.65 }}>{pkg.sessions_per_week} buổi/tuần</p>
                                            )}
                                            <button
                                                onClick={handleMessage}
                                                style={{
                                                    marginTop: 'auto',
                                                    padding: '10px',
                                                    borderRadius: 999,
                                                    fontWeight: 700,
                                                    fontSize: '0.82rem',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    background: pkg.is_popular ? '#fff' : '#111',
                                                    color: pkg.is_popular ? '#111' : '#fff',
                                                }}
                                            >
                                                Liên hệ
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Gallery ── */}
                    {gallery.length > 0 && (
                        <div id="athlete-section-gallery" className="athlete-section-anchor athlete-section">
                            <div className="athlete-section-inner">
                                <h2 className="athlete-section-title">Gallery <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af', marginLeft: 6 }}>{gallery.length} ảnh</span></h2>
                                <div className="athlete-gallery-grid">
                                    {gallery.map(item => (
                                        <a key={item.id} href={item.image_url} target="_blank" rel="noopener noreferrer" className="athlete-gallery-item">
                                            <img
                                                src={getOptimizedUrl(item.image_url, 400)}
                                                srcSet={getSrcSet(item.image_url)}
                                                sizes="(max-width: 640px) 50vw, 33vw"
                                                alt={item.caption || 'Gallery'}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Progress photos ── */}
                    {progressPhotos.length > 0 && (
                        <div id="athlete-section-progress" className="athlete-section-anchor athlete-section-alt">
                            <div className="athlete-section-inner">
                                <h2 className="athlete-section-title">Hành trình thay đổi</h2>
                                <p className="athlete-section-subtitle">Before &amp; After</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    {progressPhotos.map(p => (
                                        <div key={p.id} className="athlete-progress-item">
                                            {p.before_url && (
                                                <div>
                                                    <div className="athlete-progress-label">Trước</div>
                                                    <img src={getOptimizedUrl(p.before_url, 400)} alt="Before" className="athlete-progress-img" loading="lazy" />
                                                </div>
                                            )}
                                            {p.after_url && (
                                                <div>
                                                    <div className="athlete-progress-label">Sau</div>
                                                    <img src={getOptimizedUrl(p.after_url, 400)} alt="After" className="athlete-progress-img" loading="lazy" />
                                                </div>
                                            )}
                                            {p.caption && (
                                                <p style={{ gridColumn: '1/-1', fontSize: '0.78rem', color: '#6b7280' }}>{p.caption}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {/* Related athletes with prev/next */}
            <RelatedAthletesSection athletes={relatedAthletes} />

            {/* Mobile sticky CTA */}
            <div className="athlete-mobile-cta lg:hidden">
                <button onClick={handleMessage} className="athlete-mobile-cta-btn">
                    💬 Nhắn tin với {athlete.full_name.split(' ').pop()}
                </button>
            </div>
        </div>
    );
}
