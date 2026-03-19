import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicProfile } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import { getSrcSet, getOptimizedUrl } from '../utils/image';
import ShareButton from '../components/ShareButton';
import apiClient from '../services/api';

// ─── Social link helpers ──────────────────────────────────────────────────────
interface SocialLinks {
    instagram?: string | null;
    tiktok?: string | null;
    facebook?: string | null;
    youtube?: string | null;
    twitter?: string | null;
    website?: string | null;
    linkedin?: string | null;
}

const SOCIAL_META: { key: keyof SocialLinks; label: string; prefix: string }[] = [
    { key: 'instagram', label: 'Instagram', prefix: 'instagram.com/' },
    { key: 'tiktok', label: 'TikTok', prefix: 'tiktok.com/@' },
    { key: 'facebook', label: 'Facebook', prefix: 'facebook.com/' },
];

function toAbsoluteUrl(raw: string): string {
    if (!raw) return '#';
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    return `https://${raw}`;
}

// ─── Related athlete card ─────────────────────────────────────────────────────
interface RelatedAthlete {
    id: string;
    slug: string | null;
    profile_slug?: string | null;
    full_name: string;
    avatar_url: string | null;
    specialties: string[] | null;
    base_price_monthly: number | null;
    user_type?: string;
}

function AthleteRelatedCard({ athlete }: { athlete: RelatedAthlete }) {
    const resolvedSlug = athlete.profile_slug ?? athlete.slug;
    const link = resolvedSlug ? `/athlete/${resolvedSlug}` : `/athlete/${athlete.id}`;
    return (
        <Link to={link} className="card group hover:border-black transition-colors flex flex-col">
            <div className="flex items-center gap-3 mb-3">
                {athlete.avatar_url ? (
                    <img
                        src={getOptimizedUrl(athlete.avatar_url, 80)}
                        alt={athlete.full_name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                        loading="lazy"
                        width={48} height={48}
                    />
                ) : (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                        {athlete.full_name.charAt(0)}
                    </div>
                )}
                <div className="min-w-0">
                    <h3 className="text-sm font-bold text-black truncate">{athlete.full_name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {athlete.base_price_monthly
                            ? `${athlete.base_price_monthly.toLocaleString('vi-VN')} ₫/tháng`
                            : 'Liên hệ báo giá'}
                    </p>
                </div>
            </div>
            {athlete.specialties && athlete.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-auto">
                    {athlete.specialties.slice(0, 3).map((s) => (
                        <span key={s} className="inline-flex py-0.5 px-2 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-xs">{s}</span>
                    ))}
                </div>
            )}
            <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between items-center text-xs font-semibold text-black">
                Xem hồ sơ
                <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
        </Link>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
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
    const [progressPhotos, setProgressPhotos] = useState<{ id: string; before_url?: string | null; after_url?: string | null; caption?: string | null; photo_date?: string | null }[]>([]);

    useEffect(() => {
        if (resolvedIdentifier) {
            dispatch(fetchPublicProfile(resolvedIdentifier));
        }
    }, [resolvedIdentifier, dispatch]);

    const athlete = profile?.trainer;
    const isAthleteProfile = athlete?.user_type === 'athlete';

    // Redirect non-athletes to coach page
    useEffect(() => {
        if (!profile || !athlete) return;
        if (!isAthleteProfile) {
            const coachRoute = profile.slug ? `/coach/${profile.slug}` : `/coaches/${profile.trainer_id}`;
            navigate(coachRoute, { replace: true });
        }
    }, [profile, athlete, isAthleteProfile, navigate]);

    // Fetch related athletes + progress photos
    useEffect(() => {
        if (!profile?.trainer_id || !isAthleteProfile) return;

        // Fetch similar athletes
        apiClient.get(`/users/trainers/${profile.trainer_id}/similar?limit=3&user_type=athlete`)
            .then((res) => {
                const data = res.data?.data;
                if (Array.isArray(data)) setRelatedAthletes(data);
            })
            .catch(() => {});

        // Fetch progress photos
        apiClient.get(`/profiles/trainer/${profile.trainer_id}/progress-photos`)
            .then((res) => {
                const data = res.data?.photos || res.data?.data || [];
                if (Array.isArray(data)) setProgressPhotos(data);
            })
            .catch(() => {});
    }, [profile?.trainer_id, isAthleteProfile]);

    const canonicalPath = useMemo(() => {
        if (profile?.slug) return `/athlete/${profile.slug}`;
        if (profile?.trainer_id) return `/athletes/${profile.trainer_id}`;
        return resolvedIdentifier ? `/athletes/${resolvedIdentifier}` : '/coaches?type=athlete';
    }, [profile?.slug, profile?.trainer_id, resolvedIdentifier]);

    const canonicalUrl = `${window.location.origin}${canonicalPath}`;

    const seoTitle = useMemo(() => {
        const name = athlete?.full_name || profile?.headline || 'Athlete';
        return `${name} | Athlete Profile | GYMERVIET`;
    }, [athlete?.full_name, profile?.headline]);

    const seoDescription = useMemo(() => {
        const bio = profile?.bio_short || profile?.bio_long || athlete?.bio || '';
        return bio ? bio.slice(0, 155) : 'Hồ sơ vận động viên trên GYMERVIET: thành tích, hành trình tập luyện và thông tin công khai.';
    }, [profile?.bio_short, profile?.bio_long, athlete?.bio]);

    const athleteAchievements = experience.filter(
        (item) => item.experience_type === 'achievement' || item.experience_type === 'certification'
    );

    // Auto-count achievements for the stat
    const achievementCount = athleteAchievements.length;

    // Social links — top 3: instagram, tiktok, facebook (from profile.social_links)
    const socialLinks: SocialLinks = profile?.social_links || {};
    const visibleSocials = SOCIAL_META.filter((m) => !!socialLinks[m.key]);

    // Packages from Redux viewedPackages
    // (already destructured above as `packages`)

    const handleMessage = () => {
        if (!profile?.trainer_id) return;
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/messages?to=${profile.trainer_id}`);
    };

    // ─── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 animate-pulse pb-20">
                <div className="w-full h-16 bg-gray-200" />
                <div className="max-w-6xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
                    <div className="h-[460px] bg-gray-200 rounded-sm" />
                    <div className="space-y-5">
                        <div className="h-28 bg-gray-200 rounded-sm" />
                        <div className="h-56 bg-gray-200 rounded-sm" />
                        <div className="h-56 bg-gray-200 rounded-sm" />
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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="profile" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={canonicalUrl} />
                {athlete.avatar_url && <meta property="og:image" content={athlete.avatar_url} />}
            </Helmet>

            {/* Top breadcrumb bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
                    <Link to="/coaches?type=athlete" className="text-sm font-medium text-gray-600 hover:text-black">
                        ← Vận động viên
                    </Link>
                    <div className="flex items-center gap-3">
                        <ShareButton title={seoTitle} text={seoDescription} label="Chia sẻ" />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
                {/* ── Sidebar ── */}
                <aside className="lg:sticky lg:top-20 h-fit">
                    <div className="card p-0 overflow-hidden">
                        {/* Cover */}
                        <div className="h-32 bg-gray-200">
                            {profile.cover_image_url && (
                                <img
                                    src={getOptimizedUrl(profile.cover_image_url, 600)}
                                    srcSet={getSrcSet(profile.cover_image_url)}
                                    sizes="100vw"
                                    alt="cover"
                                    className="w-full h-full object-cover"
                                    decoding="async" width={1200} height={128}
                                />
                            )}
                        </div>

                        <div className="px-5 pb-5 -mt-10">
                            {/* Avatar */}
                            {athlete.avatar_url ? (
                                <img
                                    src={getOptimizedUrl(athlete.avatar_url, 160)}
                                    srcSet={getSrcSet(athlete.avatar_url)}
                                    sizes="(max-width: 768px) 80px, 160px"
                                    alt={athlete.full_name}
                                    className="w-20 h-20 rounded-xl object-cover border-4 border-white bg-gray-100"
                                    decoding="async" width={160} height={160}
                                />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(athlete.full_name || 'A')}&background=000&color=fff&size=160`}
                                    alt={athlete.full_name}
                                    className="w-20 h-20 rounded-xl object-cover border-4 border-white bg-gray-100"
                                    decoding="async" width={160} height={160}
                                />
                            )}

                            {/* Name + Badge */}
                            <h1 className="text-xl font-bold text-black mt-3">{athlete.full_name}</h1>
                            {athlete.is_verified && (
                                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-0.5 rounded-sm">
                                    ✓ Elite Athlete
                                </span>
                            )}

                            {(profile.headline || athlete.bio) && (
                                <p className="text-sm text-gray-700 mt-2">{profile.headline || athlete.bio}</p>
                            )}
                            {profile.location && (
                                <p className="text-xs uppercase tracking-wider text-gray-500 mt-2">{profile.location}</p>
                            )}

                            {/* Social links */}
                            {visibleSocials.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {visibleSocials.map(({ key, label }) => (
                                        <a
                                            key={key}
                                            href={toAbsoluteUrl(socialLinks[key] as string)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 border border-gray-300 px-2.5 py-1 rounded-full hover:border-black hover:text-black transition-colors"
                                        >
                                            {label}
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100 text-center">
                                <div>
                                    <div className="text-lg font-bold text-black">{profile.years_experience ?? 0}+</div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Năm</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-black">{achievementCount}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Thành tích</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-black">{gallery.length}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Ảnh</div>
                                </div>
                            </div>

                            {/* Base price */}
                            {athlete.base_price_monthly && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <p className="text-[10px] uppercase tracking-wider text-gray-400">Giá từ</p>
                                    <p className="text-base font-bold text-black">{athlete.base_price_monthly.toLocaleString('vi-VN')} ₫<span className="text-xs font-normal text-gray-500">/tháng</span></p>
                                </div>
                            )}

                            {/* CTAs */}
                            <div className="mt-4 flex flex-col gap-2">
                                <ShareButton title={seoTitle} text={seoDescription} label="Chia sẻ hồ sơ" className="w-full py-2.5 bg-black text-white text-center text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors" />
                                <button
                                    onClick={handleMessage}
                                    className="w-full py-2.5 border border-gray-300 text-gray-700 text-center text-xs font-bold uppercase tracking-wider hover:border-black hover:text-black transition-colors"
                                >
                                    Nhắn tin
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* ── Main content ── */}
                <section className="space-y-6">
                    {/* Bio */}
                    {(profile.bio_short || profile.bio_long) && (
                        <div className="card">
                            <h2 className="card-header">Giới thiệu</h2>
                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                {profile.bio_long || profile.bio_short}
                            </p>
                        </div>
                    )}

                    {/* Specialties */}
                    {athlete.specialties && athlete.specialties.length > 0 && (
                        <div className="card">
                            <h2 className="card-header">Thế mạnh thi đấu</h2>
                            <div className="flex flex-wrap gap-2">
                                {athlete.specialties.map((spec) => (
                                    <span key={spec} className="inline-flex py-1 px-2.5 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-medium rounded-xs">
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Achievements */}
                    {athleteAchievements.length > 0 && (
                        <div className="card">
                            <h2 className="card-header">Thành tích &amp; chứng chỉ</h2>
                            <div className="space-y-4">
                                {athleteAchievements.map((item) => (
                                    <div key={item.id} className="border border-gray-200 rounded-sm p-4 bg-white">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-sm font-semibold text-black">{item.title}</h3>
                                            {item.is_current && (
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 border border-black rounded-xs">HIỆN TẠI</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">{item.organization}</p>
                                        <p className="text-[11px] uppercase tracking-wide text-gray-500 mt-1">
                                            {item.start_date?.slice(0, 7)} — {item.is_current ? 'Nay' : item.end_date?.slice(0, 7) || '?'}
                                        </p>
                                        {item.description && (
                                            <p className="text-sm text-gray-700 mt-3 whitespace-pre-line leading-relaxed">{item.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Packages/Pricing */}
                    {packages.length > 0 && (
                        <div className="card">
                            <h2 className="card-header">Gói dịch vụ</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {packages.map((pkg) => (
                                    <div key={pkg.id} className="border border-gray-200 rounded-sm p-4 bg-white">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="text-sm font-bold text-black">{pkg.name}</h3>
                                            {pkg.is_popular && (
                                                <span className="shrink-0 text-[10px] font-black uppercase tracking-wide bg-black text-white px-2 py-0.5 rounded-xs">Phổ biến</span>
                                            )}
                                        </div>
                                        {pkg.description && (
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{pkg.description}</p>
                                        )}
                                        <p className="text-base font-bold text-black mt-3">
                                            {pkg.price ? `${Number(pkg.price).toLocaleString('vi-VN')} ₫/tháng` : 'Liên hệ báo giá'}
                                        </p>
                                        <button
                                            onClick={handleMessage}
                                            className="mt-3 w-full py-2 text-center text-xs font-bold uppercase tracking-wider border border-black text-black hover:bg-black hover:text-white transition-colors"
                                        >
                                            Liên hệ
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery */}
                    {gallery.length > 0 && (
                        <div className="card">
                            <h2 className="card-header">Ảnh ({gallery.length})</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {gallery.map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.image_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block relative aspect-square overflow-hidden rounded-sm bg-gray-100"
                                    >
                                        <img
                                            src={getOptimizedUrl(item.image_url, 400)}
                                            srcSet={getSrcSet(item.image_url)}
                                            sizes="(max-width: 640px) 50vw, 33vw"
                                            alt={item.caption || 'Gallery'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Progress photos */}
                    {progressPhotos.length > 0 && (
                        <div className="card">
                            <h2 className="card-header">Hành trình thay đổi</h2>
                            <div className="space-y-4">
                                {progressPhotos.map((p) => (
                                    <div key={p.id} className="grid grid-cols-2 gap-2">
                                        {p.before_url && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Trước</p>
                                                <img
                                                    src={getOptimizedUrl(p.before_url, 400)}
                                                    alt="Before"
                                                    className="w-full aspect-square object-cover rounded-sm bg-gray-100"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        {p.after_url && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Sau</p>
                                                <img
                                                    src={getOptimizedUrl(p.after_url, 400)}
                                                    alt="After"
                                                    className="w-full aspect-square object-cover rounded-sm bg-gray-100"
                                                    loading="lazy"
                                                />
                                            </div>
                                        )}
                                        {p.caption && (
                                            <p className="col-span-2 text-xs text-gray-600">{p.caption}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>
            </div>

            {/* Related athletes */}
            {relatedAthletes.length > 0 && (
                <div className="border-t border-gray-200 bg-white mt-8 py-10">
                    <div className="max-w-6xl mx-auto px-4">
                        <h2 className="text-lg font-bold text-black mb-6">Vận động viên tương tự</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {relatedAthletes.map((a) => (
                                <AthleteRelatedCard key={a.id} athlete={a} />
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile sticky CTA */}
            <div className="lg:hidden fixed bottom-0 inset-x-0 border-t border-gray-200 bg-white p-3 z-30">
                <button
                    onClick={handleMessage}
                    className="block w-full py-3 text-center text-xs font-black uppercase tracking-wider bg-black text-white transition-opacity active:opacity-80"
                >
                    Nhắn tin
                </button>
            </div>
        </div>
    );
}
