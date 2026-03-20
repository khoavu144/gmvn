import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import apiClient from '../services/api';


const PLAN_LABELS: Record<string, string> = {
    free: 'Miễn phí', coach_pro: 'Coach Pro', coach_elite: 'Coach Elite',
    athlete_premium: 'Athlete Premium', gym_business: 'Gym Business',
};

const DESCRIPTIONS: Record<string, string[]> = {
    free:             ['Tạo tối đa 3 chương trình tập', 'Tối đa 10 học viên', '1 chi nhánh Gym'],
    coach_pro:        ['Không giới hạn chương trình', '50 học viên cùng lúc', 'Badge Pro trên hồ sơ', 'Ưu tiên tìm kiếm', 'Share card tuỳ chỉnh'],
    coach_elite:      ['Không giới hạn chương trình & học viên', 'Top tìm kiếm', 'Badge Elite nổi bật', 'Share card tuỳ chỉnh', 'Hỗ trợ ưu tiên'],
    athlete_premium:  ['Ảnh tiến trình không giới hạn', 'Lịch sử đăng ký đầy đủ', 'So sánh nhiều Coach', 'Ẩn quảng cáo'],
    gym_business:     ['Chi nhánh không giới hạn', 'Số HLV không giới hạn', 'Gallery không giới hạn', 'Featured trong tìm kiếm', 'Analytics lượt xem'],
};

const PRICES: Record<string, number> = {
    free: 0, coach_pro: 499999, coach_elite: 999999,
    athlete_premium: 999999, gym_business: 999999,
};

function formatPrice(p: number) {
    if (p === 0) return 'Miễn phí';
    return p.toLocaleString('vi-VN') + 'đ / năm';
}

function PlanColumn({ planKey, highlighted, onUpgrade, isLoading }: {
    planKey: string; highlighted?: boolean;
    onUpgrade: (plan: string) => void; isLoading: string | null;
}) {
    const price = PRICES[planKey];
    const isFree = price === 0;
    return (
        <div style={{
            flex: 1, border: highlighted ? '2px solid #111' : '1.5px solid #e5e7eb',
            borderRadius: 8, padding: '28px 24px',
            background: highlighted ? '#0f172a' : '#fff',
            color: highlighted ? '#fff' : '#111',
            display: 'flex', flexDirection: 'column', gap: 16,
            boxShadow: highlighted ? '0 12px 40px rgba(0,0,0,0.18)' : 'none',
            position: 'relative',
        }}>
            {highlighted && (
                <span style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: '#fff', color: '#0f172a',
                    padding: '3px 16px', borderRadius: 8,
                    fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
                    textTransform: 'uppercase', whiteSpace: 'nowrap',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>Phổ biến nhất</span>
            )}
            <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.6, margin: '0 0 6px' }}>
                    {PLAN_LABELS[planKey]}
                </p>
                <p style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{formatPrice(price)}</p>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {DESCRIPTIONS[planKey]?.map(feat => (
                    <li key={feat} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'flex-start', gap: 8, opacity: highlighted ? 1 : 0.85 }}>
                        <span style={{ color: highlighted ? '#4ade80' : '#16a34a', flexShrink: 0, fontWeight: 800 }}>✓</span>
                        {feat}
                    </li>
                ))}
            </ul>
            {!isFree && (
                <button
                    onClick={() => onUpgrade(planKey)}
                    disabled={isLoading === planKey}
                    style={{
                        width: '100%', padding: '13px 0', borderRadius: 8, border: 'none',
                        background: highlighted ? '#fff' : '#0f172a',
                        color: highlighted ? '#0f172a' : '#fff',
                        fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer',
                        opacity: isLoading === planKey ? 0.6 : 1,
                    }}
                >
                    {isLoading === planKey ? 'Đang xử lý...' : 'Nâng cấp ngay'}
                </button>
            )}
        </div>
    );
}

