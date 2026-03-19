import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import apiClient from '../services/api';
import { fetchPublicProfile } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';

interface SimilarCoach {
    id: string;
    slug: string | null;
    full_name: string;
    avatar_url: string | null;
    specialties: string[] | null;
    base_price_monthly: number | null;
    user_type?: string;
}

interface FallbackTrainer {
    id: string;
    slug: string | null;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    specialties: string[] | null;
    base_price_monthly: number | null;
}

export default function ProfilePublic() {
    const { trainerId } = useParams<{ trainerId: string }>();
    const dispatch = useDispatch<AppDispatch>();
    const {
        viewedProfile: profile,
        viewedExperience: experience,
        viewedGallery: gallery,
        viewedFaq: faq,
        viewedPremium,
        loading,
    } = useSelector((state: RootState) => state.profile);

    const [similarCoaches, setSimilarCoaches] = useState<SimilarCoach[]>([]);
    const [fallbackTrainer, setFallbackTrainer] = useState<FallbackTrainer | null>(null);
    const [openFaqId, setOpenFaqId] = useState<string | null>(null);

    useEffect(() => {
        if (trainerId) {
            dispatch(fetchPublicProfile(trainerId));
        }
    }, [trainerId, dispatch]);

    useEffect(() => {
        const loadFallbackTrainer = async () => {
            if (!trainerId || profile) return;
            try {
                const res = await apiClient.get(`/users/trainers/${trainerId}`);
                const trainerData = res.data?.data;
                if (trainerData?.id) {
                    setFallbackTrainer(trainerData);
                } else {
                    setFallbackTrainer(null);
                }
            } catch {
                setFallbackTrainer(null);
            }
        };

        loadFallbackTrainer();
    }, [trainerId, profile]);

    const trainerIdSource = profile?.trainer_id || fallbackTrainer?.id;

    useEffect(() => {
        const loadSimilarCoaches = async () => {
            if (!trainerIdSource) return;
            try {
                const res = await apiClient.get(`/users/trainers/${trainerIdSource}/similar?limit=3`);
                const items = Array.isArray(res.data?.data) ? res.data.data : [];
                setSimilarCoaches(items);
            } catch {
                setSimilarCoaches([]);
            }
        };

        loadSimilarCoaches();
    }, [trainerIdSource]);

    const trainer = profile?.trainer || fallbackTrainer;
    const trainerSlug = fallbackTrainer?.slug || null;
    const resolvedProfileSlug = profile?.slug || trainerSlug || null;
    const isAthleteProfile = profile?.trainer?.user_type === 'athlete';
    const trainerName = trainer?.full_name || profile?.headline || (isAthleteProfile ? 'Vận động viên' : 'Huấn luyện viên');
    const trainerAvatar = trainer?.avatar_url || null;
    const trainerBio = trainer?.bio || '';
    const premium = viewedPremium;
    const premiumBadges = premium?.hero?.badges || [];
    const premiumMetrics = premium?.hero?.metrics || [];
    const premiumHighlights = premium?.highlights || [];
    const premiumMedia = premium?.mediaFeatures || [];
    const premiumPress = premium?.pressMentions || [];

    const canonicalPath = resolvedProfileSlug
        ? `${isAthleteProfile ? '/athletes' : '/coach'}/${resolvedProfileSlug}`
        : trainerId
            ? `${isAthleteProfile ? '/athletes' : '/profile/public'}/${trainerId}`
            : '/coaches';

    const canonicalUrl = `${window.location.origin}${canonicalPath}`;

    const seoTitle = useMemo(() => {
        return `${trainerName} | ${isAthleteProfile ? 'Athlete' : 'Coach'} Profile | GYMERVIET`;
    }, [trainerName, isAthleteProfile]);

    const seoDescription = useMemo(() => {
        const base = profile?.bio_short || profile?.bio_long || trainerBio || '';
        if (base) return base.slice(0, 155);
        return isAthleteProfile
            ? `${trainerName} là vận động viên trên GYMERVIET. Xem hồ sơ, thành tích và hành trình tập luyện.`
            : `${trainerName} là huấn luyện viên tại GYMERVIET. Xem hồ sơ, kinh nghiệm và chuyên môn.`;
    }, [profile?.bio_short, profile?.bio_long, trainerBio, trainerName, isAthleteProfile]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 animate-pulse pb-20">
                <div className="w-full h-52 sm:h-72 bg-gray-200" />
                <div className="max-w-5xl mx-auto px-4">
                    <div className="relative -mt-16 sm:-mt-20 border bg-white border-gray-200 p-5 sm:p-7 shadow-sm">
                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-sm bg-gray-300 -mt-14 sm:-mt-16 border-4 border-white" />
                            <div className="flex-1 space-y-3 w-full mt-2">
                                <div className="h-8 bg-gray-300 w-1/3 rounded-sm" />
                                <div className="h-4 bg-gray-200 w-1/4 rounded-sm" />
                                <div className="h-4 bg-gray-200 w-1/5 rounded-sm" />
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-40 bg-gray-200 rounded-sm w-full" />
                            <div className="h-64 bg-gray-200 rounded-sm w-full" />
                        </div>
                        <div className="h-80 bg-gray-200 rounded-sm w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!profile && !fallbackTrainer) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <p className="text-gray-800 font-medium">Profile chưa được thiết lập.</p>
                <Link to="/coaches" className="text-sm text-gray-500 underline">← Quay lại danh sách</Link>
            </div>
        );
    }

    useEffect(() => {
        if (import.meta.env.DEV || window.location.hostname === 'localhost') {
            console.info('[ProfilePublic][debug] route params/state', {
                trainerId,
                profileSlug: profile?.slug ?? null,
                fallbackSlug: fallbackTrainer?.slug ?? null,
                permalinkVisibleByCurrentCondition: Boolean(profile?.slug),
                canonicalPath,
                trainerIdSource,
                similarCount: similarCoaches.length,
            });
        }
    }, [
        trainerId,
        profile?.slug,
        fallbackTrainer?.slug,
        canonicalPath,
        trainerIdSource,
        similarCoaches.length,
    ]);

    const typeLabels: Record<string, string> = {
        work: 'Công việc',
        education: 'Học vấn',
        certification: 'Chứng chỉ',
        achievement: 'Thành tích',
    };

    return (
        <div className="bg-gray-50 pb-16 min-h-screen">
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="profile" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={canonicalUrl} />
                {trainerAvatar && <meta property="og:image" content={trainerAvatar} />}
            </Helmet>

            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
                    <Link to="/coaches" className="text-sm font-medium text-gray-600 hover:text-black">
                        ← Toàn bộ hồ sơ
                    </Link>
                    {resolvedProfileSlug && (
                        <Link
                            to={`${isAthleteProfile ? '/athletes' : '/coach'}/${resolvedProfileSlug}`}
                            className="text-xs font-semibold uppercase tracking-wider text-black underline underline-offset-4"
                        >
                            Permalink chuẩn SEO
                        </Link>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
                    <aside className="lg:sticky lg:top-20 h-fit">
                        <div className="card p-0 overflow-hidden">
                            <div className="h-32 bg-gray-200">
                                {profile?.cover_image_url ? (
                                    <img src={profile.cover_image_url} alt="cover" className="w-full h-full object-cover" decoding="async" />
                                ) : null}
                            </div>
                            <div className="px-5 pb-5 -mt-10">
                                <img
                                    src={trainerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(trainerName || 'T')}&background=000&color=fff&size=160`}
                                    alt={trainerName}
                                    className="w-20 h-20 rounded-xl object-cover border-4 border-white bg-gray-100"
                                    decoding="async"
                                />
                                <h1 className="text-xl font-bold text-black mt-3">{trainerName}</h1>
                                {(profile?.headline || trainer?.bio) && (
                                    <p className="text-sm text-gray-700 mt-1">{profile?.headline || trainer?.bio}</p>
                                )}
                                {profile?.location && (
                                    <p className="text-xs uppercase tracking-wider text-gray-500 mt-2">{profile.location}</p>
                                )}

                                <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100 text-center">
                                    <div>
                                        <div className="text-lg font-bold text-black">{profile?.years_experience ?? 0}+</div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-500">Năm</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-black">{profile?.clients_trained ?? 0}+</div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-500">Học viên</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-black">{profile?.success_stories ?? 0}</div>
                                        <div className="text-[10px] uppercase tracking-wider text-gray-500">Case</div>
                                    </div>
                                </div>

                                <div className="mt-5 space-y-2">
                                    <Link
                                        to={profile?.slug
                                            ? `${isAthleteProfile ? '/athlete' : '/coach'}/${profile.slug}`
                                            : trainerSlug
                                                ? `${isAthleteProfile ? '/athlete' : '/coach'}/${trainerSlug}`
                                                : `${isAthleteProfile ? '/athletes' : '/coaches'}/${trainerIdSource || trainerId}`
                                        }
                                        className="block w-full py-2.5 bg-black text-white text-center text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                                    >
                                        {isAthleteProfile ? 'Xem hồ sơ athlete đầy đủ' : 'Xem bản hồ sơ đầy đủ'}
                                    </Link>
                                    <Link
                                        to={isAthleteProfile ? `/messages?to=${trainerIdSource || trainerId}` : `/coaches/${trainerIdSource || trainerId}`}
                                        className="block w-full py-2.5 border border-gray-300 text-black text-center text-xs font-bold uppercase tracking-wider hover:border-black transition-colors"
                                    >
                                        {isAthleteProfile ? 'Nhắn tin athlete' : 'Xem gói tập'}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <section className="space-y-6">
                        {(profile?.profile_tagline || premiumBadges.length > 0 || premiumMetrics.length > 0) && (
                            <div className="card border border-gray-200 bg-white">
                                {profile?.profile_tagline && (
                                    <p className="text-sm font-medium text-gray-700">{profile.profile_tagline}</p>
                                )}
                                {premiumBadges.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {premiumBadges.map((badge, idx) => (
                                            <span key={`${badge.label}-${idx}`} className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-700">
                                                {badge.value ? `${badge.label}: ${badge.value}` : badge.label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {premiumMetrics.length > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                                        {premiumMetrics.map((metric, idx) => (
                                            <div key={`${metric.label}-${idx}`} className="rounded-sm border border-gray-100 p-3 bg-gray-50">
                                                <div className="text-lg font-bold text-black">{metric.value}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">{metric.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {(profile?.bio_short || profile?.bio_long) && (
                            <div className="card">
                                <h2 className="card-header">Giới thiệu</h2>
                                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                    {profile?.bio_long || profile?.bio_short}
                                </p>
                            </div>
                        )}

                        {experience.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Kinh nghiệm & học vấn</h2>
                                <div className="space-y-4">
                                    {experience.map((exp) => (
                                        <div key={exp.id} className="border border-gray-200 rounded-sm p-4 bg-white">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-sm font-semibold text-black">{exp.title}</h3>
                                                {exp.is_current && (
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 border border-black rounded-xs">HIỆN TẠI</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">{exp.organization}</p>
                                            <p className="text-[11px] uppercase tracking-wide text-gray-500 mt-1">
                                                {typeLabels[exp.experience_type]} · {exp.start_date?.slice(0, 7)} — {exp.is_current ? 'Nay' : exp.end_date?.slice(0, 7) || '?'}
                                            </p>
                                            {exp.description && (
                                                <p className="text-sm text-gray-700 mt-3 whitespace-pre-line leading-relaxed">{exp.description}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {premiumHighlights.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Điểm nổi bật</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {premiumHighlights.map((item) => (
                                        <div key={item.id} className="border border-gray-200 rounded-sm p-4 bg-white">
                                            <div className="text-xs uppercase tracking-wider text-gray-500">{item.title}</div>
                                            <div className="text-base font-bold text-black mt-1">{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {gallery.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Gallery</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {gallery.map((img) => (
                                        <div key={img.id} className="aspect-square overflow-hidden bg-gray-100 rounded-sm">
                                            <img src={img.image_url} alt={img.caption || 'gallery'} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {premiumMedia.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Featured Media</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {premiumMedia.map((media) => (
                                        <a
                                            key={media.id}
                                            href={media.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block border border-gray-200 rounded-sm overflow-hidden hover:border-black transition-colors"
                                        >
                                            <div className="aspect-video bg-gray-100">
                                                <img
                                                    src={media.thumbnail_url || media.url}
                                                    alt={media.caption || media.media_type}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    decoding="async"
                                                />
                                            </div>
                                            {media.caption && (
                                                <p className="text-sm text-gray-700 px-3 py-2 border-t border-gray-100">{media.caption}</p>
                                            )}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {faq.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Câu hỏi thường gặp</h2>
                                <div className="border border-gray-200 rounded-xs divide-y divide-gray-200">
                                    {faq.map((item) => (
                                        <div key={item.id} className="bg-white">
                                            <button
                                                onClick={() => setOpenFaqId(openFaqId === item.id ? null : item.id)}
                                                className="w-full flex justify-between items-center px-4 py-4 text-left hover:bg-gray-50 transition-colors"
                                            >
                                                <span className="text-sm font-medium text-black pr-4">{item.question}</span>
                                                <span className="text-gray-400 font-mono text-xs shrink-0">{openFaqId === item.id ? '-' : '+'}</span>
                                            </button>
                                            {openFaqId === item.id && (
                                                <div className="px-4 pb-4 pt-1 bg-gray-50">
                                                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{item.answer}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {premiumPress.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Báo chí nhắc đến</h2>
                                <div className="space-y-3">
                                    {premiumPress.map((press) => (
                                        <a
                                            key={press.id}
                                            href={press.mention_url || '#'}
                                            target={press.mention_url ? '_blank' : undefined}
                                            rel={press.mention_url ? 'noreferrer' : undefined}
                                            className="block border border-gray-200 rounded-sm p-4 hover:border-black transition-colors"
                                        >
                                            <p className="text-xs uppercase tracking-wider text-gray-500">{press.source_name}</p>
                                            <p className="text-sm font-semibold text-black mt-1">{press.title}</p>
                                            {press.excerpt && <p className="text-sm text-gray-600 mt-2 line-clamp-2">{press.excerpt}</p>}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {similarCoaches.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Huấn luyện viên tương tự</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {similarCoaches.map((coach) => {
                                        const coachLink = coach.user_type === 'athlete'
                                            ? (coach.slug ? `/athlete/${coach.slug}` : `/athletes/${coach.id}`)
                                            : (coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`);
                                        return (
                                            <Link
                                                to={coachLink}
                                                key={coach.id}
                                                className="border border-gray-200 rounded-sm p-4 hover:border-black transition-colors"
                                            >
                                                <div className="flex items-center gap-3 mb-3">
                                                    {coach.avatar_url ? (
                                                        <img src={coach.avatar_url} alt={coach.full_name} className="w-12 h-12 rounded-full object-cover border border-gray-200" loading="lazy" decoding="async" />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                                                            {coach.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-bold text-black truncate">{coach.full_name}</h3>
                                                        {coach.base_price_monthly && (
                                                            <p className="text-xs text-gray-500 mt-0.5">
                                                                {Number(coach.base_price_monthly).toLocaleString('vi-VN')}₫/tháng
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {!!coach.specialties?.length && (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {coach.specialties.slice(0, 2).map((s) => (
                                                            <span key={s} className="text-[10px] px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-xs">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
