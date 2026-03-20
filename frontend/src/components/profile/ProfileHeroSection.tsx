import { useMemo } from 'react';

interface Metric { label: string; value: string; }
interface Highlight { id: string; title: string; value: string; icon_key?: string; }

interface ProfileHeroSectionProps {
  name: string;
  avatarUrl: string | null;
  specialties: string[] | null;
  bio: string | null;
  bioLong: string | null;
  isVerified: boolean;
  tagline: string | null | undefined;
  metrics: Metric[] | undefined;
  highlights: Highlight[];
  basePriceMonthly: number | null;
  onMessage: () => void;
}

export default function ProfileHeroSection({
  name, avatarUrl, specialties, bio, bioLong, isVerified,
  tagline, metrics, highlights, basePriceMonthly, onMessage,
}: ProfileHeroSectionProps) {
  const initials = name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();

  const displayMetrics = useMemo(() => {
    if (metrics && metrics.length > 0) return metrics;
    const h = highlights.slice(0, 3);
    return h.map(hl => ({ label: hl.title, value: hl.value }));
  }, [metrics, highlights]);

  const displayBio = bioLong || bio || '';

  // Top achievement = first highlight shown as the featured card
  const topAchievement = useMemo(() => {
    if (highlights && highlights.length > 0) return highlights[0];
    if (displayMetrics.length > 0) return { title: displayMetrics[0].label, value: displayMetrics[0].value, icon_key: 'star' };
    return null;
  }, [highlights, displayMetrics]);

  return (
    <section className="profile-hero-section">
      {/* Cover gradient band */}
      <div className="profile-hero-cover" />

      <div className="profile-hero-inner">
        {/* Mobile avatar + identity (hidden on desktop — sidebar handles it) */}
        <div className="profile-hero-mobile-id">
          <div className="profile-hero-avatar-wrap">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} className="profile-hero-avatar" />
            ) : (
              <div className="profile-hero-avatar profile-hero-avatar-fallback">{initials}</div>
            )}
          </div>
          <div>
            <h1 className="profile-hero-name">
              {name}
              {isVerified && (
                <svg className="profile-hero-verified" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </h1>
            {specialties && specialties.length > 0 && (
              <div className="profile-hero-tags">
                {specialties.slice(0, 3).map((s, i) => (
                  <span key={i} className="profile-hero-tag">{s}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tagline */}
        {tagline && <p className="profile-hero-tagline">"{tagline}"</p>}

        {/* Metrics row */}
        {displayMetrics.length > 0 && (
          <div className="profile-hero-metrics">
            {displayMetrics.map((m, i) => (
              <div key={i} className="profile-hero-metric">
                <span className="profile-hero-metric-value">{m.value}</span>
                <span className="profile-hero-metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Bio + Achievement card — 2-col grid on desktop */}
        <div className="profile-hero-body-grid">
          <div className="profile-hero-body-left">
            {displayBio && (
              <div className="profile-hero-bio">
                <h2 className="profile-section-title">Giới thiệu</h2>
                <p className="profile-hero-bio-text">{displayBio}</p>
              </div>
            )}
            {specialties && specialties.length > 0 && (
              <div className="profile-hero-specialties">
                <h3 className="profile-hero-specialties-title">Lĩnh vực chuyên môn</h3>
                <div className="profile-hero-tags profile-hero-tags--large">
                  {specialties.map((s, i) => (
                    <span key={i} className="profile-hero-tag profile-hero-tag--large">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Achievement card — desktop right column */}
          {topAchievement && (
            <div className="profile-hero-achievement-card">
              <span className="profile-achievement-badge">BEST RECORD</span>
              <div className="profile-achievement-value">{topAchievement.value}</div>
              <div className="profile-achievement-title">{topAchievement.title}</div>
              {highlights.length > 1 && (
                <div className="profile-achievement-sub">
                  {highlights.slice(1, 3).map((h, i) => (
                    <div key={i} className="profile-achievement-sub-item">
                      <span className="profile-achievement-sub-value">{h.value}</span>
                      <span className="profile-achievement-sub-label">{h.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Price + CTA row */}
        <div className="profile-hero-cta-row">
          {basePriceMonthly && (
            <div className="profile-hero-price">
              <span className="profile-hero-price-label">Từ</span>
              <span className="profile-hero-price-value">
                {basePriceMonthly.toLocaleString('vi-VN')}₫
              </span>
              <span className="profile-hero-price-period">/tháng</span>
            </div>
          )}
          <button onClick={onMessage} className="profile-hero-cta-btn">
            Liên hệ tư vấn
          </button>
          <button onClick={onMessage} className="profile-hero-cta-btn-ghost">
            Xem lịch tập
          </button>
        </div>
      </div>
    </section>
  );
}
