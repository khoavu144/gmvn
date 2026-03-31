import { useNavigate } from 'react-router-dom';
import { getOptimizedUrl, getSrcSet } from '../../utils/image';


interface HeroBadge { label: string; value?: string }
interface HeroMetric { label: string; value: string }

interface Props {
    name: string;
    avatarUrl: string | null;
    specialties: string[] | null;
    bio: string | null;
    isVerified: boolean;
    tagline?: string | null;
    badges?: HeroBadge[];
    metrics?: HeroMetric[];
    basePriceMonthly: number | null;
    onMessage: () => void;
}

export default function CoachHeroFlagship({
    name,
    avatarUrl,
    specialties,
    bio,
    isVerified,
    tagline,
    metrics,
    basePriceMonthly,
    onMessage,
}: Props) {
    const navigate = useNavigate();
    // Derive a compelling headline from tagline or specialties
    const headline = tagline || (specialties?.length
        ? `${specialties.slice(0, 2).join(' · ')}`
        : 'Huấn luyện viên chuyên nghiệp');

    const shortBio = bio
        ? bio.length > 160 ? bio.slice(0, 157) + '…' : bio
        : null;

    return (
        <section className="relative overflow-hidden bg-black text-white">
            {/* Background texture */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />

            <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
                {/* Top nav bar */}
                <div className="flex items-center justify-between h-14 border-b border-white/10">
                    <button
                        onClick={() => navigate('/coaches')}
                        className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                        ← Huấn luyện viên
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                        Huấn luyện viên GYMERVIET
                    </span>
                </div>

                {/* Hero content */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-16 py-10 md:py-16 lg:py-20">
                    {/* Left: Copy */}
                    <div className="flex flex-col justify-center min-w-0 order-2 lg:order-1">
                        {/* Eyebrow */}
                        <div className="flex items-center gap-3 mb-4 sm:mb-6">
                            {isVerified && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] bg-white text-black px-2.5 py-1 rounded-sm">
                                    ✓ Đã xác minh
                                </span>
                            )}
                            {specialties && specialties.length > 0 && (
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/50">
                                    {specialties.slice(0, 2).join(' · ')}
                                </span>
                            )}
                        </div>

                        {/* Name */}
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] mb-4">
                            {name}
                        </h1>

                        {/* Headline / Tagline */}
                        <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-lg mb-6 sm:mb-8">
                            {headline}
                        </p>

                        {/* Short bio */}
                        {shortBio && (
                            <p className="text-sm text-white/40 leading-relaxed max-w-md mb-8 hidden sm:block">
                                {shortBio}
                            </p>
                        )}

                        {/* CTA pair */}
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                            <button
                                onClick={onMessage}
                                className="h-12 px-7 bg-white text-black font-bold text-sm tracking-wide rounded-sm hover:bg-[color:var(--mk-paper)] transition-all active:scale-[0.98]"
                            >
                                Nhắn tin ngay
                            </button>
                            <a
                                href="#programs"
                                className="h-12 px-7 border border-white/25 text-white font-bold text-sm tracking-wide rounded-sm hover:bg-white/5 hover:border-white/40 transition-all flex items-center"
                            >
                                Xem gói tập
                            </a>
                        </div>

                        {/* Quick proof strip */}
                        {metrics && metrics.length > 0 && (
                            <div className="flex flex-wrap gap-6 mt-8 sm:mt-10 pt-6 border-t border-white/10">
                                {metrics.slice(0, 4).map((m, i) => (
                                    <div key={i} className="min-w-0">
                                        <div className="text-2xl font-extrabold text-white">{m.value}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mt-1">{m.label}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Portrait */}
                    <div className="flex justify-center lg:justify-end order-1 lg:order-2">
                        <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-[320px] lg:h-[400px]">
                            {/* Decorative frame */}
                            <div className="absolute -inset-3 rounded-lg border border-white/10" />
                            <div className="absolute -inset-1 rounded-lg bg-gradient-to-br from-white/10 via-transparent to-white/5" />

                            {avatarUrl ? (
                                <img
                                    src={getOptimizedUrl(avatarUrl, 640)}
                                    srcSet={getSrcSet(avatarUrl)}
                                    sizes="(max-width: 640px) 192px, (max-width: 1024px) 256px, 320px"
                                    alt={name}
                                    className="relative w-full h-full object-cover rounded-lg"
                                    fetchPriority="high"
                                    decoding="async"
                                    width={320}
                                    height={400}
                                />
                            ) : (
                                <div className="relative w-full h-full rounded-lg bg-white/5 flex items-center justify-center">
                                    <span className="text-6xl font-extrabold text-white/20">{name.charAt(0)}</span>
                                </div>
                            )}

                            {/* Price anchor */}
                            {basePriceMonthly && (
                                <div className="absolute -bottom-4 -left-4 bg-white text-black px-4 py-2 rounded-sm shadow-lg">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-[color:var(--mk-muted)]">Từ</div>
                                    <div className="text-lg font-extrabold">
                                        {Number(basePriceMonthly).toLocaleString('vi-VN')}₫
                                        <span className="text-xs font-normal text-[color:var(--mk-muted)]">/tháng</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
