import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import type { RootState } from '../store/store';
import { trackEvent } from '../lib/analytics';
import { SITE_OG_IMAGE, SITE_ORIGIN, SITE_TWITTER_HANDLE } from '../lib/site';

const HERO_BADGES = [
    'Mọi người dùng full tính năng nền tảng miễn phí',
    'Không giới hạn chương trình, chi nhánh hay bài đăng',
    'Kết nối với huấn luyện viên / phòng tập theo cơ chế thỏa thuận trực tiếp',
] as const;

const FREE_CAPABILITIES = [
    {
        title: 'Huấn luyện viên dùng full nền tảng',
        body: 'Tạo chương trình, mở rộng tệp học viên và vận hành hồ sơ mà không bị giới hạn.',
    },
    {
        title: 'Chủ phòng tập không giới hạn chi nhánh',
        body: 'Tạo và quản lý chi nhánh tự do mà không cần mở khóa gói nào.',
    },
    {
        title: 'Người bán không giới hạn bài đăng',
        body: 'Đăng sản phẩm và dịch vụ không bị giới hạn số lượng bài.',
    },
] as const;

const WHAT_STAYS = [
    'Giá dịch vụ huấn luyện viên, giá phòng tập và thông tin ưu đãi vẫn hiển thị công khai để người dùng so sánh.',
    'Sau khi kết nối, các bên tự thống nhất cách tham gia hoặc giao dịch ngoài phạm vi kiểm soát của ứng dụng.',
    'Trang này công bố chính sách miễn phí và ranh giới trách nhiệm của nền tảng.',
] as const;

const ROLE_SECTIONS = [
    {
        title: 'Huấn luyện viên',
        points: [
            'Tạo và đăng chương trình không giới hạn.',
            'Dùng hồ sơ, bảng điều khiển và các công cụ tăng trưởng đầy đủ.',
        ],
    },
    {
        title: 'Vận động viên',
        points: [
            'Tiếp tục khám phá huấn luyện viên, theo dõi lịch tập và làm việc trực tiếp như hiện tại.',
            'Không còn khái niệm gói nền tảng riêng cho vận động viên trên GYMERVIET.',
        ],
    },
    {
        title: 'Chủ phòng tập',
        points: [
            'Tạo thêm chi nhánh và vận hành hệ thống gym mà không bị chặn bởi gói trả phí nền tảng.',
            'Tập trung vào vận hành, lead và nội dung thay vì mở khóa gói.',
        ],
    },
] as const;

export default function PricingPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const canonicalBase = SITE_ORIGIN;
    const primaryHref = user ? '/dashboard' : '/register';
    const primaryLabel = user ? 'Vào bảng điều khiển' : 'Tạo tài khoản miễn phí';

    return (
        <main className="marketplace-shell min-h-screen">
            <Helmet>
                <title>Miễn phí cho mọi người — GYMERVIET</title>
                <meta
                    name="description"
                    content="GYMERVIET miễn phí cho mọi người dùng: đầy đủ tính năng, không giới hạn."
                />
                <link rel="canonical" href={`${canonicalBase}/pricing`} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Miễn phí cho mọi người — GYMERVIET" />
                <meta
                    property="og:description"
                    content="Không giới hạn tính năng. Huấn luyện viên, vận động viên và chủ phòng tập dùng miễn phí."
                />
                <meta property="og:url" content={`${canonicalBase}/pricing`} />
                <meta property="og:image" content={SITE_OG_IMAGE} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
                <meta name="twitter:title" content="Miễn phí cho mọi người — GYMERVIET" />
                <meta
                    name="twitter:description"
                    content="GYMERVIET miễn phí cho mọi người."
                />
                <meta name="twitter:image" content={SITE_OG_IMAGE} />
            </Helmet>

            <section className="marketplace-hero">
                <div className="marketplace-container">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-end">
                        <div className="space-y-5">
                            <span className="marketplace-eyebrow">Nền tảng miễn phí</span>
                            <h1 className="marketplace-title max-w-4xl text-balance">
                                GYMERVIET mở toàn bộ tính năng miễn phí cho mọi người dùng.
                            </h1>
                            <p className="marketplace-lead max-w-2xl">
                                Không giới hạn chương trình, chi nhánh hay bài đăng. Trải nghiệm nền tảng tập trung vào khám phá, hồ sơ, liên hệ và vận hành thực tế.
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
                                    Khám phá huấn luyện viên
                                </Link>
                            </div>
                        </div>

                        <div className="marketplace-panel gv-panel-pad space-y-4">
                            <div className="marketplace-section-kicker">Trạng thái hiện tại</div>
                            <h2 className="marketplace-section-title mt-2">Không còn gói trả phí nền tảng</h2>
                            <p className="text-sm leading-7 text-gray-600">
                                Các gói nền tảng cũ không còn được bán, và mọi giới hạn tính năng đã được gỡ khỏi luồng sử dụng chính.
                            </p>
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-900">
                                Nếu bạn đang dùng GYMERVIET để tạo chương trình, quản lý phòng tập hoặc đăng sản phẩm, bạn đã có đầy đủ quyền truy cập.
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
                            Trọng tâm là bỏ toàn bộ rào cản, đồng thời giữ rõ ranh giới: ứng dụng hỗ trợ khám phá và kết nối, không đứng giữa các giao dịch giữa người dùng với huấn luyện viên hoặc phòng tập.
                        </p>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-3">
                        {FREE_CAPABILITIES.map((item) => (
                            <article key={item.title} className="marketplace-panel gv-panel-pad">
                                <div className="marketplace-section-kicker">Miễn phí</div>
                                <h3 className="mt-3 text-[1.35rem] font-bold tracking-[-0.04em] text-gray-900">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-gray-600">{item.body}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="space-y-3">
                        <div className="marketplace-section-kicker">Lưu ý</div>
                        <h2 className="marketplace-section-title">Ranh giới trách nhiệm</h2>
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
                        <h2 className="marketplace-section-title">Miễn phí áp dụng như thế nào</h2>
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
