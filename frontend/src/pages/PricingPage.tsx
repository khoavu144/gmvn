import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../store/store';
import { trackEvent } from '../lib/analytics';
import { SITE_OG_IMAGE, SITE_ORIGIN, SITE_TWITTER_HANDLE } from '../lib/site';

const HERO_BADGES = [
    'Mọi user dùng full tính năng nền tảng miễn phí',
    'Không còn paywall cho program, chi nhánh hay listing marketplace',
    'Flow thanh toán với Coach / Gym vẫn giữ nguyên',
] as const;

const FREE_CAPABILITIES = [
    {
        title: 'Coach dùng full nền tảng',
        body: 'Tạo chương trình, mở rộng tệp học viên và vận hành hồ sơ mà không bị chặn bởi gói platform.',
    },
    {
        title: 'Gym owner không còn quota paywall',
        body: 'Tạo và quản lý chi nhánh mà không cần mở khóa Gym Business.',
    },
    {
        title: 'Marketplace seller không còn membership quota',
        body: 'Đăng nhiều listing hơn mà không bị chặn ở mốc bài đăng thứ hai.',
    },
] as const;

const WHAT_STAYS = [
    'Thanh toán học viên -> Coach cho gói tập vẫn hoạt động như cũ.',
    'Gym pricing, coach pricing và dữ liệu commerce vẫn được giữ nguyên.',
    'Trang này giờ chỉ còn vai trò công bố chính sách free-access của nền tảng.',
] as const;

const ROLE_SECTIONS = [
    {
        title: 'Coach',
        points: [
            'Tạo và publish chương trình mà không còn giới hạn Free tier.',
            'Dùng profile, dashboard và các công cụ tăng trưởng mà không cần upgrade platform.',
        ],
    },
    {
        title: 'Athlete',
        points: [
            'Tiếp tục khám phá Coach, theo dõi workouts và làm việc với coach như hiện tại.',
            'Không còn concept gói nền tảng riêng cho athlete trên GYMERVIET.',
        ],
    },
    {
        title: 'Gym Owner',
        points: [
            'Tạo thêm branch và vận hành hệ thống gym mà không bị chặn bởi gói trả phí nền tảng.',
            'Tập trung vào vận hành, lead và nội dung thay vì mở khóa plan.',
        ],
    },
] as const;

