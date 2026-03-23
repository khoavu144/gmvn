import { useState, type ReactNode } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import apiClient from '../services/api';
import { trackEvent } from '../lib/analytics';
import { extractApiErrorMessage } from '../lib/apiErrors';
import { SITE_OG_IMAGE, SITE_ORIGIN, SITE_TWITTER_HANDLE } from '../lib/site';

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
    free: 'Bắt đầu với bộ tính năng nền tảng.',
    coach_pro: 'Cho coach đang mở rộng tệp học viên.',
    coach_elite: 'Cho coach xem GYMERVIET là kênh tăng trưởng chính.',
    athlete_premium: 'Cho người tập muốn theo dõi tiến độ sâu hơn.',
    gym_business: 'Cho gym cần tăng khám phá và quản lý nhiều chi nhánh.',
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

const HERO_POINTS = [
    {
        title: 'Giá rõ ràng',
        body: 'Mọi gói đều theo năm để so sánh nhanh.',
    },
    {
        title: 'Kích hoạt nhanh',
        body: 'Thanh toán đúng nội dung, hệ thống sẽ tự xử lý.',
    },
] as const;

const ROLE_VIEWS = {
    coach: {
        kicker: 'Coach plans',
        title: 'Dành cho Coach',
        subtitle: 'So sánh theo đúng ngưỡng tăng trưởng của coach.',
        plans: ['free', 'coach_pro', 'coach_elite'] as PlanKey[],
        recommended: 'coach_pro' as PlanKey,
    },
    athlete: {
        kicker: 'Athlete plans',
        title: 'Dành cho Athlete',
        subtitle: 'Ít lựa chọn hơn để quyết định nâng cấp nhanh hơn.',
        plans: ['free', 'athlete_premium'] as PlanKey[],
        recommended: 'athlete_premium' as PlanKey,
    },
    gym: {
        kicker: 'Gym Center plans',
        title: 'Dành cho Gym Center',
        subtitle: 'Tập trung vào khám phá chi nhánh và vận hành đội ngũ.',
        plans: ['free', 'gym_business'] as PlanKey[],
        recommended: 'gym_business' as PlanKey,
    },
} as const;

type PricingRoleView = keyof typeof ROLE_VIEWS;

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
    const [roleView, setRoleView] = useState<PricingRoleView>(
        user?.user_type === 'athlete' ? 'athlete' : user?.user_type === 'gym_owner' ? 'gym' : 'coach'
    );
    const canonicalBase = SITE_ORIGIN;
    const activeView = ROLE_VIEWS[roleView];

    const handleUpgrade = async (plan: PlanKey) => {
        trackEvent('pricing_cta_click', {
            plan,
            role_view: roleView,
            authenticated: Boolean(user),
        });
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
            setError(extractApiErrorMessage(err, 'Lỗi khi tạo đơn thanh toán'));
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
                    content="Chọn gói GYMERVIET phù hợp theo từng vai trò."
                />
                <link rel="canonical" href={`${canonicalBase}/pricing`} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Bảng giá — GYMERVIET" />
                <meta
                    property="og:description"
                    content="Bảng giá rõ ràng cho coach, athlete và gym center."
                />
                <meta property="og:url" content={`${canonicalBase}/pricing`} />
                <meta property="og:image" content={SITE_OG_IMAGE} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
                <meta name="twitter:title" content="Bảng giá — GYMERVIET" />
                <meta
                    name="twitter:description"
                    content="Chọn gói phù hợp cho coach, athlete và gym center."
                />
                <meta name="twitter:image" content={SITE_OG_IMAGE} />
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
                                Ít nhiễu hơn, dễ so sánh hơn và tập trung đúng vào quyết định nâng cấp.
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
                                    onClick={() => trackEvent('homepage_cta_click', {
                                        cta_id: 'pricing_register',
                                        target: '/register',
                                    })}
                                    className="btn-primary px-6 text-sm font-bold uppercase tracking-[0.16em]"
                                >
                                    Tạo tài khoản
                                </Link>
                                <Link
                                    to="/coaches"
                                    onClick={() => trackEvent('homepage_cta_click', {
                                        cta_id: 'pricing_browse_coaches',
                                        target: '/coaches',
                                    })}
                                    className="btn-secondary px-6 text-sm font-bold uppercase tracking-[0.16em]"
                                >
                                    Khám phá Coach
                                </Link>
                            </div>
                        </div>

                            <div className="marketplace-panel gv-panel-pad">
                            <div className="marketplace-section-kicker">Đang xem theo vai trò</div>
                            <h2 className="marketplace-section-title mt-2">{activeView.title}</h2>
                            <p className="mt-3 text-sm leading-7 text-gray-600">{activeView.subtitle}</p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                {(Object.keys(ROLE_VIEWS) as PricingRoleView[]).map((key) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => {
                                            trackEvent('browse_filter_use', {
                                                route: 'pricing',
                                                action: 'role_view',
                                                value: key,
                                            });
                                            setRoleView(key);
                                        }}
                                        className={key === roleView ? 'filter-chip filter-chip-active' : 'filter-chip filter-chip-idle'}
                                    >
                                        {ROLE_VIEWS[key].title}
                                    </button>
                                ))}
                            </div>
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
                    kicker={activeView.kicker}
                    title={activeView.title}
                    subtitle={activeView.subtitle}
                    columnsClassName={activeView.plans.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}
                >
                    {activeView.plans.map((planKey) => (
                        <PlanColumn
                            key={planKey}
                            planKey={planKey}
                            highlighted={planKey === activeView.recommended}
                            onUpgrade={handleUpgrade}
                            isLoading={upgradeLoading}
                        />
                    ))}
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
                                        Chuyển khoản đúng số tiền và nội dung để kích hoạt gói tự động.
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
                                Gói sẽ tự cập nhật sau khi giao dịch được xác nhận.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
