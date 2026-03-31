import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { logger } from '../lib/logger';
import { trackEvent } from '../lib/analytics';
import apiClient from '../services/api';
import type { Trainer, GymCenter } from '../types';
import { usePrefetchProfile } from '../hooks/usePrefetchProfile';
import { CoachSpotlightCard } from '../components/home/CoachSpotlightCard';
import { ProfileGridCard } from '../components/home/ProfileGridCard';
import type { ProfileGridItem } from '../components/home/ProfileGridCard';
import { trainerToGridItem, gymToGridItem, buildHomeFeed } from '../components/home/homeFeedUtils';
import { gymService } from '../services/gymService';
import { FAQAccordion } from '../components/FAQAccordion';
import { HOME_FAQ_PREVIEW_ITEMS } from '../data/faqData';
import { SITE_OG_IMAGE, SITE_ORIGIN, SITE_TWITTER_HANDLE } from '../lib/site';

type FeaturedTrainer = Trainer & {
    is_verified?: boolean;
    created_at?: string;
    slug?: string;
    user_type?: string;
};

const AUDIENCE_PILLARS = [
    {
        kicker: 'Người tập',
        title: 'Tìm huấn luyện viên và phòng tập đúng với mục tiêu của bạn.',
        body: 'Xem hồ sơ thật, mức giá và khu vực; đọc tin & kiến thức tập luyện — không cần nhảy qua nhiều trang lạ.',
        href: '/coaches',
        cta: 'Tìm huấn luyện viên',
    },
    {
        kicker: 'Huấn luyện viên',
        title: 'Thu hút học viên mới, hồ sơ gọn và dễ tìm.',
        body: 'Trưng bày chuyên môn, giá và lịch; để người tập hiểu bạn là ai trước khi nhắn tin hay liên hệ.',
        href: '/register',
        cta: 'Trở thành huấn luyện viên',
    },
    {
        kicker: 'Chủ phòng tập',
        title: 'Đưa phòng tập lên bản đồ tìm kiếm của người tập.',
        body: 'Giới thiệu không gian, chi nhánh và giá khởi điểm rõ ràng — giúp khách mới so sánh và chọn nhanh hơn.',
        href: '/register?role=gym_owner',
        cta: 'Đăng ký đối tác',
    },
] as const;

const CATEGORY_CHIPS = [
    { label: 'Tất cả', href: '/coaches' },
    { label: 'Huấn luyện cá nhân', href: '/coaches?specialty=personal+training' },
    { label: 'Yoga', href: '/coaches?specialty=yoga' },
    { label: 'Calisthenics', href: '/coaches?specialty=calisthenics' },
    { label: 'Quyền anh', href: '/coaches?specialty=boxing' },
    { label: 'Pilates', href: '/coaches?specialty=pilates' },
    { label: 'Phòng tập gần tôi', href: '/gyms' },
] as const;

