import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { logger } from '../lib/logger';
import { trackEvent } from '../lib/analytics';
import apiClient from '../services/api';
import type { Trainer } from '../types';
import { usePrefetchProfile } from '../hooks/usePrefetchProfile';
import { CoachSpotlightCard } from '../components/home/CoachSpotlightCard';
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
        title: 'Tìm Coach và phòng tập đúng với mục tiêu của bạn.',
        body: 'Xem hồ sơ thật, mức giá và khu vực; đọc tin & kiến thức tập luyện — không cần nhảy qua nhiều trang lạ.',
        href: '/coaches',
        cta: 'Tìm Coach',
    },
    {
        kicker: 'Coach',
        title: 'Thu hút học viên mới, hồ sơ gọn và dễ tìm.',
        body: 'Trưng bày chuyên môn, giá và lịch; để người tập hiểu bạn là ai trước khi nhắn tin hay đăng ký gói.',
        href: '/register',
        cta: 'Trở thành Coach',
    },
    {
        kicker: 'Chủ phòng tập',
        title: 'Đưa phòng tập lên bản đồ tìm kiếm của người tập.',
        body: 'Giới thiệu không gian, chi nhánh và giá khởi điểm rõ ràng — giúp khách mới so sánh và chọn nhanh hơn.',
        href: '/gym-owner/register',
        cta: 'Đăng ký đối tác',
    },
] as const;