export default function PricingPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();
    const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);
    const [checkoutInfo, setCheckoutInfo] = useState<{ description: string; amount: number; plan: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleUpgrade = async (plan: string) => {
        if (!user) { navigate('/login'); return; }
        setUpgradeLoading(plan);
        setError(null);
        try {
            const res = await apiClient.post('/platform/checkout', { plan });
            setCheckoutInfo({ description: res.data.description, amount: res.data.amount, plan: res.data.plan });
        } catch (err: any) {
            setError(err?.response?.data?.error ?? 'Lỗi khi tạo đơn thanh toán');
        } finally {
            setUpgradeLoading(null);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Roboto', sans-serif" }}>
            <Helmet>
                <title>Bảng giá — GYMERVIET</title>
                <meta name="description" content="Chọn gói phù hợp để mở khoá toàn bộ tính năng GYMERVIET. Thanh toán theo năm, huỷ bất cứ lúc nào." />
                <link rel="canonical" href="https://gymerviet.com/pricing" />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="Bảng giá — GYMERVIET" />
                <meta property="og:description" content="Chọn gói phù hợp. Thanh toán theo năm, huỷ bất cứ lúc nào." />
                <meta property="og:url" content="https://gymerviet.com/pricing" />
                <meta property="og:image" content="https://gymerviet.com/og-default.jpg" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:site" content="@gymerviet" />
                <meta name="twitter:title" content="Bảng giá — GYMERVIET" />
                <meta name="twitter:description" content="Chọn gói phù hợp. Thanh toán theo năm, huỷ bất cứ lúc nào." />
                {/* JSON-LD: FAQPage — helps Google show rich results for pricing questions */}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'FAQPage',
                    mainEntity: [
                        {
                            '@type': 'Question',
                            name: 'Gói Coach Pro có những gì?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Không giới hạn chương trình, 50 học viên cùng lúc, Badge Pro trên hồ sơ, ưu tiên tìm kiếm, share card tuỳ chỉnh. Giá 499.999đ/năm.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'Gói Coach Elite có những gì?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Không giới hạn chương trình & học viên, top tìm kiếm, Badge Elite nổi bật, share card tuỳ chỉnh, hỗ trợ ưu tiên. Giá 999.999đ/năm.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'Có thể huỷ bất kỳ lúc nào không?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Có. Bạn có thể huỷ bất kỳ lúc nào. Gói sẽ hết hiệu lực sau khi chu kỳ hiện tại kết thúc.' },
                        },
                        {
                            '@type': 'Question',
                            name: 'GYMERVIET hỗ trợ phương thức thanh toán nào?',
                            acceptedAnswer: { '@type': 'Answer', text: 'Hỗ trợ chuyển khoản ngân hàng qua SePay. Gói được kích hoạt tự động ngay sau khi xác nhận giao dịch.' },
                        },
                    ],
                })}</script>
            </Helmet>


            {/* Hero */}
            <div style={{ background: '#0f172a', color: '#fff', textAlign: 'center', padding: '72px 24px 80px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.5, marginBottom: 16 }}>Bảng giá</p>
                <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', fontWeight: 900, margin: '0 0 16px' }}>Đầu tư vào hành trình của bạn</h1>
                <p style={{ fontSize: '0.95rem', opacity: 0.65, maxWidth: 480, margin: '0 auto' }}>
                    Thanh toán theo năm. Huỷ bất cứ lúc nào. Mọi gói đều bao gồm toàn bộ tính năng cơ bản.
                </p>
            </div>

            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px 80px' }}>

                {/* Error */}
                {error && (
                    <div style={{ margin: '32px 0 0', padding: '14px 20px', background: '#fef2f2', border: '1.5px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: '0.85rem' }}>
                        ⚠ {error}
                    </div>
                )}

                {/* Checkout modal */}
                {checkoutInfo && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
                        <div style={{ background: '#fff', borderRadius: 8, padding: 32, maxWidth: 420, width: '100%', textAlign: 'center' }}>
                            <p style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>Thanh toán qua SePay</p>
                            <p style={{ fontSize: '0.82rem', color: '#6b7280', marginBottom: 20 }}>
                                Chuyển khoản đúng số tiền và nội dung để kích hoạt gói tự động.
                            </p>
                            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '16px 20px', marginBottom: 20, textAlign: 'left' }}>
                                <Row label="Gói" value={PLAN_LABELS[checkoutInfo.plan]} />
                                <Row label="Số tiền" value={checkoutInfo.amount.toLocaleString('vi-VN') + 'đ'} />
                                <Row label="Nội dung CK" value={checkoutInfo.description} mono />
                            </div>
                            <p style={{ fontSize: '0.72rem', color: '#9ca3af', marginBottom: 20 }}>
                                Sau khi chuyển khoản thành công, gói sẽ được kích hoạt tự động trong vài phút.
                            </p>
                            <button onClick={() => setCheckoutInfo(null)} style={{ padding: '10px 28px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 700 }}>Đóng</button>
                        </div>
                    </div>
                )}

                {/* Coach Plans */}
                <Section title="Dành cho Coach" subtitle="Mở rộng quy mô huấn luyện không giới hạn">
                    <PlanColumn planKey="free" onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                    <PlanColumn planKey="coach_pro" highlighted onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                    <PlanColumn planKey="coach_elite" onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                </Section>

                {/* Athlete Plans */}
                <Section title="Dành cho Athlete" subtitle="Theo dõi tiến độ và phát triển chuyên sâu">
                    <PlanColumn planKey="free" onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                    <PlanColumn planKey="athlete_premium" highlighted onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                </Section>

                {/* Gym Plans */}
                <Section title="Dành cho Gym Center" subtitle="Quản lý toàn diện chuỗi cơ sở">
                    <PlanColumn planKey="free" onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                    <PlanColumn planKey="gym_business" highlighted onUpgrade={handleUpgrade} isLoading={upgradeLoading} />
                </Section>
            </div>
        </div>
    );
}

const Section = ({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) => (
    <div style={{ marginTop: 56 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px' }}>{title}</h2>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>{subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {children}
        </div>
    </div>
);

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>{label}</span>
        <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: mono ? 'monospace' : undefined, wordBreak: 'break-all' }}>{value}</span>
    </div>
);
