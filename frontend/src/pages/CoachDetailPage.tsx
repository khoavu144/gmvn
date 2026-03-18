import { useState, useEffect, useMemo } from 'react';
import type { GymTrainerLink } from '../types';
import { logger } from '../lib/logger';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useToast } from '../components/Toast';
import CoachGymBadge from '../components/CoachGymBadge';
import ShareButton from '../components/ShareButton';

interface Program {
    id: string;
    name: string;
    description: string | null;
    duration_weeks: number | null;
    difficulty: string | null;
    price_monthly: number | null;
    price_one_time: number | null;
    price_per_session: number | null;
    pricing_type: 'monthly' | 'lump_sum' | 'per_session';
    training_format: string;
    current_clients: number;
    max_clients: number;
}

interface Trainer {
    id: string;
    slug: string | null;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    specialties: string[] | null;
    base_price_monthly: number | null;
    is_verified: boolean;
    created_at: string;
}

interface SimilarCoach {
    id: string;
    slug: string | null;
    full_name: string;
    avatar_url: string | null;
    specialties: string[] | null;
    base_price_monthly: number | null;
}

interface PremiumPayload {
    hero?: {
        tagline?: string | null;
        badges?: Array<{ label: string; value?: string }>;
        metrics?: Array<{ label: string; value: string }>;
    };
    highlights?: Array<{ id: string; title: string; value: string }>;
    mediaFeatures?: Array<{ id: string; media_type: 'image' | 'video'; url: string; thumbnail_url: string | null; caption: string | null }>;
    pressMentions?: Array<{ id: string; source_name: string; title: string; excerpt: string | null; mention_url: string | null }>;
}