function coachLink(coach: FeaturedTrainer): string {
    if (coach.user_type === 'athlete') {
        return coach.slug ? `/athlete/${coach.slug}` : `/athletes/${coach.id}`;
    }

    return coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`;
}

export default function Home() {
    const [coaches, setCoaches] = useState<FeaturedTrainer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [spotlightIndex, setSpotlightIndex] = useState(0);
    const [faqSpotlightIndex, setFaqSpotlightIndex] = useState(1);
    const { prefetchCoach, prefetchAthlete } = usePrefetchProfile();
    const canonicalBase = SITE_ORIGIN;

    useEffect(() => {
        apiClient.get('/users/trainers')
            .then((res) => {
                if (res.data?.data?.trainers) {
                    setCoaches(res.data.data.trainers);
                }
            })
            .catch(logger.error)
            .finally(() => setIsLoading(false));
    }, []);

    const sorted = useMemo(
        () => [...coaches].sort((a, b) => {
            if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
            if (!!a.avatar_url !== !!b.avatar_url) return a.avatar_url ? -1 : 1;
            return (b.created_at || '').localeCompare(a.created_at || '');
        }),
        [coaches]
    );

    // Filter worthy coaches: must have avatar and bio
    const worthyCoaches = useMemo(
        () => sorted.filter(c => c.avatar_url && c.bio && c.bio.length > 30),
        [sorted]
    );

    const spotlightCoach = useMemo(
        () => (worthyCoaches.length > 0 ? worthyCoaches[spotlightIndex % worthyCoaches.length] : null),
        [worthyCoaches, spotlightIndex]
    );

    const faqSpotlightCoach = useMemo(
        () => (worthyCoaches.length > 0 ? worthyCoaches[faqSpotlightIndex % worthyCoaches.length] : null),
        [worthyCoaches, faqSpotlightIndex]
    );

    const handleNextCoach = () => {
        setSpotlightIndex(prev => prev + 1);
    };

    const handleNextFaqCoach = () => {
        setFaqSpotlightIndex(prev => prev + 1);
    };

    const handlePrefetch = (coach: FeaturedTrainer) => {
        const identifier = coach.slug || coach.id;
        if (!identifier) return;

        if (coach.user_type === 'athlete') {
            prefetchAthlete(identifier);
            return;
        }

        prefetchCoach(identifier);
    };

    const trackHomeCta = (ctaId: string, target: string) => {
        trackEvent('homepage_cta_click', {
            cta_id: ctaId,
            target,
        });
    };

    return (
        <main className="marketplace-shell min-h-screen">
            <Helmet>
                <title>GYMERVIET — Tìm Coach, phòng tập và kiến thức fitness</title>
                <meta
                    name="description"
                    content="Khám phá Coach và phòng tập có hồ sơ rõ ràng, so sánh giá và địa điểm. Đọc tin tập luyện và tạo tài khoản miễn phí trên GYMERVIET."
                />
                <link rel="canonical" href={canonicalBase} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="GYMERVIET — Tìm Coach, phòng tập và kiến thức fitness" />
                <meta
                    property="og:description"
                    content="Xem hồ sơ thật, so sánh giá và địa điểm. Một nơi cho người tập, Coach và phòng tập tại Việt Nam."
                />
                <meta property="og:url" content={canonicalBase} />
                <meta property="og:image" content={SITE_OG_IMAGE} />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
                <meta name="twitter:title" content="GYMERVIET — Tìm Coach, phòng tập và kiến thức fitness" />
                <meta
                    name="twitter:description"
                    content="Khám phá Coach và phòng tập, đọc tin tập luyện và bắt đầu miễn phí."
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

            <section className="marketplace-hero home-hero">
                <div className="marketplace-container">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:items-start lg:gap-10">
                        <div className="space-y-5 lg:max-w-[40rem] lg:pt-1">
                            <span className="marketplace-eyebrow">Tập đúng người · đúng chỗ</span>
                            <h1 className="marketplace-title max-w-4xl text-balance">
                                Tìm Coach, chọn phòng tập — tất cả trên một nền tảng.
                            </h1>
                            <p className="marketplace-lead max-w-2xl">
                                Xem hồ sơ thật, so sánh giá và khu vực — rồi chọn Coach hay phòng tập phù hợp với bạn.
                            </p>
                            <div
                                className="-mx-1 flex flex-row flex-nowrap items-stretch gap-2 overflow-x-auto scroll-x-hidden scroll-smooth px-1 sm:gap-3"
                                role="group"
                                aria-label="Lối vào nhanh"
                            >
                                <a
                                    href="#ba-vai-tro"
                                    onClick={() => trackHomeCta('hero_roles', '#ba-vai-tro')}
                                    className="btn-primary shrink-0 whitespace-nowrap px-3 py-2.5 text-xs font-bold uppercase tracking-[0.14em] sm:px-6 sm:py-3 sm:tracking-[0.16em]"
                                >
                                    Khám phá 3 vai trò
                                </a>
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

                        {isLoading || !spotlightCoach ? (
                            <div className="marketplace-panel gv-panel-pad shadow-sm ring-1 ring-gray-900/[0.06] lg:shadow-[0_12px_48px_-8px_rgba(15,23,42,0.12)]">
                                <div className="animate-pulse space-y-4">
                                    <div className="h-6 w-32 rounded bg-gray-200" />
                                    <div className="h-24 w-24 rounded-lg bg-gray-200" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-40 rounded bg-gray-200" />
                                        <div className="h-4 w-32 rounded bg-gray-200" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <CoachSpotlightCard
                                coach={spotlightCoach}
                                currentIndex={spotlightIndex}
                                totalCount={worthyCoaches.length}
                                onNext={handleNextCoach}
                                onPrefetch={handlePrefetch}
                            />
                        )}
                    </div>
                </div>
            </section>

            <section id="ba-vai-tro" className="marketplace-container mt-8 lg:mt-10">
                <div className="space-y-3">
                    <div className="marketplace-section-kicker">Ba nhóm chính</div>
                    <h2 className="marketplace-section-title">
                        Bạn là người tập, Coach hay chủ phòng tập?
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

            <section className="marketplace-container gv-section-gap" aria-labelledby="home-faq-heading">
                <div className="marketplace-panel gv-panel-pad shadow-sm ring-1 ring-gray-900/[0.05]">
                    <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.42fr)] lg:items-start lg:gap-10">
                        <div className="order-2 lg:order-1">
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

                        <div className="order-1 lg:order-2 lg:sticky lg:top-[calc(var(--header-height)+1rem)]">
                            {isLoading || !faqSpotlightCoach ? (
                                <div
                                    className="animate-pulse rounded-xl border border-gray-200 bg-gray-100"
                                    style={{ aspectRatio: '4 / 5' }}
                                    aria-hidden
                                />
                            ) : (
                                <CoachSpotlightCard
                                    coach={faqSpotlightCoach}
                                    currentIndex={faqSpotlightIndex}
                                    totalCount={worthyCoaches.length}
                                    onNext={handleNextFaqCoach}
                                    onPrefetch={handlePrefetch}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
