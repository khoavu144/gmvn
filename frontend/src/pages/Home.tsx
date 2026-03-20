import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { logger } from '../lib/logger';
import apiClient from '../services/api';
import type { Trainer } from '../types';
import { usePrefetchProfile } from '../hooks/usePrefetchProfile';

// ─── Types ────────────────────────────────────────────────────────
type FeaturedTrainer = Trainer & {
    is_verified?: boolean;
    created_at?: string;
    slug?: string;
    user_type?: string;
};

// ─── Static data ──────────────────────────────────────────────────
const STATS = [
    { value: '1,200+', label: 'Huấn luyện viên' },
    { value: '89', label: 'Gym Center' },
    { value: '15,000+', label: 'Học viên' },
    { value: '4.9★', label: 'Đánh giá trung bình' },
];
const HOW_IT_WORKS = [
    { step: '01', icon: '🔍', title: 'Tìm Coach', desc: 'Lọc theo chuyên môn, mức giá, khu vực — tìm người phù hợp với mục tiêu của bạn.' },
    { step: '02', icon: '💬', title: 'Kết nối & Nhắn tin', desc: 'Trao đổi trực tiếp, đặt lịch tư vấn miễn phí và nhận giáo án cá nhân hoá.' },
    { step: '03', icon: '📈', title: 'Tập luyện & Theo dõi', desc: 'Ghi nhận tiến độ, nhận phản hồi liên tục và lột xác từng ngày.' },
];

