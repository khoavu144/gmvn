import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { logger } from '../lib/logger';
import apiClient from '../services/api';
import type { Trainer } from '../types';
import { usePrefetchProfile } from '../hooks/usePrefetchProfile';

type FeaturedTrainer = Trainer & {
    is_verified?: boolean;
    created_at?: string;
    slug?: string;
    user_type?: string;
};

const AUDIENCE_PILLARS = [
    {
        kicker: 'Người tập',
        title: 'Bắt đầu từ đúng người, đúng nơi và đúng ngữ cảnh tập luyện.',
        body: 'GYMERVIET giúp người tập đi từ khám phá coach, so sánh venue, tham khảo marketplace cho tới cập nhật kiến thức mà không phải nhảy giữa nhiều hệ thống rời rạc.',
        href: '/coaches',
        cta: 'Khám phá coach',
    },
    {
        kicker: 'Coach',
        title: 'Xây hiện diện công khai và vận hành hành trình huấn luyện rõ ràng hơn.',
        body: 'Coach có một nơi để xuất bản hồ sơ, mở gói tập, được khám phá bởi học viên mới và giữ mạch giao tiếp nhất quán trong cùng một hệ sinh thái.',
        href: '/register',
        cta: 'Trở thành Coach',
    },
    {
        kicker: 'Gym Center',
        title: 'Đưa venue lên đúng bề mặt khám phá thay vì chìm trong những danh sách vô định.',
        body: 'Gym có thể trình bày không gian tập, chi nhánh, đội ngũ và giá khởi điểm bằng một cấu trúc dễ đọc hơn cho người dùng mới.',
        href: '/gym-owner/register',
        cta: 'Đăng ký đối tác',
    },
] as const;