export default function Home() {
    const [coaches, setCoaches] = useState<FeaturedTrainer[]>([]);
    const [gyms, setGyms] = useState<GymCenter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [spotlightIndex, setSpotlightIndex] = useState(0);
    const { prefetchCoach, prefetchAthlete } = usePrefetchProfile();
    const canonicalBase = SITE_ORIGIN;

    const fetchData = useCallback(() => {
        setIsLoading(true);
        setLoadError(false);

        Promise.all([
            apiClient.get('/users/trainers').then((res) => res.data?.data?.trainers || []),
            gymService.listMarketplaceGyms({ limit: 20, lite: true })
                .then((res) => res?.gyms || [])
                .catch(() => [] as GymCenter[]),
        ])
            .then(([trainers, gymList]) => {
                setCoaches(trainers);
                setGyms(gymList);
            })
            .catch((err) => {
                logger.error(err);
                setLoadError(true);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        void import('./CoachDetailPage');
    }, []);

    // ── Data processing ────────────────────────────

    const worthyCoaches = useMemo(
        () => [...coaches]
            .filter(c => c.avatar_url && c.bio && c.bio.length > 30)
            .sort((a, b) => {
                if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
                if (!!a.avatar_url !== !!b.avatar_url) return a.avatar_url ? -1 : 1;
                return (b.created_at || '').localeCompare(a.created_at || '');
            }),
        [coaches]
    );

    const spotlightCoach = useMemo(
        () => (worthyCoaches.length > 0 ? worthyCoaches[spotlightIndex % worthyCoaches.length] : null),
        [worthyCoaches, spotlightIndex]
    );

    // Build mixed profile feed
    const feedItems = useMemo(() => {
        const coachItems = coaches.map(trainerToGridItem).filter(Boolean) as ProfileGridItem[];
        const gymItems = gyms.map(gymToGridItem).filter(Boolean) as ProfileGridItem[];
        return buildHomeFeed(coachItems, gymItems, 12);
    }, [coaches, gyms]);

    // Trust stats
    const totalCoaches = coaches.length;
    const totalGyms = gyms.length;

    const handleNextCoach = () => {
        setSpotlightIndex(prev => prev + 1);
    };

    const handlePrefetch = useCallback((coach: FeaturedTrainer) => {
        const identifier = coach.slug || coach.id;
        if (!identifier) return;

        if (coach.user_type === 'athlete') {
            prefetchAthlete(identifier);
            return;
        }

        prefetchCoach(identifier);
    }, [prefetchAthlete, prefetchCoach]);

    const handleCardHover = useCallback((item: ProfileGridItem) => {
        const identifier = item.slug || item.id;
        if (!identifier) return;
        if (item.kind === 'athlete') prefetchAthlete(identifier);
        else if (item.kind === 'coach') prefetchCoach(identifier);
    }, [prefetchAthlete, prefetchCoach]);

    useEffect(() => {
        if (spotlightCoach) {
            handlePrefetch(spotlightCoach);
        }
    }, [handlePrefetch, spotlightCoach]);

    const trackHomeCta = (ctaId: string, target: string) => {
        trackEvent('homepage_cta_click', {
            cta_id: ctaId,
            target,
        });
    };

    return (
        <main className="marketplace-shell min-h-screen">
            <Helmet>
                <title>GYMERVIET — Tìm huấn luyện viên, phòng tập và kiến thức thể hình</title>
                <meta
                    name="description"
                    content="Khám phá huấn luyện viên và phòng tập có hồ sơ rõ ràng, so sánh giá và địa điểm. Đọc tin tập luyện và tạo tài khoản miễn phí trên GYMERVIET."
                />
                <link rel="canonical" href={canonicalBase} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="GYMERVIET — Tìm huấn luyện viên, phòng tập và kiến thức thể hình" />
                <meta
                    property="og:description"
                    content="Xem hồ sơ thật, so sánh giá và địa điểm. Một nơi cho người tập, huấn luyện viên và phòng tập tại Việt Nam."
                />
                <meta property="og:url" content={canonicalBase} />
                <meta property="og:image" content={SITE_OG_IMAGE} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
                <meta name="twitter:title" content="GYMERVIET — Tìm huấn luyện viên, phòng tập và kiến thức thể hình" />
                <meta
                    name="twitter:description"
                    content="Khám phá huấn luyện viên và phòng tập, đọc tin tập luyện và bắt đầu miễn phí."
                />
                <meta name="twitter:image" content={SITE_OG_IMAGE} />
                <script
                    type="application/ld+json"
                >{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: 'GYMERVIET',
                    url: canonicalBase,
                    potentialAction: {
                        '@type': 'SearchAction',
                        target: {
                            '@type': 'EntryPoint',
                            urlTemplate: `${canonicalBase}/coaches?q={search_term_string}`,
                        },
                        'query-input': 'required name=search_term_string',
                    },
                })}</script>
                <script
                    type="application/ld+json"
                >{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Organization',
                    name: 'GYMERVIET',
                    url: canonicalBase,
                    logo: `${canonicalBase}/logo.png`,
                    sameAs: ['https://www.facebook.com/gymerviet'],
                })}</script>
            </Helmet>

            {/* ── §1 COMPACT HERO ─────────────────────────────────── */}
            <section className="marketplace-hero home-hero">
                <div className="marketplace-container">
                    <div className="max-w-2xl space-y-4 lg:space-y-5">
                        <span className="marketplace-eyebrow">Tập đúng người · đúng chỗ</span>
                        <h1 className="marketplace-title text-balance">
                            Tìm huấn luyện viên, chọn phòng tập — tất cả trên một nền tảng.
                        </h1>
                        <p className="marketplace-lead max-w-xl">
                            Xem hồ sơ thật, so sánh giá và khu vực — rồi chọn huấn luyện viên hay phòng tập phù hợp với bạn.
                        </p>
                        <div
                            className="-mx-1 flex flex-row flex-nowrap items-stretch gap-2 overflow-x-auto scroll-x-hidden scroll-smooth px-1 sm:gap-3"
                            role="group"
                            aria-label="Lối vào nhanh"
                        >
                            <Link
                                to="/coaches"
                                onClick={() => trackHomeCta('hero_coaches', '/coaches')}
                                className="btn-primary shrink-0 whitespace-nowrap px-3 py-2.5 text-xs font-bold uppercase tracking-[0.14em] sm:px-6 sm:py-3 sm:tracking-[0.16em]"
                            >
                                Tìm huấn luyện viên
                            </Link>
                            <Link
                                to="/gyms"
                                onClick={() => trackHomeCta('hero_gyms', '/gyms')}
                                className="btn-secondary shrink-0 whitespace-nowrap px-3 py-2.5 text-xs font-bold uppercase tracking-[0.14em] sm:px-6 sm:py-3 sm:tracking-[0.16em]"
                            >
                                Tìm phòng tập
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => trackHomeCta('hero_register', '/register')}
                                className="btn-secondary shrink-0 whitespace-nowrap px-3 py-2.5 text-xs font-bold uppercase tracking-[0.14em] sm:px-6 sm:py-3 sm:tracking-[0.16em]"
                            >
                                Tạo tài khoản
                            </Link>
                        </div>
                    </div>

                    {/* ── Trust bar ──── */}
                    {!isLoading && !loadError && (totalCoaches > 0 || totalGyms > 0) && (
                        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold text-gray-500">
                            {totalCoaches > 0 && (
                                <span>{totalCoaches}+ huấn luyện viên</span>
                            )}
                            {totalGyms > 0 && (
                                <span>{totalGyms}+ Phòng tập</span>
                            )}
                            <span>Miễn phí tham gia</span>
                        </div>
                    )}
                </div>
            </section>

            {/* ── §2 FEATURED SPOTLIGHT ────────────────────────────── */}
            <section className="marketplace-container mt-6 lg:mt-8">
                {isLoading ? (
                    <div className="marketplace-panel gv-panel-pad shadow-sm ring-1 ring-gray-900/[0.06]">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 w-32 rounded bg-gray-200" />
                            <div className="flex gap-4">
                                <div className="h-24 w-24 rounded-lg bg-gray-200 shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-40 rounded bg-gray-200" />
                                    <div className="h-4 w-32 rounded bg-gray-200" />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : loadError ? (
                    <div className="marketplace-panel gv-panel-pad flex flex-col items-center gap-4 py-10 text-center shadow-sm ring-1 ring-gray-900/[0.06]">
                        <AlertCircle className="h-8 w-8 text-gray-400" aria-hidden />
                        <div>
                            <p className="text-sm font-semibold text-gray-700">Không tải được dữ liệu</p>
                            <p className="mt-1 text-xs text-gray-500">Vui lòng kiểm tra kết nối và thử lại.</p>
                        </div>
                        <button
                            type="button"
                            onClick={fetchData}
                            className="btn-secondary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold"
                        >
                            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                            Thử lại
                        </button>
                    </div>
                ) : spotlightCoach ? (
                    <CoachSpotlightCard
                        coach={spotlightCoach}
                        currentIndex={spotlightIndex}
                        totalCount={worthyCoaches.length}
                        onNext={handleNextCoach}
                        onPrefetch={handlePrefetch}
                    />
                ) : null}
            </section>

            {/* ── §3 CATEGORY QUICK-NAV ───────────────────────────── */}
            <section className="marketplace-container mt-6 lg:mt-8" aria-label="Danh mục nhanh">
                <div className="-mx-1 flex flex-nowrap items-center gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {CATEGORY_CHIPS.map((chip) => (
                        <Link
                            key={chip.label}
                            to={chip.href}
                            onClick={() => trackHomeCta(`chip_${chip.label}`, chip.href)}
                            className="shrink-0 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-700 transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                        >
                            {chip.label}
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── §4 DYNAMIC PROFILE GRID ─────────────────────────── */}
            <section className="marketplace-container mt-6 lg:mt-8" aria-labelledby="home-profiles-heading">
                <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                        <div className="marketplace-section-kicker">Khám phá</div>
                        <h2 id="home-profiles-heading" className="marketplace-section-title">Huấn luyện viên, phòng tập và thành viên</h2>
                    </div>
                    <Link
                        to="/coaches"
                        className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-gray-900 hover:underline underline-offset-4"
                    >
                        Xem tất cả →
                    </Link>
                </div>

                {isLoading ? (
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-white">
                                <div className="aspect-[4/5] bg-gray-100 rounded-t-lg" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 w-20 rounded bg-gray-200" />
                                    <div className="h-3 w-28 rounded bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : feedItems.length > 0 ? (
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {feedItems.map((item, i) => (
                            <ProfileGridCard
                                key={item.id}
                                item={item}
                                priority={i < 4}
                                onHover={handleCardHover}
                            />
                        ))}
                    </div>
                ) : !loadError ? (
                    <div className="marketplace-panel gv-panel-pad text-center py-10">
                        <p className="text-sm text-gray-500">Chưa có hồ sơ nào. Hãy quay lại sau.</p>
                    </div>
                ) : null}
            </section>

            {/* ── §5 AUDIENCE PILLARS (moved down) ────────────────── */}
            <section id="ba-vai-tro" className="marketplace-container mt-10 scroll-mt-[calc(var(--header-height,56px)+1rem)] lg:mt-14">
                <div className="space-y-3">
                    <div className="marketplace-section-kicker">Ba nhóm chính</div>
                    <h2 className="marketplace-section-title">
                        Bạn là người tập, huấn luyện viên hay chủ phòng tập?
                    </h2>
                    <p className="marketplace-lead max-w-3xl">
                        Mỗi nhóm có lối vào riêng — chọn đúng chỗ để bắt đầu nhanh.
                    </p>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {AUDIENCE_PILLARS.map((item) => (
                        <Link
                            key={item.title}
                            to={item.href}
                            onClick={() => trackHomeCta(`audience_${item.kicker.toLowerCase()}`, item.href)}
                            className="marketplace-panel gv-panel-pad group flex h-full flex-col gap-5 shadow-sm ring-1 ring-gray-900/[0.05] transition duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.12)]"
                        >
                            <div className="space-y-3">
                                <div className="marketplace-section-kicker">{item.kicker}</div>
                                <h3 className="text-[1.3rem] font-bold leading-[1.18] tracking-[-0.04em] text-gray-900">
                                    {item.title}
                                </h3>
                                <p className="text-sm leading-7 text-gray-600">
                                    {item.body}
                                </p>
                            </div>
                            <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-gray-900 transition-transform group-hover:translate-x-1">
                                {item.cta} →
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── §6 FAQ ──────────────────────────────────────────── */}
            <section className="marketplace-container gv-section-gap" aria-labelledby="home-faq-heading">
                <div className="marketplace-panel gv-panel-pad shadow-sm ring-1 ring-gray-900/[0.05]">
                    <div className="max-w-3xl">
                        <div className="marketplace-section-kicker">Câu hỏi nhanh</div>
                        <h2 id="home-faq-heading" className="marketplace-section-title mt-2">
                            Trước khi bạn bắt đầu
                        </h2>
                        <div className="mt-6">
                            <FAQAccordion items={HOME_FAQ_PREVIEW_ITEMS} />
                        </div>
                        <div className="mt-6 border-t border-gray-200 pt-5">
                            <Link
                                to="/faq"
                                onClick={() => trackHomeCta('faq_more', '/faq')}
                                className="text-sm font-bold uppercase tracking-[0.14em] text-gray-900 hover:underline underline-offset-4"
                            >
                                Xem thêm câu hỏi thường gặp →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── §7 FOOTER CTA BANNER ────────────────────────────── */}
            <section className="marketplace-container gv-section-gap pb-10 lg:pb-14">
                <div className="rounded-lg bg-gray-900 px-6 py-8 text-center sm:px-10 sm:py-10">
                    <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
                        Bạn là huấn luyện viên hoặc chủ phòng tập?
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                        Đưa hồ sơ lên nền tảng, để người tập tìm thấy bạn. Hoàn toàn miễn phí.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            to="/register"
                            onClick={() => trackHomeCta('footer_register', '/register')}
                            className="inline-flex items-center rounded-lg bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-gray-900 shadow-sm transition hover:bg-gray-100"
                        >
                            Đăng ký miễn phí
                        </Link>
                        <Link
                            to="/pricing"
                            onClick={() => trackHomeCta('footer_pricing', '/pricing')}
                            className="inline-flex items-center rounded-lg border border-white/20 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:border-white/40 hover:bg-white/5"
                        >
                            Tìm hiểu thêm
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