// ─── Coach card link builder ───────────────────────────────────────
function coachLink(coach: FeaturedTrainer): string {
    if (coach.user_type === 'athlete') {
        return coach.slug ? `/athlete/${coach.slug}` : `/athletes/${coach.id}`;
    }
    return coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`;
}

// ─── Main component ────────────────────────────────────────────────
export default function Home() {
    const [coaches, setCoaches] = useState<FeaturedTrainer[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { prefetchCoach } = usePrefetchProfile();

    useEffect(() => {
        apiClient.get('/users/trainers')
            .then(res => {
                if (res.data?.data?.trainers) setCoaches(res.data.data.trainers);
            })
            .catch(logger.error)
            .finally(() => setIsLoading(false));
    }, []);

    const sorted = useMemo(() =>
        [...coaches].sort((a, b) => {
            if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
            if (!!a.avatar_url !== !!b.avatar_url) return a.avatar_url ? -1 : 1;
            return (b.created_at || '').localeCompare(a.created_at || '');
        }),
        [coaches]
    );

    // Hero bento: up to 4 coaches (separate from featured grid)
    const heroBento = sorted.slice(0, 4);
    // Featured grid: next 6 coaches (or same if not enough)
    const featured = sorted.slice(0, 6);

    return (
        // FIX: removed overflow:hidden from root — it was clipping the page and navbar
        <div style={{ fontFamily: "'Roboto', sans-serif", background: '#ffffff' }}>
            <Helmet>
                <title>GYMERVIET — Hệ sinh thái Gym & Coach số 1 Việt Nam</title>
                <meta name="description" content="Nền tảng kết nối Gymer, Coach và Gym Center hàng đầu Việt Nam. Tìm huấn luyện viên, phòng tập và giáo án cá nhân hoá." />
            </Helmet>

            {/* ══════════════════════════════════════════════════════════
                1. HERO — Asymmetric Editorial
             ══════════════════════════════════════════════════════════ */}
            <section style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 60%, #0a0a0a 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                // FIX: removed overflow:hidden — was blocking button clicks on mobile
            }}>
                {/* Grid texture — FIX: pointerEvents none so it never blocks clicks */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                    pointerEvents: 'none', // ← critical fix
                }} />

                <div style={{
                    maxWidth: 1280, margin: '0 auto', padding: '100px 32px 80px',
                    width: '100%', display: 'grid',
                    gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
                }} className="home-hero-grid">

                    {/* Left: Content */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <span style={{
                            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)',
                            display: 'block', marginBottom: 24,
                        }}>
                            Hệ sinh thái Fitness · Việt Nam
                        </span>

                        <h1 style={{
                            fontFamily: "'Roboto Condensed', 'Roboto', sans-serif",
                            fontSize: 'clamp(2.8rem, 5.5vw, 5rem)',
                            fontWeight: 900, color: '#ffffff',
                            letterSpacing: '-0.03em', lineHeight: 1,
                            textTransform: 'uppercase', marginBottom: 24, margin: '0 0 24px',
                        }}>
                            Nền tảng<br />
                            <span style={{ color: '#d4d4d4', fontStyle: 'italic' }}>Gym & Coach</span><br />
                            <span style={{ WebkitTextStroke: '2px rgba(255,255,255,0.5)', color: 'transparent' }}>
                                Số 1 Việt Nam.
                            </span>
                        </h1>

                        <p style={{
                            fontSize: '0.95rem', color: 'rgba(255,255,255,0.5)',
                            lineHeight: 1.8, maxWidth: 420, margin: '0 0 36px',
                        }}>
                            Kết nối trực tiếp với Coach chuyên nghiệp, phòng tập hàng đầu
                            và cộng đồng Gymer trên toàn quốc.
                        </p>

                        {/* CTA buttons — FIX: z-index 1 ensures they are above any overlaps */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48, position: 'relative', zIndex: 2 }}>
                            <Link to="/register" style={{
                                background: '#ffffff', color: '#0a0a0a',
                                padding: '14px 32px', fontSize: '0.82rem',
                                fontWeight: 900, textTransform: 'uppercase',
                                letterSpacing: '0.08em', borderRadius: 6,
                                textDecoration: 'none', display: 'inline-flex',
                                alignItems: 'center', gap: 8,
                            }}>
                                Bắt đầu miễn phí →
                            </Link>
                            <Link to="/coaches" style={{
                                background: 'transparent', color: '#ffffff',
                                padding: '14px 32px', fontSize: '0.82rem',
                                fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.08em', borderRadius: 6,
                                textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.25)',
                                display: 'inline-flex', alignItems: 'center',
                            }}>
                                Tìm Coach
                            </Link>
                        </div>

                    </div>

                    {/* Right: Coach bento mini — FIX: use CSS grid properly, no conflicting aspectRatio+gridRow */}
                    <div style={{ position: 'relative', zIndex: 1 }} className="home-hero-bento">
                        {/* FIX: explicit grid with proper row heights, no span conflicts */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gridTemplateRows: '1fr 1fr',
                            gap: 10,
                            height: 480,
                        }}>
                            {isLoading
                                ? [
                                    { col: '1', row: '1 / 3' },
                                    { col: '2', row: '1' },
                                    { col: '2', row: '2' },
                                ].map((pos, i) => (
                                    <div key={i} style={{
                                        background: 'rgba(255,255,255,0.06)',
                                        borderRadius: 16,
                                        gridColumn: pos.col,
                                        gridRow: pos.row,
                                    }} />
                                ))
                                : heroBento.slice(0, 3).map((coach, i) => {
                                    const link = coachLink(coach);
                                    const identifier = coach.slug || coach.id;
                                    // Explicit positions: card 0 = left full-height, card 1 = top-right, card 2 = bottom-right
                                    const gridPositions = [
                                        { gridColumn: '1', gridRow: '1 / 3' },
                                        { gridColumn: '2', gridRow: '1' },
                                        { gridColumn: '2', gridRow: '2' },
                                    ];
                                    return (
                                        <Link
                                            key={coach.id}
                                            to={link}
                                            onMouseEnter={() => prefetchCoach(identifier)}
                                            style={{
                                                display: 'block',
                                                borderRadius: 16, overflow: 'hidden',
                                                position: 'relative',
                                                background: '#1a1a1a',
                                                textDecoration: 'none',
                                                ...gridPositions[i],
                                            }}
                                        >
                                            {coach.avatar_url && (
                                                <img
                                                    src={coach.avatar_url}
                                                    alt={coach.full_name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
                                                />
                                            )}
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)', pointerEvents: 'none' }} />
                                            <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, color: 'white' }}>
                                                <div style={{ fontSize: i === 0 ? '0.95rem' : '0.78rem', fontWeight: 700, lineHeight: 1.2, fontFamily: "'Roboto Condensed', sans-serif" }}>{coach.full_name}</div>
                                                {coach.specialties?.[0] && (
                                                    <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                                        {coach.specialties[0]}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })
                            }
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                2. STATS BAR
             ══════════════════════════════════════════════════════════ */}
            <section style={{ background: '#ffffff', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{
                    maxWidth: 1200, margin: '0 auto', padding: '0 32px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexWrap: 'wrap',
                }}>
                    {STATS.map((s, i) => (
                        <div key={s.label} style={{
                            textAlign: 'center',
                            padding: '24px 40px',
                            borderRight: i < STATS.length - 1 ? '1px solid #f0f0f0' : 'none',
                        }}>
                            <div style={{
                                fontSize: '1.8rem', fontWeight: 900, color: '#0a0a0a',
                                fontFamily: "'Roboto Condensed', sans-serif",
                                letterSpacing: '-0.02em', lineHeight: 1,
                            }}>{s.value}</div>
                            <div style={{
                                fontSize: '0.7rem', color: '#9ca3af', marginTop: 5,
                                textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500,
                            }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                3. FEATURED COACHES
                FIX: removed fixed gridTemplateRows — let content determine height.
                FIX: lead card col-span NOT row-span to avoid broken grid math.
             ══════════════════════════════════════════════════════════ */}
            {(isLoading || featured.length > 0) && (
                <section style={{ background: '#0a0a0a', padding: '72px 32px 88px' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                        {/* Header */}
                        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                            <div>
                                <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 8 }}>
                                    Xác minh bởi GYMERVIET
                                </span>
                                <h2 style={{
                                    fontFamily: "'Roboto Condensed', sans-serif",
                                    fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
                                    fontWeight: 900, color: '#ffffff',
                                    textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1, margin: 0,
                                }}>
                                    Danh sách Nổi bật
                                </h2>
                            </div>
                            <Link to="/coaches" style={{
                                color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem',
                                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
                                textDecoration: 'none', paddingBottom: 2,
                                borderBottom: '1px solid rgba(255,255,255,0.15)',
                            }}>
                                Xem tất cả →
                            </Link>
                        </div>

                        {/* FIX: Simple uniform grid — no span shenanigans causing layout breaks */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 12,
                        }} className="home-coaches-grid">
                            {isLoading
                                ? Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} style={{ height: 300, background: 'rgba(255,255,255,0.05)', borderRadius: 20 }} />
                                ))
                                : featured.map((coach, i) => {
                                    const link = coachLink(coach);
                                    const identifier = coach.slug || coach.id;
                                    const isLead = i === 0;
                                    return (
                                        <Link
                                            key={`${coach.id}-${i}`}
                                            to={link}
                                            onMouseEnter={() => prefetchCoach(identifier)}
                                            style={{
                                                display: 'block',
                                                height: isLead ? 400 : 300,
                                                // FIX: lead card uses col-span (stays on same row) not row-span
                                                gridColumn: isLead ? 'span 2' : 'auto',
                                                borderRadius: 20,
                                                overflow: 'hidden',
                                                position: 'relative',
                                                textDecoration: 'none',
                                                background: '#1a1a1a',
                                            }}
                                        >
                                            {coach.avatar_url ? (
                                                <img
                                                    src={coach.avatar_url}
                                                    alt={coach.full_name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block', transition: 'transform 0.5s' }}
                                                    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                                                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)', fontFamily: "'Roboto Condensed', sans-serif" }}>
                                                    {coach.full_name.charAt(0)}
                                                </div>
                                            )}
                                            {/* Gradient overlay — FIX: pointerEvents none so it never absorbs clicks */}
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.25) 50%, transparent 100%)', pointerEvents: 'none' }} />

                                            {/* Info */}
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px', color: 'white', pointerEvents: 'none' }}>
                                                {coach.is_verified && (
                                                    <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', display: 'block', marginBottom: 4 }}>✓ Đã xác minh</span>
                                                )}
                                                {coach.specialties?.[0] && (
                                                    <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)', padding: '2px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, display: 'inline-block', marginBottom: 8, backdropFilter: 'blur(4px)' }}>
                                                        {coach.specialties[0]}
                                                    </span>
                                                )}
                                                <div style={{ fontSize: isLead ? '1.3rem' : '0.95rem', fontWeight: 900, fontFamily: "'Roboto Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                                                    {coach.full_name}
                                                </div>
                                                {coach.headline && (
                                                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
                                                        {coach.headline.slice(0, 60)}{coach.headline.length > 60 ? '…' : ''}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })
                            }
                        </div>
                    </div>
                </section>
            )}

            {/* ══════════════════════════════════════════════════════════
                4. HOW IT WORKS
             ══════════════════════════════════════════════════════════ */}
            <section style={{ background: '#f7f9fb', padding: '72px 32px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9ca3af', display: 'block', marginBottom: 12 }}>
                            Đơn giản & Minh bạch
                        </span>
                        <h2 style={{
                            fontFamily: "'Roboto Condensed', sans-serif",
                            fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                            fontWeight: 900, color: '#0a0a0a',
                            textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0,
                        }}>
                            Bắt đầu trong 3 bước
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="home-steps-grid">
                        {HOW_IT_WORKS.map((step, i) => (
                            <div key={step.step} style={{
                                background: '#ffffff', borderRadius: 20,
                                padding: '32px 28px',
                                border: '1px solid rgba(0,0,0,0.05)',
                                position: 'relative', overflow: 'hidden',
                            }}>
                                <div style={{
                                    position: 'absolute', top: -10, right: 10,
                                    fontFamily: "'Roboto Condensed', sans-serif",
                                    fontSize: '4.5rem', fontWeight: 900,
                                    color: 'rgba(0,0,0,0.04)', lineHeight: 1,
                                    userSelect: 'none', pointerEvents: 'none',
                                }}>
                                    {step.step}
                                </div>
                                <div style={{
                                    width: 40, height: 40,
                                    background: i === 1 ? '#0a0a0a' : '#f2f4f6',
                                    borderRadius: 12, display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '1.1rem', marginBottom: 18,
                                }}>
                                    {step.icon}
                                </div>
                                <h3 style={{
                                    fontFamily: "'Roboto Condensed', sans-serif",
                                    fontSize: '1.2rem', fontWeight: 900, color: '#0a0a0a',
                                    textTransform: 'uppercase', letterSpacing: '-0.01em', marginBottom: 10,
                                }}>
                                    {step.title}
                                </h3>
                                <p style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.7, margin: 0 }}>
                                    {step.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                5. 3-ROLE BENTO
             ══════════════════════════════════════════════════════════ */}
            <section style={{ background: '#ffffff', padding: '72px 32px' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 52 }}>
                        <h2 style={{
                            fontFamily: "'Roboto Condensed', sans-serif",
                            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
                            fontWeight: 900, color: '#0a0a0a',
                            textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1.05, margin: 0,
                        }}>
                            Một Nền Tảng.<br />Ba Cột Mốc.
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 16, alignItems: 'stretch' }} className="home-roles-grid">
                        {/* COACH */}
                        <div style={{
                            background: '#0a0a0a', borderRadius: 24,
                            padding: '52px 44px', minHeight: 480,
                            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070')",
                                backgroundSize: 'cover', backgroundPosition: 'center',
                                opacity: 0.2, filter: 'grayscale(40%)',
                                pointerEvents: 'none',
                            }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.6) 60%, transparent 100%)', pointerEvents: 'none' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.35)', display: 'block', marginBottom: 14 }}>
                                    Dành cho Huấn luyện viên
                                </span>
                                <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 14 }}>
                                    Thương hiệu<br />Cá nhân.
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem', maxWidth: 360, lineHeight: 1.7, marginBottom: 28 }}>
                                    Phát triển học viên không giới hạn địa lý. Quản lý lịch, giáo án và doanh thu trên một nền tảng.
                                </p>
                                <Link to="/register" style={{
                                    display: 'inline-block',
                                    background: '#ffffff', color: '#0a0a0a',
                                    padding: '12px 26px', fontSize: '0.78rem',
                                    fontWeight: 900, textTransform: 'uppercase',
                                    letterSpacing: '0.1em', borderRadius: 4, textDecoration: 'none',
                                }}>
                                    Đăng ký Coach →
                                </Link>
                            </div>
                        </div>

                        {/* Right stacked */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* ATHLETE */}
                            <div style={{ flex: 1, background: '#f7f9fb', borderRadius: 24, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9ca3af', display: 'block', marginBottom: 12 }}>Người tập luyện</span>
                                    <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '1.6rem', fontWeight: 900, color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 10 }}>
                                        Vượt Qua<br />Giới Hạn.
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                        Kết nối với Top Coach, nhận giáo án cá nhân hóa và theo dõi tiến độ từng ngày.
                                    </p>
                                </div>
                                <Link to="/register" style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0a0a0a', textDecoration: 'none', borderBottom: '2px solid #0a0a0a', paddingBottom: 2, display: 'inline-block', marginTop: 20 }}>
                                    Bắt đầu ngay →
                                </Link>
                            </div>
                            {/* GYM */}
                            <div style={{ flex: 1, background: '#111111', borderRadius: 24, padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)', display: 'block', marginBottom: 12 }}>Cơ sở vật chất</span>
                                    <h3 style={{ fontFamily: "'Roboto Condensed', sans-serif", fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 10 }}>
                                        Tối Ưu<br />Vận Hành.
                                    </h3>
                                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                        Số hóa toàn bộ chi nhánh. Thu hút hội viên mới và quản lý doanh thu ngay trên lòng bàn tay.
                                    </p>
                                </div>
                                <Link to="/register" style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', borderBottom: '1.5px solid rgba(255,255,255,0.2)', paddingBottom: 2, display: 'inline-block', marginTop: 20 }}>
                                    Trở thành Đối Tác →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════════════
                6. FINAL CTA
             ══════════════════════════════════════════════════════════ */}
            <section style={{ background: '#0a0a0a', padding: '80px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.05,
                    background: 'radial-gradient(ellipse at 20% 50%, #ffffff 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, #ffffff 0%, transparent 60%)',
                    pointerEvents: 'none', // FIX: always none on decorative layers
                }} />
                <div style={{ position: 'relative', maxWidth: 650, margin: '0 auto' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', display: 'block', marginBottom: 18 }}>
                        Không có lối tắt
                    </span>
                    <h2 style={{
                        fontFamily: "'Roboto Condensed', sans-serif",
                        fontSize: 'clamp(2.2rem, 5.5vw, 4.5rem)',
                        fontWeight: 900, color: '#ffffff',
                        textTransform: 'uppercase', letterSpacing: '-0.03em',
                        lineHeight: 1, margin: '0 0 16px',
                    }}>
                        Chỉ có<br />Gymerviet.
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9rem', lineHeight: 1.7, margin: '0 0 36px' }}>
                        Hành trình lột xác bắt đầu từ quyết định đầu tiên.
                        Chọn đúng Coach, đúng phòng tập, đúng nền tảng.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                        <Link to="/register" style={{
                            background: '#ffffff', color: '#0a0a0a',
                            padding: '14px 32px', fontSize: '0.82rem',
                            fontWeight: 900, textTransform: 'uppercase',
                            letterSpacing: '0.1em', borderRadius: 6, textDecoration: 'none',
                        }}>
                            Trở Thành Hội Viên
                        </Link>
                        <Link to="/coaches" style={{
                            background: 'transparent', color: 'rgba(255,255,255,0.6)',
                            padding: '14px 32px', fontSize: '0.82rem',
                            fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.1em', borderRadius: 6, textDecoration: 'none',
                            border: '1.5px solid rgba(255,255,255,0.15)',
                        }}>
                            Tìm Coach ngay
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Responsive CSS ─────────────────────────────────────── */}
            <style>{`
                @media (max-width: 1024px) {
                    .home-roles-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 900px) {
                    .home-hero-grid { grid-template-columns: 1fr !important; padding: 72px 20px 56px !important; }
                    .home-hero-bento { display: none !important; }
                    .home-coaches-grid { grid-template-columns: 1fr 1fr !important; }
                    .home-coaches-grid a:first-child { grid-column: 1 / -1 !important; height: 300px !important; }
                    .home-steps-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 600px) {
                    .home-coaches-grid { grid-template-columns: 1fr !important; }
                    .home-coaches-grid a:first-child { grid-column: auto !important; }
                }
            `}</style>
        </div>
    );
}