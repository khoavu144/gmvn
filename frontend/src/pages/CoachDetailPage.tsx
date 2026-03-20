import { useState, useEffect, useRef, useMemo } from 'react';
import type { GymTrainerLink } from '../types';
import { logger } from '../lib/logger';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useToast } from '../components/Toast';
import '../styles/coachProfile.css';
import { Skeleton } from '../components/ui/Skeleton';

// Layout / sidebar
import ProfileSidebar from '../components/profile/ProfileSidebar';
import CoachMobileNav from '../components/profile/CoachMobileNav';

// Phase 3: New section components
import ProfileHeroSection from '../components/profile/ProfileHeroSection';
import ProfileServicesSection from '../components/profile/ProfileServicesSection';
import ProfileExperienceSection from '../components/profile/ProfileExperienceSection';
import ProfilePricingSection from '../components/profile/ProfilePricingSection';
import ProfileContactSection from '../components/profile/ProfileContactSection';

// Reused components
import CoachResultsShowcase from '../components/coach-flagship/CoachResultsShowcase';
import CoachTestimonialsWall from '../components/coach-flagship/CoachTestimonialsWall';
import CoachRelatedFooter from '../components/coach-flagship/CoachRelatedFooter';
import ShareButton from '../components/ShareButton';
import { buildProfileShareUrl } from '../utils/share';

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
    const paymentCloseRef = useRef<HTMLButtonElement>(null);

    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [_gymLinks, setGymLinks] = useState<GymTrainerLink[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [beforeAfterPhotos, setBeforeAfterPhotos] = useState<any[]>([]);
    const [similarCoaches, setSimilarCoaches] = useState<SimilarCoach[]>([]);
    const [premium, setPremium] = useState<PremiumPayload | null>(null);
    const [trainerProfile, setTrainerProfile] = useState<any>(null);
    const [profileSkillsData, setProfileSkillsData] = useState<any[]>([]);
    const [profileExperienceData, setProfileExperienceData] = useState<any[]>([]);
    const [profilePackagesData, setProfilePackagesData] = useState<any[]>([]);
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
                setTrainerProfile(profileData || null);
                setProfileSkillsData(profileRes?.data?.skills || []);
                setProfileExperienceData(profileRes?.data?.experience || []);
                setProfilePackagesData(profileRes?.data?.packages || []);
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

    // FIX: Escape key closes payment modal
    useEffect(() => {
        if (!pendingPayment) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setPendingPayment(null);
        };
        document.addEventListener('keydown', handleKeyDown);
        // FIX: move focus into modal when opened
        paymentCloseRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [pendingPayment]);

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

    const primaryCta = useMemo(() => {
        if (!user) return { text: 'Đăng nhập để đặt lịch', action: () => navigate('/login') };
        if (user.user_type === 'gym_owner') return { text: 'Mời về phòng tập', action: () => toast.success('Tính năng "Mời về phòng tập" đang được phát triển!') };
        return { text: 'Đặt lịch tập', action: () => {
            const el = document.getElementById('section-packages');
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } };
    }, [user, navigate, toast]);

    const secondaryCta = { text: 'Nhắn tin để tư vấn', action: handleMessage };

    const BASE_URL = import.meta.env.VITE_CANONICAL_BASE_URL ?? 'https://gymerviet.com';
    const canonicalPath = trainer?.slug ? `/coach/${trainer.slug}` : `/coaches/${trainerId ?? ''}`;
    const canonicalUrl = `${BASE_URL}${canonicalPath}`;
    const shareIdentifier = trainer?.slug ?? trainer?.id ?? slug ?? trainerId ?? '';
    const shareUrl = shareIdentifier ? buildProfileShareUrl('coach', shareIdentifier) : canonicalUrl;

    const seoTitle = useMemo(() => {
        if (!trainer?.full_name) return 'Coach Detail | GYMERVIET';
        return `${trainer.full_name} — Huấn luyện viên GYMERVIET`;
    }, [trainer?.full_name]);

    const seoDescription = useMemo(() => {
        if (trainer?.bio) return trainer.bio.slice(0, 155);
        if (!trainer?.full_name) return 'Trang chi tiết huấn luyện viên tại GYMERVIET.';
        return `${trainer.full_name} là huấn luyện viên được xác thực trên GYMERVIET.`;
    }, [trainer?.bio, trainer?.full_name]);

    // Derived data — must be computed unconditionally before any early returns (Rules of Hooks)
    const sidebarSocialLinks = useMemo(() => {
        try {
            const sl = trainerProfile?.social_links;
            return (sl !== null && sl !== undefined && typeof sl === 'object') ? sl : {};
        } catch { return {}; }
    }, [trainerProfile?.social_links]);
    const profileSkills = useMemo(() => profileSkillsData, [profileSkillsData]);
    const profileExperiences = useMemo(() => profileExperienceData, [profileExperienceData]);
    const profilePackages = useMemo(
        () => profilePackagesData.length > 0 ? profilePackagesData : programs,
        [profilePackagesData, programs]
    );
    const profileCerts: never[] = [];
    const profileAwards: never[] = [];

    // Loading skeleton — section-aware
    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
                    <div className="flex gap-10">
                        <div className="flex-1">
                            <Skeleton className="h-[28rem] w-full rounded-3xl" />
                        </div>
                        <div className="w-[320px] hidden lg:block">
                            <Skeleton className="h-[28rem] w-full rounded-3xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!trainer) {
        return (
            <div className="min-h-screen bg-[color:var(--mk-paper)] flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="text-5xl font-extrabold text-gray-100 mb-2">404</div>
                <div className="text-[color:var(--mk-text)] font-bold text-lg">Không tìm thấy Hồ sơ</div>
                <p className="text-sm text-[color:var(--mk-muted)] max-w-sm">Người dùng này có thể đã thay đổi URL hoặc không còn hoạt động trên GYMERVIET.</p>
                {/* FIX: use Link not <a href> for SPA-smooth navigation */}
                <Link to="/coaches" className="btn-primary mt-4 px-6">← Về trang khám phá</Link>
            </div>
        );
    }

    return (
        <div className="coach-profile-page">
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
                {trainer.avatar_url && <meta property="og:image" content={trainer.avatar_url} />}
                {trainer.avatar_url && <meta property="og:image:width" content="400" />}
                {trainer.avatar_url && <meta property="og:image:height" content="400" />}
                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@gymerviet" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {trainer.avatar_url && <meta name="twitter:image" content={trainer.avatar_url} />}
                {/* JSON-LD: Person */}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Person',
                    name: trainer.full_name,
                    jobTitle: (trainer as any).headline || 'Huấn luyện viên cá nhân',
                    description: seoDescription,
                    image: trainer.avatar_url || undefined,
                    url: canonicalUrl,
                    knowsAbout: (trainer.specialties as string[] | undefined) ?? [],
                    worksFor: { '@type': 'Organization', name: 'GYMERVIET', url: 'https://gymerviet.com' },
                })}</script>
                {/* JSON-LD: BreadcrumbList */}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement: [
                        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://gymerviet.com' },
                        { '@type': 'ListItem', position: 2, name: 'Coach', item: 'https://gymerviet.com/coaches' },
                        { '@type': 'ListItem', position: 3, name: trainer.full_name },
                    ],
                })}</script>
            </Helmet>


            {ToastComponent}

            {/* Mobile sticky nav (visible only < 1024px) */}
            <CoachMobileNav name={trainer.full_name} onMessage={handleMessage} primaryCta={primaryCta} />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-0">
                <div className="flex items-center justify-end">
                    <ShareButton
                        url={shareUrl}
                        title={seoTitle}
                        text={seoDescription}
                        label="Chia sẻ Facebook"
                        variant="facebook"
                        titleAttr="Chia sẻ hồ sơ này lên Facebook"
                        className="bg-white"
                    />
                </div>
            </div>

            {/* Main layout: sidebar + content */}
            <div className="coach-profile-layout">

                {/* Sidebar (hidden on mobile) */}
                <ProfileSidebar
                    name={trainer.full_name}
                    avatarUrl={trainer.avatar_url}
                    headline={trainerProfile?.headline || trainer.specialties?.[0] || null}
                    isVerified={trainer.is_verified}
                    isAcceptingClients={trainerProfile?.is_accepting_clients ?? true}
                    socialLinks={sidebarSocialLinks}
                    location={trainerProfile?.location || null}
                    onContactClick={handleMessage}
                    primaryCta={primaryCta}
                    secondaryCta={secondaryCta}
                />

                {/* Scrollable main content */}
                <main className="coach-profile-main">

                    {/* §1 Hero / About */}
                    <div id="section-about" className="profile-section-anchor">
                        <ProfileHeroSection
                            name={trainer.full_name}
                            headline={trainerProfile?.headline || null}
                            location={trainerProfile?.location || null}
                            avatarUrl={trainer.avatar_url}
                            specialties={trainer.specialties}
                            bio={trainer.bio}
                            bioLong={trainerProfile?.bio_long || null}
                            isVerified={trainer.is_verified}
                            tagline={premium?.hero?.tagline}
                            metrics={premium?.hero?.metrics}
                            highlights={premium?.highlights || []}
                            basePriceMonthly={trainer.base_price_monthly}
                            onMessage={handleMessage}
                            primaryCta={primaryCta}
                            secondaryCta={secondaryCta}
                        />
                    </div>

                    {/* §2 Services / Skills */}
                    <div id="section-services" className="profile-section-anchor">
                        <ProfileServicesSection
                            skills={profileSkills}
                        />
                    </div>

                    {/* §3 Gallery / Results */}
                    <div id="section-gallery" className="profile-section-anchor">
                        <CoachResultsShowcase photos={beforeAfterPhotos} />
                    </div>

                    {/* §4 Experience / Timeline */}
                    <div id="section-experience" className="profile-section-anchor">
                        <ProfileExperienceSection
                            experiences={profileExperiences}
                            certifications={profileCerts}
                            awards={profileAwards}
                            yearsExperience={trainerProfile?.years_experience || null}
                        />
                    </div>

                    {/* §5 Packages / Pricing */}
                    <div id="section-packages" className="profile-section-anchor">
                        <ProfilePricingSection
                            packages={profilePackages}
                            subscribing={subscribing}
                            onSubscribe={handleSubscribe}
                        />
                    </div>

                    {/* §6 Testimonials */}
                    <div id="section-testimonials" className="profile-section-anchor">
                        <CoachTestimonialsWall testimonials={testimonials} />
                    </div>

                    {/* §7 Contact */}
                    <div id="section-contact" className="profile-section-anchor">
                        <ProfileContactSection
                            coachName={trainer.full_name}
                            location={trainerProfile?.location || null}
                            socialLinks={sidebarSocialLinks}
                            onMessage={handleMessage}
                            primaryCta={primaryCta}
                        />
                    </div>

                    {/* Related Coaches (full-width below) */}
                    <CoachRelatedFooter coaches={similarCoaches} />

                </main>
            </div>

            {/* Payment Modal — FIX: proper dialog semantics + focus management */}
            {pendingPayment && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="payment-dialog-title"
                >
                    <div className="bg-white rounded-xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-md">
                        <div className="flex justify-between items-center border-b border-[color:var(--mk-line)] pb-4">
                            <h3 id="payment-dialog-title" className="text-xl font-extrabold">Thanh Toán</h3>
                            <button
                                ref={paymentCloseRef}
                                onClick={() => setPendingPayment(null)}
                                className="text-[color:var(--mk-muted)] hover:text-black text-lg"
                                aria-label="Đóng hộp thoại thanh toán"
                            >✕</button>
                        </div>
                        <div className="text-center space-y-4">
                            <p className="text-sm text-[color:var(--mk-text-soft)]">Chuyển khoản với nội dung chính xác bên dưới.</p>
                            <img
                                src={`https://img.vietqr.io/image/970436-${import.meta.env.VITE_PLATFORM_BANK_ACCOUNT || '0987654321'}-compact2.png?amount=${pendingPayment.amount}&addInfo=${encodeURIComponent(pendingPayment.transfer_content)}&accountName=GYMERVIET`}
                                alt="QR Code"
                                className="mx-auto border border-[color:var(--mk-line)] rounded-lg w-48 h-48 object-contain"
                            />
                            <div className="bg-[color:var(--mk-paper)] p-4 rounded-lg text-left text-sm space-y-2 font-mono">
                                <div className="flex justify-between">
                                    <span className="text-[color:var(--mk-muted)]">Số tiền:</span>
                                    <span className="font-bold text-black">{pendingPayment.amount.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[color:var(--mk-muted)]">Nội dung:</span>
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