const ECOSYSTEM_STEPS = [
    {
        step: '01',
        title: 'Khám phá',
        body: 'Người dùng bắt đầu từ những bề mặt công khai như coach, venue, marketplace và knowledge hub.',
    },
    {
        step: '02',
        title: 'So sánh',
        body: 'Quyết định dựa trên tín hiệu thật: hồ sơ, hình ảnh, giá khởi điểm, ngữ cảnh sử dụng và mức độ phù hợp.',
    },
    {
        step: '03',
        title: 'Hành động',
        body: 'Khi đã hiểu mình cần gì, họ mới đi tiếp sang đăng ký, nhắn tin, mua gói hoặc trở thành đối tác trong hệ sinh thái.',
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
    const canonicalBase = import.meta.env.VITE_CANONICAL_BASE_URL || 'https://gymerviet.com';

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

    return (
        <main className="marketplace-shell min-h-screen pb-24">
            <Helmet>
                <title>GYMERVIET — Hệ sinh thái dành cho người tập, Coach và Gym</title>
                <meta
                    name="description"
                    content="GYMERVIET kết nối người tập, Coach và Gym trong cùng một hệ sinh thái để khám phá, so sánh và hành động rõ ràng hơn."
                />
                <link rel="canonical" href={canonicalBase} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="GYMERVIET — Hệ sinh thái dành cho người tập, Coach và Gym" />
                <meta
                    property="og:description"
                    content="Một hệ sinh thái thống nhất để khám phá coach, venue, marketplace và kiến thức tập luyện theo cách dễ hiểu hơn."
                />
                <meta property="og:url" content={canonicalBase} />
                <meta property="og:image" content="https://gymerviet.com/og-default.jpg" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@gymerviet" />
                <meta name="twitter:title" content="GYMERVIET — Hệ sinh thái dành cho người tập, Coach và Gym" />
                <meta
                    name="twitter:description"
                    content="Người tập, Coach và Gym gặp nhau trên cùng một bề mặt khám phá, so sánh và hành động rõ ràng hơn."
                />
                <meta name="twitter:image" content="https://gymerviet.com/og-default.jpg" />
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

            <section className="marketplace-hero pt-header">
                <div className="marketplace-container">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] lg:items-end">
                        <div className="space-y-5">
                            <span className="marketplace-eyebrow">Balanced fitness ecosystem</span>
                            <h1 className="marketplace-title max-w-4xl text-balance">
                                GYMERVIET là nơi người tập, Coach và Gym gặp nhau trong cùng một hệ sinh thái.
                            </h1>
                            <p className="marketplace-lead max-w-2xl">
                                Trang chủ này không cố bán ngay. Nó chỉ trả lời ngắn gọn GYMERVIET là gì: một cấu trúc chung để khám phá, so sánh và hành động rõ ràng hơn quanh hành trình tập luyện tại Việt Nam.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <a
                                    href="#ecosystem"
                                    className="btn-primary px-6 text-sm font-bold uppercase tracking-[0.16em]"
                                >
                                    Xem hệ sinh thái
                                </a>
                                <Link
                                    to="/register"
                                    className="btn-secondary px-6 text-sm font-bold uppercase tracking-[0.16em]"
                                >
                                    Tạo tài khoản
                                </Link>
                            </div>
                        </div>

                        <div className="marketplace-panel p-6 sm:p-8">
                            <div className="space-y-3 border-b border-[color:var(--mk-line)] pb-4">
                                <div className="marketplace-section-kicker">Một lát cắt dữ liệu thật</div>
                                <h2 className="marketplace-section-title">
                                    Những hồ sơ đang hiện diện trên nền tảng ngay lúc này.
                                </h2>
                                <p className="text-sm leading-7 text-[color:var(--mk-text-soft)]">
                                    Chỉ một nhóm nhỏ đại diện để cho thấy hệ sinh thái này được xây quanh người thật và nhu cầu thật.
                                </p>
                            </div>

                            {isLoading ? (
                                <div className="mt-5 space-y-3">
                                    {Array.from({ length: 3 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 rounded-lg bg-[color:var(--mk-paper-strong)] p-4 animate-pulse"
                                        >
                                            <div className="h-14 w-14 rounded-full bg-[color:var(--mk-line)]" />
                                            <div className="min-w-0 flex-1 space-y-2">
                                                <div className="h-4 w-1/2 rounded bg-[color:var(--mk-line)]" />
                                                <div className="h-3 w-1/3 rounded bg-[color:var(--mk-line)]" />
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
                                            className="group flex items-center gap-4 rounded-lg border border-[color:var(--mk-line)] bg-white/70 p-4 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(53,41,26,0.08)]"
                                        >
                                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[color:var(--mk-paper-strong)]">
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
                                                    <div className="flex h-full w-full items-center justify-center text-xl font-black text-[color:var(--mk-muted)]">
                                                        {coach.full_name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="truncate text-base font-bold tracking-[-0.03em] text-[color:var(--mk-text)]">
                                                        {coach.full_name}
                                                    </div>
                                                    {coach.is_verified && (
                                                        <span className="marketplace-badge marketplace-badge--verified">
                                                            Đã xác minh
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-1 text-sm leading-6 text-[color:var(--mk-text-soft)]">
                                                    {coach.specialties?.[0] || 'Hồ sơ công khai trên hệ sinh thái'}
                                                </div>
                                            </div>

                                            <span className="text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--mk-text)] transition-transform group-hover:translate-x-1">
                                                Xem →
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="marketplace-empty px-0 pb-0 pt-6">
                                    <strong>Danh sách hồ sơ đang được cập nhật.</strong>
                                    <p>
                                        Khi hệ thống có thêm dữ liệu, phần này sẽ tiếp tục đóng vai trò như tín hiệu chứng thực ngắn gọn cho thương hiệu.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <section id="ecosystem" className="marketplace-container mt-10">
                <div className="space-y-3">
                    <div className="marketplace-section-kicker">Một hệ sinh thái · ba góc nhìn</div>
                    <h2 className="marketplace-section-title">
                        GYMERVIET chỉ cần rõ một điều: ba nhóm người dùng chính đang cùng tồn tại trong một cấu trúc chung.
                    </h2>
                    <p className="marketplace-lead max-w-3xl">
                        Thay vì kể quá nhiều sản phẩm rời rạc, trang chủ này rút về ba vai trò cốt lõi để giải thích thương hiệu ngắn gọn hơn.
                    </p>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {AUDIENCE_PILLARS.map((item) => (
                        <Link
                            key={item.title}
                            to={item.href}
                            className="marketplace-panel group flex h-full flex-col gap-5 p-6 sm:p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(53,41,26,0.1)]"
                        >
                            <div className="space-y-3">
                                <div className="marketplace-section-kicker">{item.kicker}</div>
                                <h3 className="text-[1.3rem] font-bold leading-[1.18] tracking-[-0.04em] text-[color:var(--mk-text)]">
                                    {item.title}
                                </h3>
                                <p className="text-sm leading-7 text-[color:var(--mk-text-soft)]">
                                    {item.body}
                                </p>
                            </div>

                            <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--mk-text)] transition-transform group-hover:translate-x-1">
                                {item.cta} →
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="marketplace-container mt-12">
                <div className="space-y-3">
                    <div className="marketplace-section-kicker">Cách hệ sinh thái vận hành</div>
                    <h2 className="marketplace-section-title">
                        Phần cốt lõi không phức tạp: khám phá, so sánh, rồi mới hành động.
                    </h2>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    {ECOSYSTEM_STEPS.map((item) => (
                        <article key={item.step} className="marketplace-panel p-6 sm:p-7">
                            <div className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">
                                Bước {item.step}
                            </div>
                            <h3 className="mt-4 text-[1.2rem] font-bold tracking-[-0.035em] text-[color:var(--mk-text)]">
                                {item.title}
                            </h3>
                            <p className="mt-3 text-sm leading-7 text-[color:var(--mk-text-soft)]">
                                {item.body}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="marketplace-container mt-12">
                <div className="marketplace-panel p-6 sm:p-8 lg:p-10">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div className="space-y-4">
                            <div className="marketplace-section-kicker">Khi đã hiểu mình đang ở đâu</div>
                            <h2 className="marketplace-section-title max-w-3xl">
                                Ba lối vào trực tiếp nhất của hệ sinh thái nằm ở đây.
                            </h2>
                            <p className="marketplace-lead max-w-2xl">
                                Sau khi định vị thương hiệu xong, người dùng mới chỉ cần đi tiếp vào đúng điểm vào phù hợp với vai trò của họ.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 lg:justify-end">
                            <Link
                                to="/coaches"
                                className="btn-secondary px-5 text-sm font-bold uppercase tracking-[0.16em]"
                            >
                                Coach
                            </Link>
                            <Link
                                to="/gyms"
                                className="btn-secondary px-5 text-sm font-bold uppercase tracking-[0.16em]"
                            >
                                Gym
                            </Link>
                            <Link
                                to="/register"
                                className="btn-primary px-5 text-sm font-bold uppercase tracking-[0.16em]"
                            >
                                Tạo tài khoản
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