export default function PricingPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const canonicalBase = SITE_ORIGIN;
    const primaryHref = user ? '/dashboard' : '/register';
    const primaryLabel = user ? 'Vào Dashboard' : 'Tạo tài khoản miễn phí';

    return (
        <main className="marketplace-shell min-h-screen">
            <Helmet>
                <title>Miễn phí cho mọi user — GYMERVIET</title>
                <meta
                    name="description"
                    content="GYMERVIET đã chuyển sang free-first: mọi user dùng full tính năng nền tảng miễn phí."
                />
                <link rel="canonical" href={`${canonicalBase}/pricing`} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Miễn phí cho mọi user — GYMERVIET" />
                <meta
                    property="og:description"
                    content="Không còn paywall nền tảng. Coach, athlete và gym owner dùng full tính năng nền tảng miễn phí."
                />
                <meta property="og:url" content={`${canonicalBase}/pricing`} />
                <meta property="og:image" content={SITE_OG_IMAGE} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
                <meta name="twitter:title" content="Miễn phí cho mọi user — GYMERVIET" />
                <meta
                    name="twitter:description"
                    content="Không còn paywall nền tảng trên GYMERVIET."
                />
                <meta name="twitter:image" content={SITE_OG_IMAGE} />
            </Helmet>

            <section className="marketplace-hero">
                <div className="marketplace-container">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-end">
                        <div className="space-y-5">
                            <span className="marketplace-eyebrow">Free-first platform</span>
                            <h1 className="marketplace-title max-w-4xl text-balance">
                                GYMERVIET hiện mở full tính năng nền tảng miễn phí cho mọi user.
                            </h1>
                            <p className="marketplace-lead max-w-2xl">
                                Không còn paywall cho program, branch hay marketplace listing. Trải nghiệm nền tảng giờ tập trung vào sử dụng thực tế thay vì mở khóa plan.
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {HERO_BADGES.map((item) => (
                                    <span key={item} className="marketplace-badge marketplace-badge--neutral">
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to={primaryHref}
                                    onClick={() => trackEvent('pricing_free_cta_click', {
                                        cta_id: 'pricing_primary',
                                        target: primaryHref,
                                        authenticated: Boolean(user),
                                    })}
                                    className="btn-primary px-6 text-sm font-bold uppercase tracking-[0.16em]"
                                >
                                    {primaryLabel}
                                </Link>
                                <Link
                                    to="/coaches"
                                    onClick={() => trackEvent('pricing_free_cta_click', {
                                        cta_id: 'pricing_browse_coaches',
                                        target: '/coaches',
                                        authenticated: Boolean(user),
                                    })}
                                    className="btn-secondary px-6 text-sm font-bold uppercase tracking-[0.16em]"
                                >
                                    Khám phá Coach
                                </Link>
                            </div>
                        </div>

                        <div className="marketplace-panel gv-panel-pad space-y-4">
                            <div className="marketplace-section-kicker">Trạng thái hiện tại</div>
                            <h2 className="marketplace-section-title mt-2">Platform billing đã tắt vĩnh viễn</h2>
                            <p className="text-sm leading-7 text-gray-600">
                                Các gói nền tảng cũ không còn được bán, không còn checkout SePay cho platform, và mọi quota membership/paywall nội bộ đã được gỡ khỏi luồng sử dụng chính.
                            </p>
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-900">
                                Nếu bạn đang dùng GYMERVIET để tạo chương trình, quản lý gym hoặc đăng marketplace listing, bạn đã ở trạng thái full-access cho phần nền tảng.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="marketplace-container mt-8 space-y-12">
                <section className="space-y-5">
                    <div className="space-y-3">
                        <div className="marketplace-section-kicker">Điểm thay đổi chính</div>
                        <h2 className="marketplace-section-title">Những gì đã mở miễn phí</h2>
                        <p className="marketplace-lead max-w-3xl">
                            Trọng tâm là bỏ toàn bộ friction của platform pricing, nhưng không đụng vào các giao dịch commerce thực sự giữa user với coach hoặc gym.
                        </p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                        {FREE_CAPABILITIES.map((item) => (
                            <article key={item.title} className="marketplace-panel gv-panel-pad">
                                <div className="marketplace-section-kicker">Free access</div>
                                <h3 className="mt-3 text-[1.35rem] font-bold tracking-[-0.04em] text-gray-900">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-gray-600">{item.body}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="space-y-3">
                        <div className="marketplace-section-kicker">Không thay đổi</div>
                        <h2 className="marketplace-section-title">Commerce với Coach / Gym vẫn giữ nguyên</h2>
                    </div>
                    <div className="marketplace-panel gv-panel-pad">
                        <ul className="space-y-3">
                            {WHAT_STAYS.map((item) => (
                                <li key={item} className="flex items-start gap-3 text-sm leading-7 text-gray-600">
                                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-hidden="true" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="space-y-3">
                        <div className="marketplace-section-kicker">Theo vai trò</div>
                        <h2 className="marketplace-section-title">Free-first áp dụng như thế nào</h2>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                        {ROLE_SECTIONS.map((section) => (
                            <article key={section.title} className="marketplace-panel gv-panel-pad">
                                <div className="marketplace-section-kicker">{section.title}</div>
                                <ul className="mt-4 space-y-3">
                                    {section.points.map((point) => (
                                        <li key={point} className="flex items-start gap-3 text-sm leading-7 text-gray-600">
                                            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-gray-900" aria-hidden="true" />
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </section>
            </section>
        </main>
    );
}
