import { useState, useEffect, useMemo } from 'react';
import type { GymTrainerLink } from '../types';
import { logger } from '../lib/logger';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useToast } from '../components/Toast';

// Flagship components
import CoachHeroFlagship from '../components/coach-flagship/CoachHeroFlagship';
import CoachTrustRibbon from '../components/coach-flagship/CoachTrustRibbon';
import CoachMobileStickyCta from '../components/coach-flagship/CoachMobileStickyCta';
import CoachResultsShowcase from '../components/coach-flagship/CoachResultsShowcase';
import CoachMethodSection from '../components/coach-flagship/CoachMethodSection';
import CoachOffersFlagship from '../components/coach-flagship/CoachOffersFlagship';
import CoachTestimonialsWall from '../components/coach-flagship/CoachTestimonialsWall';
import CoachAuthoritySection from '../components/coach-flagship/CoachAuthoritySection';
import CoachClosingCta from '../components/coach-flagship/CoachClosingCta';
import CoachRelatedFooter from '../components/coach-flagship/CoachRelatedFooter';

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

                // If this user is an athlete, redirect to the canonical athlete URL
                if (trainerData?.user_type === 'athlete') {
                    const athleteSlug = profileData?.slug || trainerData?.slug || slug;
                    const athleteRoute = athleteSlug
                        ? `/athlete/${athleteSlug}`
                        : `/athletes/${resolvedTrainerId}`;
                    navigate(athleteRoute, { replace: true });
                    return;
                }

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
        navigate(`/messages?to=${trainer?.id}`);
    };

    const canonicalPath = trainer?.slug ? `/coach/${trainer.slug}` : `/coaches/${trainerId ?? ''}`;
    const canonicalUrl = `${window.location.origin}${canonicalPath}`;

    const seoTitle = useMemo(() => {
        if (!trainer?.full_name) return 'Coach Detail | GYMERVIET';
        return `${trainer.full_name} — GYMERVIET Coach`;
    }, [trainer?.full_name]);

    const seoDescription = useMemo(() => {
        if (trainer?.bio) return trainer.bio.slice(0, 155);
        if (!trainer?.full_name) return 'Trang chi tiết huấn luyện viên tại GYMERVIET.';
        return `${trainer.full_name} là huấn luyện viên được xác thực trên GYMERVIET.`;
    }, [trainer?.bio, trainer?.full_name]);

    // Loading skeleton — section-aware
    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 animate-pulse">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-16">
                        <div className="space-y-6">
                            <div className="h-4 w-24 bg-white/10 rounded" />
                            <div className="h-14 w-3/4 bg-white/10 rounded" />
                            <div className="h-5 w-2/3 bg-white/5 rounded" />
                            <div className="flex gap-4 mt-8">
                                <div className="h-12 w-36 bg-white/10 rounded" />
                                <div className="h-12 w-32 bg-white/5 rounded" />
                            </div>
                        </div>
                        <div className="h-[400px] bg-white/5 rounded-lg" />
                    </div>
                </div>
                <div className="bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
                        <div className="flex gap-10 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gray-100 rounded" />
                                    <div className="space-y-1">
                                        <div className="h-2 w-12 bg-gray-100 rounded" />
                                        <div className="h-3 w-20 bg-gray-100 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="text-5xl font-extrabold text-gray-100 mb-2">404</div>
                <div className="text-gray-800 font-bold text-lg">Không tìm thấy Hồ sơ</div>
                <p className="text-sm text-gray-500 max-w-sm">Người dùng này có thể đã thay đổi URL hoặc không còn hoạt động trên GYMERVIET.</p>
                <a href="/coaches" className="btn-primary mt-4 px-6">← Về trang khám phá</a>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pb-20 lg:pb-0">
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

            {/* 1. Hero Promise */}
            <CoachHeroFlagship
                name={trainer.full_name}
                avatarUrl={trainer.avatar_url}
                specialties={trainer.specialties}
                bio={trainer.bio}
                isVerified={trainer.is_verified}
                tagline={premium?.hero?.tagline}
                metrics={premium?.hero?.metrics}
                basePriceMonthly={trainer.base_price_monthly}
                onMessage={handleMessage}
            />

            {/* 2. Trust Ribbon */}
            <CoachTrustRibbon
                isVerified={trainer.is_verified}
                basePriceMonthly={trainer.base_price_monthly}
                gymLinks={gymLinks}
                programCount={programs.length}
                specialties={trainer.specialties}
                testimonialCount={testimonials.length}
                beforeAfterCount={beforeAfterPhotos.length}
            />

            {/* 3. Transformation Proof (moved high) */}
            <CoachResultsShowcase photos={beforeAfterPhotos} />

            {/* 4. Coaching Method */}
            <CoachMethodSection
                bio={trainer.bio}
                specialties={trainer.specialties}
                highlights={premium?.highlights || []}
                gymCount={gymLinks.length}
            />

            {/* 5. Offer Architecture */}
            <CoachOffersFlagship
                programs={programs}
                subscribing={subscribing}
                onSubscribe={handleSubscribe}
            />

            {/* 6. Testimonials Wall */}
            <CoachTestimonialsWall testimonials={testimonials} />

            {/* 7. Authority Section */}
            <CoachAuthoritySection
                gymLinks={gymLinks}
                mediaFeatures={premium?.mediaFeatures || []}
                pressMentions={premium?.pressMentions || []}
            />

            {/* 8. Closing CTA */}
            <CoachClosingCta
                coachName={trainer.full_name}
                onMessage={handleMessage}
            />

            {/* 9. Related Coaches Footer */}
            <CoachRelatedFooter coaches={similarCoaches} />

            {/* Mobile Sticky CTA */}
            <CoachMobileStickyCta
                coachName={trainer.full_name}
                onMessage={handleMessage}
            />

            {/* Payment Modal */}
            {pendingPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-extrabold">Thanh Toán</h3>
                            <button onClick={() => setPendingPayment(null)} className="text-gray-400 hover:text-black text-lg">✕</button>
                        </div>
                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-600">Chuyển khoản với nội dung chính xác bên dưới.</p>
                            <img
                                src={`https://img.vietqr.io/image/970436-0987654321-compact2.png?amount=${pendingPayment.amount}&addInfo=${encodeURIComponent(pendingPayment.transfer_content)}&accountName=GYMERVIET`}
                                alt="QR Code"
                                className="mx-auto border border-gray-200 rounded-lg w-48 h-48 object-contain"
                            />
                            <div className="bg-gray-50 p-4 rounded-lg text-left text-sm space-y-2 font-mono">
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
                        <button onClick={handleCheckPayment} disabled={checkingStatus} className="btn-primary w-full py-3">
                            {checkingStatus ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