export default function CoachDetailPage() {
    const { toast, ToastComponent } = useToast();
    const { trainerId, slug } = useParams<{ trainerId?: string; slug?: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [gymLinks, setGymLinks] = useState<GymTrainerLink[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [beforeAfterPhotos, setBeforeAfterPhotos] = useState<any[]>([]);
    const [similarCoaches, setSimilarCoaches] = useState<SimilarCoach[]>([]);
    const [premium, setPremium] = useState<PremiumPayload | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState<string | null>(null);
    const [pendingPayment, setPendingPayment] = useState<{
        amount: number;
        transfer_content: string;
        program_id: string;
    } | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                let resolvedTrainerId = trainerId;

                if (!resolvedTrainerId && slug) {
                    const bySlugRes = await apiClient.get(`/users/trainers/slug/${slug}`);
                    resolvedTrainerId = bySlugRes?.data?.data?.id;
                }

                if (!resolvedTrainerId) {
                    setTrainer(null);
                    return;
                }

                const [trainerRes, programsRes, gymsRes, testimonialsRes, beforeAfterRes, similarRes, profileRes] = await Promise.all([
                    apiClient.get(`/users/trainers/${resolvedTrainerId}`),
                    apiClient.get(`/programs/trainers/${resolvedTrainerId}/programs`),
                    apiClient.get(`/gyms/trainer/${resolvedTrainerId}`).catch(() => ({ data: { gyms: [] } })),
                    apiClient.get(`/users/trainers/${resolvedTrainerId}/testimonials?limit=6`).catch(() => ({ data: { testimonials: [] } })),
                    apiClient.get(`/users/trainers/${resolvedTrainerId}/before-after`).catch(() => ({ data: [] })),
                    apiClient.get(`/users/trainers/${resolvedTrainerId}/similar?limit=3`).catch(() => ({ data: [] })),
                    apiClient.get(`/profiles/trainer/${resolvedTrainerId}/full`).catch(() => ({ data: null })),
                ]);

                const trainerData = trainerRes.data.data;
                const profileData = profileRes?.data?.profile;
                setTrainer({
                    ...trainerData,
                    slug: profileData?.slug || trainerData?.slug || slug || null,
                });
                setPremium(profileRes?.data?.premium || null);
                setPrograms(programsRes.data.programs || []);
                setGymLinks(gymsRes.data.gyms || []);
                setTestimonials(testimonialsRes.data.testimonials || []);
                setBeforeAfterPhotos(Array.isArray(beforeAfterRes.data) ? beforeAfterRes.data : []);
                setSimilarCoaches(Array.isArray(similarRes.data?.data) ? similarRes.data.data : Array.isArray(similarRes.data) ? similarRes.data : []);
            } catch (err) {
                logger.error(err);
                setTrainer(null);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [trainerId, slug]);

    const handleSubscribe = async (programId: string) => {
        if (!user) {
            navigate('/login');
            return;
        }

        setSubscribing(programId);
        try {
            const res = await apiClient.post('/subscriptions', { program_id: programId });
            if (res.data.success) {
                setPendingPayment({
                    amount: res.data.amount,
                    transfer_content: res.data.transfer_content,
                    program_id: programId,
                });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Đã có lỗi xảy ra');
        } finally {
            setSubscribing(null);
        }
    };

    const handleCheckPayment = async () => {
        if (!pendingPayment) return;

        setCheckingStatus(true);
        try {
            const res = await apiClient.get(`/subscriptions/status?program_id=${pendingPayment.program_id}`);
            if (res.data.isActive) {
                toast.success('Thanh toán thành công! Gói tập đã được kích hoạt.');
                setPendingPayment(null);
            } else {
                toast.error('Chưa nhận được thanh toán. Vui lòng đợi vài phút hoặc thử lại.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Không thể kiểm tra trạng thái.');
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleMessage = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        navigate(`/messages?to=${trainerId}`);
    };

    const canonicalPath = trainer?.slug ? `/coach/${trainer.slug}` : `/coaches/${trainerId ?? ''}`;
    const canonicalUrl = `http://localhost:5173${canonicalPath}`;

    const seoTitle = useMemo(() => {
        if (!trainer?.full_name) return 'Coach Detail | GYMERVIET';
        return `${trainer.full_name} — GYMERVIET Coach`;
    }, [trainer?.full_name]);

    const seoDescription = useMemo(() => {
        if (trainer?.bio) return trainer.bio.slice(0, 155);
        if (!trainer?.full_name) return 'Trang chi tiết huấn luyện viên tại GYMERVIET.';
        return `${trainer.full_name} là huấn luyện viên được xác thực trên GYMERVIET.`;
    }, [trainer?.bio, trainer?.full_name]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-4 md:p-6 pb-20">
                <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
                    <div className="h-48 md:h-64 bg-gray-200 rounded-2xl w-full"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="h-[400px] bg-gray-200 rounded-xl col-span-1"></div>
                        <div className="space-y-4 col-span-1 lg:col-span-3">
                            <div className="h-32 bg-gray-200 rounded-xl w-full"></div>
                            <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="text-gray-800 font-medium">Không tìm thấy Coach</div>
                <Link to="/coaches" className="text-black underline text-sm">← Về danh sách Coach</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="profile" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={canonicalUrl} />
                {trainer.avatar_url && <meta property="og:image" content={trainer.avatar_url} />}
            </Helmet>

            {ToastComponent}

            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 h-12 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-black transition-colors">
                        ← Huấn luyện viên
                    </button>
                    <div className="flex items-center gap-3">
                        {trainer.slug && (
                            <Link to={`/coach/${trainer.slug}`} className="text-xs font-semibold uppercase tracking-wider text-black underline underline-offset-4">
                                Permalink chuẩn SEO
                            </Link>
                        )}
                        <ShareButton title={seoTitle} text={seoDescription} label="Chia sẻ" />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-6">
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gradient-to-r from-black via-gray-900 to-gray-800 text-white">
                    <div className="px-6 py-8 md:px-8 md:py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-4 min-w-0">
                            {trainer.avatar_url ? (
                                <img src={trainer.avatar_url} alt={trainer.full_name} className="w-20 h-20 rounded-2xl object-cover border border-white/20" />
                            ) : (
                                <div className="w-20 h-20 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center text-2xl font-bold text-white">
                                    {trainer.full_name.charAt(0)}
                                </div>
                            )}
                            <div className="min-w-0">
                                <h1 className="text-2xl font-bold truncate">{trainer.full_name}</h1>
                                <p className="text-sm text-white/80 mt-1">Coach profile • GYMERVIET</p>
                                {trainer.specialties && trainer.specialties.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {trainer.specialties.slice(0, 3).map((s) => (
                                            <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button onClick={handleMessage} className="h-10 px-5 rounded-md bg-white text-black text-sm font-semibold hover:bg-gray-100 transition-colors">
                                Nhắn tin ngay
                            </button>
                            <a href="#programs" className="h-10 px-5 rounded-md border border-white/30 text-white text-sm font-semibold hover:bg-white/10 transition-colors flex items-center">
                                Xem gói tập
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6">
                    <aside className="lg:sticky lg:top-20 h-fit">
                        <div className="card border border-gray-200 shadow-sm">
                            <div className="space-y-3">
                                {trainer.is_verified && (
                                    <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded w-fit">
                                        ✓ Verified Coach
                                    </span>
                                )}
                                {trainer.base_price_monthly && (
                                    <p className="text-sm text-gray-600">
                                        Giá từ <span className="font-semibold text-black">{Number(trainer.base_price_monthly).toLocaleString('vi-VN')}₫/tháng</span>
                                    </p>
                                )}
                                {trainer.bio && (
                                    <p className="text-sm text-gray-600 leading-relaxed">{trainer.bio}</p>
                                )}
                            </div>
                        </div>
                    </aside>

                    <section className="space-y-6">
                        {premium?.hero?.tagline && (
                            <div className="card border border-gray-200 bg-white">
                                <p className="text-sm text-gray-600">{premium.hero.tagline}</p>
                                {(premium.hero.badges?.length || 0) > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {premium.hero!.badges!.map((badge, idx) => (
                                            <span key={`${badge.label}-${idx}`} className="text-xs px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50">
                                                {badge.value ? `${badge.label}: ${badge.value}` : badge.label}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {(premium.hero.metrics?.length || 0) > 0 && (
                                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-gray-100 pt-4">
                                        {premium.hero!.metrics!.map((metric, idx) => (
                                            <div key={`${metric.label}-${idx}`} className="rounded-sm border border-gray-100 p-3 bg-gray-50">
                                                <div className="text-lg font-bold text-black">{metric.value}</div>
                                                <div className="text-[10px] uppercase tracking-wider text-gray-500 mt-1">{metric.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {(premium?.highlights?.length || 0) > 0 && (
                            <div className="card">
                                <h2 className="card-header">Điểm nổi bật</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {premium!.highlights!.map((item) => (
                                        <div key={item.id} className="border border-gray-200 rounded-sm p-4 bg-white">
                                            <div className="text-xs uppercase tracking-wider text-gray-500">{item.title}</div>
                                            <div className="text-base font-bold text-black mt-1">{item.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {gymLinks.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Hoạt động tại Gym</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {gymLinks.map((link) => {
                                        const gymId = link.gym_center?.id;
                                        const gymName = link.gym_center?.name;
                                        if (!gymId || !gymName) {
                                            return null;
                                        }

                                        return (
                                            <CoachGymBadge
                                                key={link.id}
                                                gymId={gymId}
                                                gymName={gymName}
                                                branchName={link.branch?.branch_name ?? undefined}
                                                role={link.role_at_gym ?? undefined}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div id="programs" className="card">
                            <div className="flex items-baseline justify-between mb-4 border-b border-gray-200 pb-2">
                                <h2 className="text-h3">Danh sách Gói tập ({programs.length})</h2>
                            </div>

                            {programs.length === 0 ? (
                                <div className="text-center text-gray-500 py-10 text-sm border border-dashed border-gray-200 rounded-sm">
                                    Coach chưa có gói tập nào khả dụng.
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2">
                                    {programs.map((prog) => (
                                        <div key={prog.id} className="border border-gray-200 rounded-sm p-4 flex flex-col hover:border-black transition-colors">
                                            <div className="mb-3">
                                                <div className="flex justify-between items-start gap-2">
                                                    <h3 className="text-base font-bold text-black">{prog.name}</h3>
                                                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-xs shrink-0">
                                                        {prog.current_clients}/{prog.max_clients} slot
                                                    </span>
                                                </div>
                                                {prog.description && (
                                                    <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">{prog.description}</p>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-4">
                                                {prog.duration_weeks && <span className="border border-gray-200 px-2 py-1 rounded-xs">{prog.duration_weeks} tuần</span>}
                                                {prog.difficulty && <span className="border border-gray-200 px-2 py-1 rounded-xs">{prog.difficulty}</span>}
                                            </div>

                                            <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                                                <div>
                                                    {prog.pricing_type === 'monthly' && prog.price_monthly ? (
                                                        <div className="text-lg font-bold text-black">
                                                            {Number(prog.price_monthly).toLocaleString('vi-VN')}₫
                                                            <span className="text-xs font-normal text-gray-500">/tháng</span>
                                                        </div>
                                                    ) : prog.pricing_type === 'lump_sum' && prog.price_one_time ? (
                                                        <div className="text-lg font-bold text-black">
                                                            {Number(prog.price_one_time).toLocaleString('vi-VN')}₫
                                                            <span className="text-xs font-normal text-gray-500"> 1 lần</span>
                                                        </div>
                                                    ) : prog.pricing_type === 'per_session' && prog.price_per_session ? (
                                                        <div className="text-lg font-bold text-black">
                                                            {Number(prog.price_per_session).toLocaleString('vi-VN')}₫
                                                            <span className="text-xs font-normal text-gray-500">/buổi</span>
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500 font-medium">Liên hệ báo giá</div>
                                                    )}
                                                </div>
                                                <button onClick={() => handleSubscribe(prog.id)} disabled={subscribing === prog.id} className="btn-primary px-5">
                                                    {subscribing === prog.id ? '...' : 'Đăng ký'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {beforeAfterPhotos.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Kết quả đạt được</h2>
                                <div className="grid gap-6 md:grid-cols-2">
                                    {beforeAfterPhotos.map((photo) => (
                                        <div key={photo.id} className="border border-gray-200 rounded-sm p-4">
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1 uppercase font-medium">Trước</div>
                                                    <img src={photo.before_url} alt="Before" className="w-full h-40 object-cover rounded border border-gray-200" />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500 mb-1 uppercase font-medium">Sau</div>
                                                    <img src={photo.after_url} alt="After" className="w-full h-40 object-cover rounded border border-gray-200" />
                                                </div>
                                            </div>
                                            {photo.client_name && <div className="text-sm font-medium text-gray-800 mb-1">{photo.client_name}</div>}
                                            {photo.duration_weeks && <div className="text-xs text-gray-500 mb-2">Thời gian: {photo.duration_weeks} tuần</div>}
                                            {photo.story && <p className="text-sm text-gray-600 leading-relaxed">{photo.story}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(premium?.mediaFeatures?.length || 0) > 0 && (
                            <div className="card">
                                <h2 className="card-header">Featured Media</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {premium!.mediaFeatures!.map((media) => (
                                        <a
                                            key={media.id}
                                            href={media.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="block border border-gray-200 rounded-sm overflow-hidden hover:border-black transition-colors"
                                        >
                                            <div className="aspect-video bg-gray-100">
                                                <img src={media.thumbnail_url || media.url} alt={media.caption || media.media_type} className="w-full h-full object-cover" />
                                            </div>
                                            {media.caption && <p className="text-sm text-gray-700 px-3 py-2 border-t border-gray-100">{media.caption}</p>}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(premium?.pressMentions?.length || 0) > 0 && (
                            <div className="card">
                                <h2 className="card-header">Báo chí nhắc đến</h2>
                                <div className="space-y-3">
                                    {premium!.pressMentions!.map((press) => (
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

                        {testimonials.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Đánh giá từ học viên</h2>
                                <div className="grid gap-4 md:grid-cols-2">
                                    {testimonials.map((testimonial) => (
                                        <div key={testimonial.id} className="border border-gray-200 rounded-sm p-4">
                                            <div className="flex items-start gap-3 mb-3">
                                                {testimonial.client_avatar ? (
                                                    <img src={testimonial.client_avatar} alt={testimonial.client_name} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                                                        {testimonial.client_name.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <div className="font-bold text-sm">{testimonial.client_name}</div>
                                                    <div className="text-yellow-500 text-sm">{'⭐'.repeat(testimonial.rating)}</div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 leading-relaxed">{testimonial.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {similarCoaches.length > 0 && (
                            <div className="card">
                                <h2 className="card-header">Huấn luyện viên tương tự</h2>
                                <div className="grid gap-4 md:grid-cols-3">
                                    {similarCoaches.map((coach) => {
                                        const link = coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`;
                                        return (
                                            <Link to={link} key={coach.id} className="border border-gray-200 rounded-sm p-4 hover:border-black transition-colors">
                                                <div className="flex flex-col items-center text-center">
                                                    {coach.avatar_url ? (
                                                        <img src={coach.avatar_url} alt={coach.full_name} className="w-20 h-20 rounded-full object-cover border border-gray-200 mb-3" />
                                                    ) : (
                                                        <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xl font-bold mb-3">
                                                            {coach.full_name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <h3 className="font-bold text-base mb-1">{coach.full_name}</h3>
                                                    {coach.specialties && coach.specialties.length > 0 && (
                                                        <div className="flex flex-wrap justify-center gap-1 mb-2">
                                                            {coach.specialties.slice(0, 2).map((s: string) => (
                                                                <span key={s} className="text-xs bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-200">{s}</span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {coach.base_price_monthly && (
                                                        <div className="text-sm font-bold text-black mt-2">
                                                            {Number(coach.base_price_monthly).toLocaleString('vi-VN')}₫<span className="text-xs font-normal">/tháng</span>
                                                        </div>
                                                    )}
                                                    <div className="btn-secondary w-full mt-3 text-sm text-center">Xem chi tiết</div>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>

            {pendingPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold">Thanh Toán Gói Tập</h3>
                            <button onClick={() => setPendingPayment(null)} className="text-gray-400 hover:text-black">✕</button>
                        </div>
                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-600">Vui lòng chuyển khoản với nội dung chính xác dưới đây để hệ thống duyệt tự động.</p>
                            <img
                                src={`https://img.vietqr.io/image/970436-0987654321-compact2.png?amount=${pendingPayment.amount}&addInfo=${encodeURIComponent(pendingPayment.transfer_content)}&accountName=GYMERVIET`}
                                alt="QR Code"
                                className="mx-auto border border-gray-200 rounded-md w-48 h-48 object-contain"
                            />
                            <div className="bg-gray-50 p-4 rounded-md text-left text-sm space-y-2 font-mono">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số tiền:</span>
                                    <span className="font-bold text-black">{pendingPayment.amount.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Nội dung:</span>
                                    <span className="font-bold text-black border-b border-black">{pendingPayment.transfer_content}</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleCheckPayment} disabled={checkingStatus} className="btn-primary w-full">
                            {checkingStatus ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
