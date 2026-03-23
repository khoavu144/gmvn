import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { logger } from '../lib/logger';
import { trackEvent } from '../lib/analytics';
import apiClient from '../services/api';
import type { Trainer } from '../types';
import { usePrefetchProfile } from '../hooks/usePrefetchProfile';
import { HomeProfileSpotlight } from '../components/home/HomeProfileSpotlight';
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

const ECOSYSTEM_STEPS = [
    {
        step: '01',
        title: 'Khám phá',
        body: 'Lướt Coach, phòng tập, cửa hàng và tin tức — mọi thứ nằm trong cùng một ứng dụng.',
    },
    {
        step: '02',
        title: 'So sánh',
        body: 'Đối chiếu ảnh, giá, khu vực và thông tin hồ sơ để chọn người và nơi phù hợp với bạn.',
    },
    {
        step: '03',
        title: 'Hành động',
        body: 'Đăng ký tài khoản, liên hệ Coach hoặc phòng tập, hoặc chọn gói trả phí — khi bạn đã sẵn sàng bước tiếp.',
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

    const visibleProfiles = useMemo(() => sorted.slice(0, 3), [sorted]);

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

            <section className="marketplace-hero">
                <div className="marketplace-container">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:items-start lg:gap-10">
                        <div className="space-y-5 lg:max-w-[40rem] lg:pt-1">
                            <span className="marketplace-eyebrow">Tập đúng người · đúng chỗ</span>
                            <h1 className="marketplace-title max-w-4xl text-balance">
                                Tìm Coach, chọn phòng tập — tất cả trên một nền tảng.
                            </h1>
                            <p className="marketplace-lead max-w-2xl">
                                Xem hồ sơ thật, so sánh giá và khu vực, đọc tin tập luyện — rồi quyết định bước tiếp theo cho mục tiêu tập luyện của bạn trên GYMERVIET.
                            </p>
                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-gray-500">
                                Đăng ký miễn phí · Hồ sơ có thể được xác minh · Lọc phòng tập theo khu vực
                            </p>

                            <div
                                className="-mx-1 flex flex-row flex-nowrap items-stretch gap-2 overflow-x-auto scroll-x-hidden scroll-smooth px-1 sm:gap-3"
                                role="group"
                                aria-label="Lối vào nhanh"
                            >
                                <a
                                    href="#ba-vai-tro"
                                    onClick={() => trackHomeCta('hero_roles', '#ba-vai-tro')}
                                    className="btn-primary shrink-0 whitespace-nowrap px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.16em]"
                                >
                                    Khám phá 3 vai trò
                                </a>
                                <Link
                                    to="/gyms"
                                    onClick={() => trackHomeCta('hero_gyms', '/gyms')}
                                    className="btn-secondary shrink-0 whitespace-nowrap px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.16em]"
                                >
                                    Tìm phòng tập
                                </Link>
                                <Link
                                    to="/register"
                                    onClick={() => trackHomeCta('hero_register', '/register')}
                                    className="btn-secondary shrink-0 whitespace-nowrap px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] sm:px-6 sm:py-3 sm:text-sm sm:tracking-[0.16em]"
                                >
                                    Tạo tài khoản
                                </Link>
                            </div>
                        </div>

                        <div className="marketplace-panel gv-panel-pad shadow-sm ring-1 ring-gray-900/[0.06] lg:shadow-[0_12px_48px_-8px_rgba(15,23,42,0.12)]">
                            <div className="space-y-3 border-b border-gray-200 pb-4">
                                <div className="marketplace-section-kicker">Thành viên đang có mặt</div>
                                <h2 className="marketplace-section-title">
                                    Một vài gương mặt bạn có thể xem ngay.
                                </h2>
                                <p className="text-sm leading-7 text-gray-600">
                                    Ảnh đại diện và chuyên môn thật — bấm vào để xem hồ sơ chi tiết.
                                </p>
                            </div>

                            {isLoading ? (
                                <div className="mt-5 space-y-3">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 rounded-lg bg-gray-100 p-4 animate-pulse"
                                        >
                                            <div className="h-14 w-14 rounded-full bg-gray-200" />
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div className="h-4 w-1/2 rounded bg-gray-200" />
                                                <div className="h-3 w-1/3 rounded bg-gray-200" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : visibleProfiles.length > 0 ? (
                                <div className="mt-5 space-y-3">
                                    {visibleProfiles.map((coach, index) => (
                                        <Link
                                            key={coach.id}
                                            to={coachLink(coach)}
                                            onMouseEnter={() => handlePrefetch(coach)}
                                            onClick={() => trackHomeCta('hero_profile_spotlight', coachLink(coach))}
                                            className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition duration-300 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)]"
                                        >
                                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-gray-100">
                                                {coach.avatar_url ? (
                                                    <img
                                                        src={coach.avatar_url}
                                                        alt={coach.full_name}
                                                        className="h-full w-full object-cover"
                                                        width={56}
                                                        height={56}
                                                        loading={index === 0 ? 'eager' : 'lazy'}
                                                        fetchPriority={index === 0 ? 'high' : undefined}
                                                        decoding="async"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-xl font-black text-gray-400">
                                                        {coach.full_name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="truncate text-base font-bold tracking-[-0.03em] text-gray-900">
                                                        {coach.full_name}
                                                    </div>
                                                    {coach.is_verified && (
                                                        <span className="marketplace-badge marketplace-badge--verified">
                                                            Đã xác minh
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-sm leading-6 text-gray-600">
                                                    {coach.specialties?.[0] || 'Coach / vận động viên'}
                                                </div>
                                            </div>

                                            <span className="shrink-0 text-xs font-bold uppercase tracking-[0.16em] text-gray-900 transition-transform group-hover:translate-x-1">
                                                Xem →
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="marketplace-empty px-0 pb-0 pt-6">
                                    <strong>Danh sách đang được cập nhật.</strong>
                                    <p>
                                        Bạn có thể vào trang Coach để xem thêm hồ sơ hoặc quay lại sau.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section id="ba-vai-tro" className="marketplace-container gv-section-gap">
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

            <section className="marketplace-container gv-section-gap">
                <div className="space-y-3">
                    <div className="marketplace-section-kicker">Cách dùng GYMERVIET</div>
                    <h2 className="marketplace-section-title">
                        Ba bước đơn giản: xem — so sánh — quyết định.
                    </h2>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {ECOSYSTEM_STEPS.map((item) => (
                        <article
                            key={item.step}
                            className="marketplace-panel gv-panel-pad shadow-sm ring-1 ring-gray-900/[0.05]"
                        >
                            <div className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gray-500">
                                Bước {item.step}
                            </div>
                            <h3 className="mt-4 text-[1.2rem] font-bold tracking-[-0.035em] text-gray-900">
                                {item.title}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-gray-600">
                                {item.body}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="marketplace-container gv-section-gap">
                <div className="marketplace-panel gv-panel-pad-lg shadow-sm ring-1 ring-gray-900/[0.06] lg:shadow-[0_10px_40px_-12px_rgba(15,23,42,0.1)]">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                        <div className="space-y-4">
                            <div className="marketplace-section-kicker">Bước tiếp theo</div>
                            <h2 className="marketplace-section-title max-w-3xl">
                                Chọn lối vào phù hợp với bạn.
                            </h2>
                            <p className="marketplace-lead max-w-2xl">
                                Xem Coach, tìm phòng tập hoặc tạo tài khoản miễn phí — mất vài giây để bắt đầu.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 lg:flex-nowrap lg:justify-end lg:self-center">
                            <Link
                                to="/coaches"
                                onClick={() => trackHomeCta('bottom_coaches', '/coaches')}
                                className="btn-secondary min-w-[7.5rem] px-5 text-sm font-bold uppercase tracking-[0.16em] lg:text-center"
                            >
                                Coach
                            </Link>
                            <Link
                                to="/gyms"
                                onClick={() => trackHomeCta('bottom_gyms', '/gyms')}
                                className="btn-secondary min-w-[7.5rem] px-5 text-sm font-bold uppercase tracking-[0.16em] lg:text-center"
                            >
                                Phòng tập
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => trackHomeCta('bottom_register', '/register')}
                                className="btn-primary px-6 text-sm font-bold uppercase tracking-[0.16em] lg:shrink-0"
                            >
                                Tạo tài khoản
                            </Link>
                        </div>
                    </div>
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
                            {isLoading ? (
                                <div
                                    className="animate-pulse rounded-xl border border-gray-200 bg-gray-100"
                                    style={{ aspectRatio: '4 / 5' }}
                                    aria-hidden
                                />
                            ) : (
                                <HomeProfileSpotlight
                                    profiles={sorted}
                                    resolveHref={coachLink}
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
