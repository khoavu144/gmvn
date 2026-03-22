import { useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import apiClient from '../services/api';

type PlanKey = 'free' | 'coach_pro' | 'coach_elite' | 'athlete_premium' | 'gym_business';

type CheckoutInfo = {
    description: string;
    amount: number;
    plan: PlanKey;
};

const PLAN_LABELS: Record<PlanKey, string> = {
    free: 'Miễn phí',
    coach_pro: 'Coach Pro',
    coach_elite: 'Coach Elite',
    athlete_premium: 'Athlete Premium',
    gym_business: 'Gym Business',
};

const PLAN_SUMMARIES: Record<PlanKey, string> = {
    free: 'Khởi động với những tính năng nền tảng để làm quen với hệ sinh thái trước khi nâng cấp.',
    coach_pro: 'Phù hợp cho coach đang mở rộng số học viên, muốn có hiện diện rõ ràng hơn trong hệ thống.',
    coach_elite: 'Dành cho coach xem GYMERVIET là một kênh tăng trưởng chính và cần ưu tiên hiển thị mạnh hơn.',
    athlete_premium: 'Dành cho người tập muốn lưu giữ tiến độ dài hạn, theo dõi sâu hơn và so sánh nhiều lựa chọn.',
    gym_business: 'Phù hợp cho gym center cần trình bày nhiều chi nhánh, nhiều coach và tối ưu khả năng được khám phá.',
};

const DESCRIPTIONS: Record<PlanKey, string[]> = {
    free: ['Tạo tối đa 3 chương trình tập', 'Tối đa 10 học viên', '1 chi nhánh Gym'],
    coach_pro: ['Không giới hạn chương trình', '50 học viên cùng lúc', 'Badge Pro trên hồ sơ', 'Ưu tiên tìm kiếm', 'Share card tuỳ chỉnh'],
    coach_elite: ['Không giới hạn chương trình & học viên', 'Top tìm kiếm', 'Badge Elite nổi bật', 'Share card tuỳ chỉnh', 'Hỗ trợ ưu tiên'],
    athlete_premium: ['Ảnh tiến trình không giới hạn', 'Lịch sử đăng ký đầy đủ', 'So sánh nhiều Coach', 'Ẩn quảng cáo'],
    gym_business: ['Chi nhánh không giới hạn', 'Số HLV không giới hạn', 'Gallery không giới hạn', 'Featured trong tìm kiếm', 'Analytics lượt xem'],
};

const PRICES: Record<PlanKey, number> = {
    free: 0,
    coach_pro: 499999,
    coach_elite: 999999,
    athlete_premium: 999999,
    gym_business: 999999,
};

const FAQ_ITEMS = [
    {
        question: 'Gói Coach Pro có những gì?',
        answer: 'Không giới hạn chương trình, 50 học viên cùng lúc, Badge Pro trên hồ sơ, ưu tiên tìm kiếm và share card tuỳ chỉnh. Giá 499.999đ/năm.',
    },
    {
        question: 'Gói Coach Elite có những gì?',
        answer: 'Không giới hạn chương trình và học viên, top tìm kiếm, Badge Elite nổi bật, share card tuỳ chỉnh và hỗ trợ ưu tiên. Giá 999.999đ/năm.',
    },
    {
        question: 'Có thể huỷ bất kỳ lúc nào không?',
        answer: 'Có. Bạn có thể huỷ bất kỳ lúc nào và gói sẽ hết hiệu lực sau khi chu kỳ hiện tại kết thúc.',
    },
    {
        question: 'GYMERVIET hỗ trợ phương thức thanh toán nào?',
        answer: 'Hiện tại hỗ trợ chuyển khoản ngân hàng qua SePay. Gói được kích hoạt tự động ngay sau khi xác nhận giao dịch.',
    },
] as const;

const HERO_POINTS = [
    {
        title: 'Thanh toán minh bạch',
        body: 'Toàn bộ gói đang dùng cấu trúc giá theo năm, giúp người dùng so sánh nhanh và ít nhiễu hơn.',
    },
    {
        title: 'Nâng cấp theo vai trò',
        body: 'Coach, athlete và gym center có nhu cầu rất khác nhau, nên bảng giá được tách rõ theo đúng job-to-be-done.',
    },
    {
        title: 'Kích hoạt tự động',
        body: 'Sau khi thanh toán đúng nội dung chuyển khoản, gói sẽ được hệ thống xử lý và kích hoạt trong vài phút.',
    },
] as const;

function formatPrice(price: number) {
    if (price === 0) return 'Miễn phí';
    return `${price.toLocaleString('vi-VN')}đ / năm`;
}

function PlanColumn({
    planKey,
    highlighted,
    onUpgrade,
    isLoading,
}: {
    planKey: PlanKey;
    highlighted?: boolean;
    onUpgrade: (plan: PlanKey) => void;
    isLoading: PlanKey | null;
}) {
    const price = PRICES[planKey];
    const isFree = price === 0;

    return (
        <article
            className={`marketplace-panel gv-panel-pad relative flex h-full flex-col gap-6 ${highlighted ? '!border-amber-200 !bg-amber-50/80' : ''}`}
        >
            {highlighted && (
                <span className="marketplace-badge marketplace-badge--accent absolute right-5 top-5">
                    Phổ biến nhất
                </span>
            )}

            <div className={`space-y-3 ${highlighted ? 'pr-14' : ''}`}>
                <div className="marketplace-section-kicker">{PLAN_LABELS[planKey]}</div>
                <h3 className="text-[1.7rem] font-bold tracking-[-0.05em] text-gray-900">
                    {formatPrice(price)}
                </h3>
                <p className="text-sm leading-7 text-gray-600">
                    {PLAN_SUMMARIES[planKey]}
                </p>
            </div>

            <ul className="space-y-3 border-t border-gray-200 pt-5">
                {DESCRIPTIONS[planKey].map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-gray-600">
                        <span
                            className="mt-2 h-2 w-2 shrink-0 rounded-full bg-emerald-600"
                            aria-hidden="true"
                        />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-auto border-t border-gray-200 pt-5">
                {isFree ? (
                    <div className="rounded-lg border border-gray-200 bg-white/60 px-4 py-3 text-sm font-medium leading-6 text-gray-600">
                        Gói miễn phí luôn sẵn sàng để bạn bắt đầu trước khi cần mở rộng sâu hơn.
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={() => onUpgrade(planKey)}
                        disabled={isLoading === planKey}
                        className={`${highlighted ? 'btn-primary' : 'btn-secondary'} w-full text-sm font-bold uppercase tracking-[0.16em]`}
                    >
                        {isLoading === planKey ? 'Đang xử lý...' : 'Nâng cấp ngay'}
                    </button>
                )}
            </div>
        </article>
    );
}

function Section({
    kicker,
    title,
    subtitle,
    columnsClassName,
    children,
}: {
    kicker: string;
    title: string;
    subtitle: string;
    columnsClassName: string;
    children: ReactNode;
}) {
    return (
        <section className="space-y-5">
            <div className="space-y-3">
                <div className="marketplace-section-kicker">{kicker}</div>
                <h2 className="marketplace-section-title">{title}</h2>
                <p className="marketplace-lead max-w-3xl">{subtitle}</p>
            </div>
            <div className={`grid gap-4 ${columnsClassName}`}>
                {children}
            </div>
        </section>
    );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 py-3 last:border-b-0 last:pb-0 first:pt-0">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                {label}
            </span>
            <span className={`max-w-[18rem] text-right text-sm font-semibold text-gray-900 ${mono ? 'font-mono break-all' : ''}`}>
                {value}
            </span>
        </div>
    );
}

export default function PricingPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();
    const [upgradeLoading, setUpgradeLoading] = useState<PlanKey | null>(null);
    const [checkoutInfo, setCheckoutInfo] = useState<CheckoutInfo | null>(null);
    const [error, setError] = useState<string | null>(null);
    const canonicalBase = import.meta.env.VITE_CANONICAL_BASE_URL || 'https://gymerviet.com';

    const handleUpgrade = async (plan: PlanKey) => {
        if (!user) {
            navigate('/login');
            return;
        }

        setUpgradeLoading(plan);
        setError(null);

        try {
            const res = await apiClient.post('/platform/checkout', { plan });
            setCheckoutInfo({
                description: res.data.description,
                amount: res.data.amount,
                plan: res.data.plan,
            });
        } catch (err: any) {
            setError(err?.response?.data?.error ?? 'Lỗi khi tạo đơn thanh toán');
        } finally {
            setUpgradeLoading(null);
        }
    };

    return (
        <main className="marketplace-shell min-h-screen">
            <Helmet>
                <title>Bảng giá — GYMERVIET</title>
                <meta
                    name="description"
                    content="Chọn gói phù hợp để mở khoá toàn bộ tính năng GYMERVIET. Bảng giá được tách rõ theo từng vai trò trong hệ sinh thái."
                />
                <link rel="canonical" href={`${canonicalBase}/pricing`} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Bảng giá — GYMERVIET" />
                <meta
                    property="og:description"
                    content="Coach, athlete và gym center có bảng giá rõ ràng, thanh toán theo năm và kích hoạt tự động qua SePay."
                />
                <meta property="og:url" content={`${canonicalBase}/pricing`} />
                <meta property="og:image" content="https://gymerviet.com/og-default.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content="@gymerviet" />
                <meta name="twitter:title" content="Bảng giá — GYMERVIET" />
                <meta
                    name="twitter:description"
                    content="Chọn gói phù hợp để mở khoá các tính năng dành cho coach, athlete và gym center trên GYMERVIET."
                />
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: FAQ_ITEMS.map((item) => ({
                        '@type': 'Question',
                        name: item.question,
                        acceptedAnswer: {
                            '@type': 'Answer',
                            text: item.answer,
                        },
                    })),
                })}</script>
            </Helmet>

            <section className="marketplace-hero">
                <div className="marketplace-container">
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-end">
                        <div className="space-y-5">
                            <span className="marketplace-eyebrow">Pricing & plans</span>
                            <h1 className="marketplace-title max-w-4xl text-balance">
                                Bảng giá rõ ràng cho từng vai trò trong hệ sinh thái GYMERVIET.
                            </h1>
                            <p className="marketplace-lead max-w-2xl">
                                Không còn cảm giác như một microsite riêng. Bảng giá này dùng cùng ngôn ngữ với marketplace và gym routes: ít nhiễu hơn, dễ so sánh hơn và tập trung đúng vào quyết định nâng cấp.
                            </p>

                            <div className="flex flex-wrap gap-2">
                                {['Thanh toán theo năm', 'Kích hoạt tự động qua SePay', 'Huỷ bất kỳ lúc nào'].map((item) => (
                                    <span key={item} className="marketplace-badge marketplace-badge--neutral">
                                        {item}
                                    </span>
                                ))}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/register"
                                    className="btn-primary px-6 text-sm font-bold uppercase tracking-[0.16em]"
                                >
                                    Tạo tài khoản
                                </Link>
                                <Link
                                    to="/coaches"
                                    className="btn-secondary px-6 text-sm font-bold uppercase tracking-[0.16em]"
                                >
                                    Khám phá Coach
                                </Link>
                            </div>
                        </div>

                        <div className="marketplace-panel gv-panel-pad">
                            <div className="marketplace-section-kicker">Tóm tắt nhanh</div>
                            <h2 className="marketplace-section-title mt-2">
                                Mỗi gói được tổ chức theo đúng job-to-be-done của từng nhóm người dùng.
                            </h2>
                            <div className="mt-6 space-y-4">
                                {HERO_POINTS.map((item) => (
                                    <div key={item.title} className="rounded-lg border border-gray-200 bg-white/70 p-4">
                                        <div className="text-sm font-bold tracking-[-0.03em] text-gray-900">
                                            {item.title}
                                        </div>
                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                            {item.body}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="marketplace-container mt-8 space-y-12">
                {error && (
                    <div
                        role="alert"
                        className="marketplace-panel border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
                    >
                        ⚠ {error}
                    </div>
                )}

                <Section
                    kicker="Coach plans"
                    title="Dành cho Coach"
                    subtitle="Từ giai đoạn thử nghiệm đến khi mở rộng quy mô học viên, các gói dưới đây chia rõ ngưỡng nhu cầu để bạn không phải đoán mình nên nâng cấp lúc nào."
                    columnsClassName="lg:grid-cols-3"
                >
                    <PlanColumn planKey="free" onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                    <PlanColumn planKey="coach_pro" highlighted onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                    <PlanColumn planKey="coach_elite" onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                </Section>

                <Section
                    kicker="Athlete plans"
                    title="Dành cho Athlete"
                    subtitle="Người tập không cần một ma trận giá phức tạp. Bảng giá athlete giữ ít lựa chọn hơn để quyết định nâng cấp diễn ra nhanh và rõ."
                    columnsClassName="lg:grid-cols-2"
                >
                    <PlanColumn planKey="free" onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                    <PlanColumn planKey="athlete_premium" highlighted onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                </Section>

                <Section
                    kicker="Gym Center plans"
                    title="Dành cho Gym Center"
                    subtitle="Gym center được so sánh trên cùng bề mặt với coach và athlete, nhưng lợi ích được viết đúng ngữ cảnh vận hành chi nhánh và khả năng được khám phá."
                    columnsClassName="lg:grid-cols-2"
                >
                    <PlanColumn planKey="free" onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                    <PlanColumn planKey="gym_business" highlighted onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                </Section>
            </section>

            {checkoutInfo && (
                <div className="fixed inset-0 z-[1000] bg-black/55 px-4 py-6" role="dialog" aria-modal="true">
                    <div className="flex min-h-full items-center justify-center">
                        <div className="marketplace-panel gv-panel-pad w-full max-w-xl">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-3">
                                    <div className="marketplace-section-kicker">Checkout</div>
                                    <h2 className="marketplace-section-title">Thanh toán qua SePay</h2>
                                    <p className="text-sm leading-7 text-gray-600">
                                        Chuyển khoản đúng số tiền và nội dung để kích hoạt gói tự động. Hệ thống sẽ xử lý trong vài phút sau khi giao dịch được xác nhận.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCheckoutInfo(null)}
                                    className="btn-secondary self-start px-4 text-xs font-bold uppercase tracking-[0.16em]"
                                >
                                    Đóng
                                </button>
                            </div>

                            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
                                <Row label="Gói" value={PLAN_LABELS[checkoutInfo.plan]} />
                                <Row label="Số tiền" value={`${checkoutInfo.amount.toLocaleString('vi-VN')}đ`} />
                                <Row label="Nội dung CK" value={checkoutInfo.description} mono />
                            </div>

                            <p className="mt-4 text-sm leading-6 text-gray-500">
                                Sau khi chuyển khoản thành công, bạn có thể đóng hộp thoại này. Gói sẽ tự cập nhật khi hệ thống xác nhận giao dịch.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
