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

// ─── Stats bar data ────────────────────────────────────────────────
const STATS = [
    { value: '1,200+', label: 'Huấn luyện viên' },
    { value: '89', label: 'Gym Center' },
    { value: '15,000+', label: 'Học viên' },
    { value: '4.9★', label: 'Đánh giá trung bình' },
];

// ─── How it works steps ────────────────────────────────────────────
const HOW_IT_WORKS = [
    { step: '01', title: 'Tìm Coach', desc: 'Lọc theo chuyên môn, mức giá, khu vực — tìm người phù hợp với mục tiêu của bạn.' },
    { step: '02', title: 'Kết nối & Nhắn tin', desc: 'Trao đổi trực tiếp, đặt lịch tư vấn miễn phí và nhận giáo án cá nhân hoá.' },
    { step: '03', title: 'Tập luyện & Theo dõi', desc: 'Ghi nhận tiến độ, nhận phản hồi liên tục và lột xác từng ngày.' },
];

// ─── Home component ────────────────────────────────────────────────
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

    const featured = useMemo(() =>
        [...coaches].sort((a, b) => {
            if (a.is_verified !== b.is_verified) return a.is_verified ? -1 : 1;
            if (!!a.avatar_url !== !!b.avatar_url) return a.avatar_url ? -1 : 1;
            return (b.created_at || '').localeCompare(a.created_at || '');
        }).slice(0, 6),
        [coaches]
    );

    // Hero bento mini — top 3 coaches for the right panel
    const heroBentoCoaches = featured.slice(0, 4);

    return (
        <div style={{ fontFamily: "'Roboto', sans-serif", background: '#ffffff', overflow: 'hidden' }}>
            <Helmet>
                <title>GYMERVIET — Hệ sinh thái Gym & Coach số 1 Việt Nam</title>
                <meta name="description" content="Nền tảng kết nối Gymer, Coach và Gym Center hàng đầu Việt Nam. Tìm huấn luyện viên, phòng tập và giáo án cá nhân hoá." />
            </Helmet>

            {/* ═══════════════════════════════════════════════════════════
                1. HERO — Asymmetric Editorial
                Left: Headline + stats + CTA
                Right: Coach bento mini grid
             ══════════════════════════════════════════════════════════ */}
            <section style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 60%, #0a0a0a 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* Subtle grid texture */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />

                <div style={{
                    maxWidth: 1280, margin: '0 auto', padding: '80px 32px',
                    width: '100%', display: 'grid',
                    gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center',
                }} className="home-hero-grid">
                    {/* Left: Content */}
                    <div>
                        <span style={{
                            fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)',
                            display: 'block', marginBottom: 24,
                        }}>
                            Hệ sinh thái Fitness · Việt Nam
                        </span>

                        <h1 style={{
                            fontFamily: "'Roboto Condensed', 'Roboto', sans-serif",
                            fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                            fontWeight: 900, color: '#ffffff',
                            letterSpacing: '-0.03em', lineHeight: 1,
                            textTransform: 'uppercase', marginBottom: 24,
                        }}>
                            Nền tảng<br />
                            <span style={{ color: '#e5e5e5', fontStyle: 'italic' }}>Gym & Coach</span><br />
                            <span style={{ WebkitTextStroke: '2px #ffffff', color: 'transparent' }}>
                                Số 1 Việt Nam.
                            </span>
                        </h1>

                        <p style={{
                            fontSize: '1rem', color: 'rgba(255,255,255,0.55)',
                            lineHeight: 1.7, maxWidth: 400, marginBottom: 40,
                        }}>
                            Kết nối trực tiếp với Coach chuyên nghiệp, phòng tập hàng đầu
                            và cộng đồng Gymer trên toàn quốc. Lộ trình cá nhân hoá — không phán xét.
                        </p>

                        {/* CTA buttons */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 52 }}>
                            <Link to="/register" style={{
                                background: '#ffffff', color: '#0a0a0a',
                                padding: '14px 32px', fontSize: '0.82rem',
                                fontWeight: 900, textTransform: 'uppercase',
                                letterSpacing: '0.08em', borderRadius: 4,
                                textDecoration: 'none', display: 'inline-flex',
                                alignItems: 'center', gap: 8, transition: 'all 0.15s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.background = '#e5e5e5')}
                                onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                            >
                                Bắt đầu miễn phí →
                            </Link>
                            <Link to="/coaches" style={{
                                background: 'transparent', color: '#ffffff',
                                padding: '14px 32px', fontSize: '0.82rem',
                                fontWeight: 700, textTransform: 'uppercase',
                                letterSpacing: '0.08em', borderRadius: 4,
                                textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.2)',
                                display: 'inline-flex', alignItems: 'center',
                                transition: 'border-color 0.15s',
                            }}
                                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)')}
                                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)')}
                            >
                                Tìm Coach
                            </Link>
                        </div>

                        {/* Inline stats */}
                        <div style={{
                            display: 'flex', gap: 32, flexWrap: 'wrap',
                            paddingTop: 28, borderTop: '1px solid rgba(255,255,255,0.08)',
                        }}>
                            {[
                                { val: '1,200+', lbl: 'Coach' },
                                { val: '89', lbl: 'Gym' },
                                { val: '15k+', lbl: 'Học viên' },
                            ].map(s => (
                                <div key={s.lbl}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', fontFamily: "'Roboto Condensed', sans-serif" }}>{s.val}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>{s.lbl}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Coach bento mini */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="home-hero-bento">
                        {isLoading
                            ? Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} style={{
                                    aspectRatio: i === 0 ? '1/1.4' : '1',
                                    background: 'rgba(255,255,255,0.06)',
                                    borderRadius: 20,
                                    gridRow: i === 0 ? 'span 2' : 'auto',
                                }} />
                            ))
                            : heroBentoCoaches.map((coach, i) => {
                                const link = coach.user_type === 'athlete'
                                    ? (coach.slug ? `/athlete/${coach.slug}` : `/athletes/${coach.id}`)
                                    : (coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`);
                                const identifier = coach.slug || coach.id;
                                return (
                                    <Link
                                        key={coach.id}
                                        to={link}
                                        onMouseEnter={() => prefetchCoach(identifier)}
                                        style={{
                                            display: 'block',
                                            aspectRatio: i === 0 ? '0.8' : '1',
                                            gridRow: i === 0 ? 'span 2' : 'auto',
                                            borderRadius: 20,
                                            overflow: 'hidden',
                                            position: 'relative',
                                            background: 'rgba(255,255,255,0.06)',
                                            textDecoration: 'none',
                                        }}
                                    >
                                        {coach.avatar_url && (
                                            <img src={coach.avatar_url} alt={coach.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                                        )}
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 55%)',
                                        }} />
                                        <div style={{
                                            position: 'absolute', bottom: 14, left: 14, right: 14, color: 'white',
                                        }}>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.2 }}>{coach.full_name}</div>
                                            {coach.specialties?.[0] && (
                                                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.55)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
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
            </section>

            {/* ═══════════════════════════════════════════════════════════
                2. STATS BAR — Social proof bar
             ══════════════════════════════════════════════════════════ */}
            <section style={{
                background: '#ffffff',
                borderTop: '1px solid #f0f0f0',
                borderBottom: '1px solid #f0f0f0',
                padding: '28px 32px',
            }}>
                <div style={{
                    maxWidth: 1280, margin: '0 auto',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: 0, flexWrap: 'wrap',
                }}>
                    {STATS.map((s, i) => (
                        <div key={s.label} style={{
                            textAlign: 'center', padding: '12px 48px',
                            borderRight: i < STATS.length - 1 ? '1px solid #e5e5e5' : 'none',
                        }}>
                            <div style={{
                                fontSize: '1.8rem', fontWeight: 900, color: '#0a0a0a',
                                fontFamily: "'Roboto Condensed', sans-serif",
                                letterSpacing: '-0.02em', lineHeight: 1,
                            }}>{s.value}</div>
                            <div style={{
                                fontSize: '0.72rem', color: '#9ca3af', marginTop: 4,
                                textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 500,
                            }}>{s.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                3. FEATURED COACHES — Improved grid with clear CTA
             ══════════════════════════════════════════════════════════ */}
            {(isLoading || featured.length > 0) && (
                <section style={{ background: '#0a0a0a', padding: '80px 32px 96px' }}>
                    <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                        {/* Header */}
                        <div style={{ marginBottom: 48, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                            <div>
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 10 }}>
                                    Được xác minh
                                </span>
                                <h2 style={{
                                    fontFamily: "'Roboto Condensed', sans-serif",
                                    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                                    fontWeight: 900, color: '#ffffff',
                                    textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1,
                                    margin: 0,
                                }}>
                                    Danh sách<br />Nổi bật
                                </h2>
                            </div>
                            <Link to="/coaches" style={{
                                color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem',
                                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em',
                                textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6,
                                paddingBottom: 2, borderBottom: '1px solid rgba(255,255,255,0.15)',
                                transition: 'color 0.12s',
                            }}>
                                Xem tất cả → 
                            </Link>
                        </div>

                        {/* Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gridTemplateRows: 'repeat(2, 300px)',
                            gap: 12,
                        }} className="home-coaches-grid">
                            {isLoading
                                ? Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, animation: 'pulse 1.5s infinite' }} />
                                ))
                                : featured.map((coach, index) => {
                                    const link = coach.user_type === 'athlete'
                                        ? (coach.slug ? `/athlete/${coach.slug}` : `/athletes/${coach.id}`)
                                        : (coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`);
                                    const identifier = coach.slug || coach.id;
                                    // First card is larger
                                    const isLead = index === 0;
                                    return (
                                        <Link
                                            key={`${coach.id}-${index}`}
                                            to={link}
                                            onMouseEnter={() => prefetchCoach(identifier)}
                                            style={{
                                                display: 'block',
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
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', transition: 'transform 0.5s' }}
                                                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                                                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                                />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', fontWeight: 900, color: 'rgba(255,255,255,0.12)' }}>
                                                    {coach.full_name.charAt(0)}
                                                </div>
                                            )}
                                            {/* Gradient overlay */}
                                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />

                                            {/* Info */}
                                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px', color: 'white' }}>
                                                {coach.is_verified && (
                                                    <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>✓ Verified</span>
                                                )}
                                                {coach.specialties?.[0] && (
                                                    <span style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)', padding: '3px 10px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, display: 'inline-block', marginBottom: 8 }}>
                                                        {coach.specialties[0]}
                                                    </span>
                                                )}
                                                <div style={{ fontSize: isLead ? '1.4rem' : '1rem', fontWeight: 900, fontFamily: "'Roboto Condensed', sans-serif", textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                                                    {coach.full_name}
                                                </div>
                                                {(coach.headline || coach.bio) && (
                                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                                                        {(coach.headline || coach.bio || '').slice(0, 60)}{(coach.headline || coach.bio || '').length > 60 ? '…' : ''}
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

            {/* ═══════════════════════════════════════════════════════════
                4. HOW IT WORKS — 3 steps
             ══════════════════════════════════════════════════════════ */}
            <section style={{ background: '#f7f9fb', padding: '80px 32px' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#9ca3af', display: 'block', marginBottom: 12 }}>
                            Đơn giản & Minh bạch
                        </span>
                        <h2 style={{
                            fontFamily: "'Roboto Condensed', sans-serif",
                            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900,
                            color: '#0a0a0a', textTransform: 'uppercase', letterSpacing: '-0.02em',
                            lineHeight: 1.1, margin: 0,
                        }}>
                            Bắt đầu trong<br />3 bước đơn giản
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }} className="home-steps-grid">
                        {HOW_IT_WORKS.map((step, i) => (
                            <div key={step.step} style={{
                                background: '#ffffff',
                                borderRadius: 24, padding: 36,
                                border: '1px solid rgba(0,0,0,0.06)',
                                position: 'relative', overflow: 'hidden',
                            }}>
                                <div style={{
                                    position: 'absolute', top: -12, right: -8,
                                    fontFamily: "'Roboto Condensed', sans-serif",
                                    fontSize: '5rem', fontWeight: 900, color: 'rgba(0,0,0,0.04)',
                                    lineHeight: 1, userSelect: 'none',
                                }}>
                                    {step.step}
                                </div>
                                <div style={{
                                    width: 40, height: 40, background: i === 1 ? '#0a0a0a' : '#f2f4f6',
                                    borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.1rem', marginBottom: 20,
                                }}>
                                    {i === 0 ? '🔍' : i === 1 ? '💬' : '📈'}
                                </div>
                                <h3 style={{
                                    fontFamily: "'Roboto Condensed', sans-serif",
                                    fontSize: '1.3rem', fontWeight: 900, color: '#0a0a0a',
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

            {/* ═══════════════════════════════════════════════════════════
                5. 3-ROLE BENTO — Coach / Athlete / Gym
             ══════════════════════════════════════════════════════════ */}
            <section style={{ background: '#ffffff', padding: '80px 32px' }}>
                <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: 56 }}>
                        <h2 style={{
                            fontFamily: "'Roboto Condensed', sans-serif",
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#0a0a0a',
                            textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1, margin: 0,
                        }}>
                            Một Nền Tảng.<br />Ba Cột Mốc.
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: 16, alignItems: 'stretch' }} className="home-roles-grid">
                        {/* COACH — Large card */}
                        <div style={{
                            background: '#0a0a0a',
                            borderRadius: 24, padding: '52px 48px', minHeight: 520,
                            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <div style={{
                                position: 'absolute', inset: 0,
                                backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070')",
                                backgroundSize: 'cover', backgroundPosition: 'center',
                                opacity: 0.25, filter: 'grayscale(30%)',
                            }} />
                            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0a 0%, transparent 60%)' }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 16 }}>
                                    Dành cho Huấn luyện viên
                                </span>
                                <h3 style={{
                                    fontFamily: "'Roboto Condensed', sans-serif",
                                    fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900,
                                    color: '#ffffff', textTransform: 'uppercase',
                                    letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 16,
                                }}>
                                    Thương hiệu<br />Cá nhân.
                                </h3>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', maxWidth: 380, lineHeight: 1.7, marginBottom: 28 }}>
                                    Phát triển học viên không giới hạn địa lý. Quản lý lịch tập, giáo án và doanh thu chuyên nghiệp trên một nền tảng.
                                </p>
                                <Link to="/register" style={{
                                    display: 'inline-flex', alignItems: 'center',
                                    background: '#ffffff', color: '#0a0a0a',
                                    padding: '13px 28px', fontSize: '0.78rem',
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
                            <div style={{ flex: 1, background: '#f7f9fb', borderRadius: 24, padding: '36px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <div>
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9ca3af', display: 'block', marginBottom: 14 }}>
                                        Người tập luyện
                                    </span>
                                    <h3 style={{
                                        fontFamily: "'Roboto Condensed', sans-serif",
                                        fontSize: '1.8rem', fontWeight: 900, color: '#0a0a0a',
                                        textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 12,
                                    }}>
                                        Vượt Qua<br />Giới Hạn.
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                        Kết nối trực tiếp với Top Coach, nhận giáo án cá nhân hóa và theo dõi tiến độ từng ngày.
                                    </p>
                                </div>
                                <Link to="/register" style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#0a0a0a', textDecoration: 'none', borderBottom: '2px solid #0a0a0a', paddingBottom: 2, display: 'inline-block', marginTop: 20 }}>
                                    Bắt đầu ngay →
                                </Link>
                            </div>

                            {/* GYM CENTER */}
                            <div style={{ flex: 1, background: '#111111', borderRadius: 24, padding: '36px 36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 14 }}>
                                        Cơ sở vật chất
                                    </span>
                                    <h3 style={{
                                        fontFamily: "'Roboto Condensed', sans-serif",
                                        fontSize: '1.8rem', fontWeight: 900, color: '#ffffff',
                                        textTransform: 'uppercase', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 12,
                                    }}>
                                        Tối Ưu<br />Vận Hành.
                                    </h3>
                                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', lineHeight: 1.6 }}>
                                        Số hóa toàn bộ chi nhánh. Thu hút hội viên mới và quản lý doanh thu ngay trên lòng bàn tay.
                                    </p>
                                </div>
                                <Link to="/register" style={{ fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', borderBottom: '1.5px solid rgba(255,255,255,0.25)', paddingBottom: 2, display: 'inline-block', marginTop: 20 }}>
                                    Trở thành Đối Tác →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════
                6. FINAL CTA — Compact with visual
             ══════════════════════════════════════════════════════════ */}
            <section style={{ background: '#0a0a0a', padding: '80px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                {/* Subtle texture */}
                <div style={{
                    position: 'absolute', inset: 0, opacity: 0.04,
                    backgroundImage: 'radial-gradient(circle at 20% 50%, #ffffff 0%, transparent 60%), radial-gradient(circle at 80% 50%, #ffffff 0%, transparent 60%)',
                }} />
                <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', display: 'block', marginBottom: 20 }}>
                        Không có lối tắt
                    </span>
                    <h2 style={{
                        fontFamily: "'Roboto Condensed', sans-serif",
                        fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 900,
                        color: '#ffffff', textTransform: 'uppercase',
                        letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 16,
                    }}>
                        Chỉ có<br />Gymerviet.
                    </h2>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 36 }}>
                        Hành trình lột xác bắt đầu từ quyết định đầu tiên. Hãy chọn đúng Coach, đúng phòng tập, đúng nền tảng.
                    </p>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link to="/register" style={{
                            background: '#ffffff', color: '#0a0a0a',
                            padding: '15px 36px', fontSize: '0.82rem',
                            fontWeight: 900, textTransform: 'uppercase',
                            letterSpacing: '0.1em', borderRadius: 4,
                            textDecoration: 'none',
                        }}>
                            Trở Thành Hội Viên
                        </Link>
                        <Link to="/coaches" style={{
                            background: 'transparent', color: 'rgba(255,255,255,0.6)',
                            padding: '15px 36px', fontSize: '0.82rem',
                            fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.1em', borderRadius: 4,
                            textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.15)',
                        }}>
                            Tìm Coach ngay
                        </Link>
                    </div>
                </div>
            </section>

            {/* Responsive overrides */}
            <style>{`
                @media (max-width: 900px) {
                    .home-hero-grid { grid-template-columns: 1fr !important; }
                    .home-hero-bento { display: none !important; }
                    .home-coaches-grid { grid-template-columns: 1fr 1fr !important; grid-template-rows: auto !important; }
                    .home-coaches-grid a { grid-column: auto !important; }
                    .home-steps-grid { grid-template-columns: 1fr !important; }
                    .home-roles-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 600px) {
                    .home-coaches-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}