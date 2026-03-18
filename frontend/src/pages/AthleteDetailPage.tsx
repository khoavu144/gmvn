import { useMemo, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublicProfile } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import { getSrcSet, getOptimizedUrl } from '../utils/image';

export default function AthleteDetailPage() {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const {
        viewedProfile: profile,
        viewedExperience: experience,
        viewedGallery: gallery,
        loading,
        error,
    } = useSelector((state: RootState) => state.profile);

    useEffect(() => {
        if (identifier) {
            dispatch(fetchPublicProfile(identifier));
        }
    }, [identifier, dispatch]);

    const athlete = profile?.trainer;
    const isAthleteProfile = athlete?.user_type === 'athlete';

    useEffect(() => {
        if (!profile || !athlete) {
            return;
        }

        if (!isAthleteProfile) {
            const coachRoute = profile.slug ? `/coach/${profile.slug}` : `/coaches/${profile.trainer_id}`;
            navigate(coachRoute, { replace: true });
        }
    }, [profile, athlete, isAthleteProfile, navigate]);

    const canonicalPath = useMemo(() => {
        if (profile?.slug) {
            return `/athletes/${profile.slug}`;
        }
        if (profile?.trainer_id) {
            return `/athletes/${profile.trainer_id}`;
        }
        return identifier ? `/athletes/${identifier}` : '/athletes';
    }, [profile?.slug, profile?.trainer_id, identifier]);

    const canonicalUrl = `${window.location.origin}${canonicalPath}`;

    const seoTitle = useMemo(() => {
        const name = athlete?.full_name || profile?.headline || 'Athlete';
        return `${name} | Athlete Profile | GYMERVIET`;
    }, [athlete?.full_name, profile?.headline]);

    const seoDescription = useMemo(() => {
        const bio = profile?.bio_short || profile?.bio_long || athlete?.bio || '';
        if (bio) {
            return bio.slice(0, 155);
        }
        return 'Hồ sơ vận động viên trên GYMERVIET: thành tích, hành trình tập luyện và thông tin công khai.';
    }, [profile?.bio_short, profile?.bio_long, athlete?.bio]);

    const athleteAchievements = experience.filter((item) => item.experience_type === 'achievement' || item.experience_type === 'certification');

    const handleMessage = () => {
        if (!profile?.trainer_id) {
            return;
        }
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/messages?to=${profile.trainer_id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 animate-pulse pb-20">
                <div className="w-full h-52 sm:h-72 bg-gray-200" />
                <div className="max-w-6xl mx-auto px-4 pt-6 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
                    <div className="h-[420px] bg-gray-200 rounded-sm" />
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
                <Link to="/coaches" className="text-sm text-gray-500 underline">← Quay lại trang khám phá</Link>
            </div>
        );
    }

    if (!isAthleteProfile) {
        return null;
    }

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

            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
                    <Link to="/coaches" className="text-sm font-medium text-gray-600 hover:text-black">
                        ← Khám phá hồ sơ
                    </Link>
                    <div className="text-xs uppercase tracking-wider font-semibold text-black">
                        Athlete Profile
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] gap-6">
                <aside className="lg:sticky lg:top-20 h-fit">
                    <div className="card p-0 overflow-hidden">
                        <div className="h-32 bg-gray-200">
                            {profile.cover_image_url ? (
                                <img
                                    src={getOptimizedUrl(profile.cover_image_url, 600)}
                                    srcSet={getSrcSet(profile.cover_image_url)}
                                    sizes="100vw"
                                    alt="cover"
                                    className="w-full h-full object-cover"
                                    decoding="async"
                                    width={1200}
                                    height={128}
                                />
                            ) : null}
                        </div>
                        <div className="px-5 pb-5 -mt-10">
                            {athlete.avatar_url ? (
                                <img
                                    src={getOptimizedUrl(athlete.avatar_url, 160)}
                                    srcSet={getSrcSet(athlete.avatar_url)}
                                    sizes="(max-width: 768px) 80px, 160px"
                                    alt={athlete.full_name}
                                    className="w-20 h-20 rounded-xl object-cover border-4 border-white bg-gray-100"
                                    decoding="async"
                                    width={160}
                                    height={160}
                                />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(athlete.full_name || 'A')}&background=000&color=fff&size=160`}
                                    alt={athlete.full_name}
                                    className="w-20 h-20 rounded-xl object-cover border-4 border-white bg-gray-100"
                                    decoding="async"
                                    width={160}
                                    height={160}
                                />
                            )}
                            <h1 className="text-xl font-bold text-black mt-3">{athlete.full_name}</h1>
                            {(profile.headline || athlete.bio) && (
                                <p className="text-sm text-gray-700 mt-1">{profile.headline || athlete.bio}</p>
                            )}
                            {profile.location && (
                                <p className="text-xs uppercase tracking-wider text-gray-500 mt-2">{profile.location}</p>
                            )}

                            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100 text-center">
                                <div>
                                    <div className="text-lg font-bold text-black">{profile.years_experience ?? 0}+</div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Năm</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-black">{profile.success_stories ?? 0}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Thành tích</div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-black">{gallery.length}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500">Gallery</div>
                                </div>
                            </div>

                            <button
                                onClick={handleMessage}
                                className="mt-5 w-full py-2.5 bg-black text-white text-center text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
                            >
                                Nhắn tin vận động viên
                            </button>
                        </div>
                    </div>
                </aside>

                <section className="space-y-6">
                    {(profile.bio_short || profile.bio_long) && (
                        <div className="card">
                            <h2 className="card-header">Giới thiệu</h2>
                            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                                {profile.bio_long || profile.bio_short}
                            </p>
                        </div>
                    )}

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

                    {athleteAchievements.length > 0 && (
                        <div className="card">
                            <h2 className="card-header">Thành tích & chứng chỉ</h2>
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
                </section>
            </div>

            <div className="lg:hidden fixed bottom-0 inset-x-0 border-t border-gray-200 bg-white p-3 z-30">
                <button
                    onClick={handleMessage}
                    className="block w-full py-3 text-center text-xs font-black uppercase tracking-wider bg-black text-white transition-opacity active:opacity-80"
                >
                    Nhắn tin vận động viên
                </button>
            </div>
        </div>
    );
}
