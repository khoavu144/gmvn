import { useMemo } from 'react';

interface Metric { label: string; value: string; }
interface Highlight { id: string; title: string; value: string; icon_key?: string; }

interface ProfileHeroSectionProps {
  name: string;
  headline: string | null;
  location: string | null;
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
  name, headline, location, avatarUrl, specialties,
  bio, bioLong, isVerified, tagline, metrics, highlights,
  basePriceMonthly, onMessage,
}: ProfileHeroSectionProps) {
  const firstName = name.split(' ').slice(-1)[0];

  const displayMetrics = useMemo(() => {
    if (metrics && metrics.length >= 3) return metrics.slice(0, 3);
    const base = metrics ? [...metrics] : [];
    const fromHighlights = highlights.slice(0, 3 - base.length).map(h => ({ label: h.title, value: h.value }));
    return [...base, ...fromHighlights].slice(0, 3);
  }, [metrics, highlights]);

  const displayBio = bioLong || bio || '';
  const topAchievement = highlights[0] || null;

  return (
    <section className="profile-hero-bento">
      {/* ── Row 1: Identity + Stats ─────────────────────────── */}
      <div className="profile-bento-row1">

        {/* Identity card — 2/3 */}
        <div className="profile-bento-identity">
          {/* Faded avatar background */}
          {avatarUrl && (
            <div className="profile-bento-avatar-bg">
              <img src={avatarUrl} alt="" aria-hidden="true" />
            </div>
          )}
          <div className="profile-bento-identity-inner">
            {/* Badge */}
            <span className="profile-bento-badge">
              {specialties?.[0] || 'Certified Coach'}
            </span>
            {/* Name */}
            <h1 className="profile-bento-name">
              {name}
              {isVerified && (
                <svg viewBox="0 0 20 20" fill="#3b82f6" width="22" height="22" style={{ display:'inline', marginLeft: 6, flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </h1>
            {/* Headline */}
            <p className="profile-bento-headline">{headline || specialties?.join(' | ') || ''}</p>
            {/* Location */}
            {location && (
              <div className="profile-bento-location">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                </svg>
                {location}
              </div>
            )}
          </div>
        </div>

        {/* Stats card — 1/3 */}
        <div className="profile-bento-stats">
          {/* Avatar canvas background */}
          {avatarUrl && (
            <div className="profile-bento-stats-bg">
              <img src={avatarUrl} alt="" aria-hidden="true" />
            </div>
          )}
          <div className="profile-bento-stats-list">
            {displayMetrics.map((m, i) => (
              <div key={i} className="profile-bento-stat">
                <div className="profile-bento-stat-value">{m.value}</div>
                <div className="profile-bento-stat-label">{m.label}</div>
              </div>
            ))}
          </div>
          <div className="profile-bento-stats-footer">
            <button onClick={onMessage} className="profile-bento-portfolio-btn">
              Xem lịch tập
              <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Row 2: Bio + PR card ─────────────────────────────── */}
      <div className="profile-bento-row2">

        {/* Bio — 3/5 */}
        <div className="profile-bento-bio">
          <h2 className="profile-bento-bio-title">Professional Dossier</h2>
          <p className="profile-bento-bio-text">{displayBio}</p>
          {specialties && specialties.length > 0 && (
            <div className="profile-bento-tags">
              {specialties.map((s, i) => (
                <span key={i} className="profile-bento-tag">{s}</span>
              ))}
            </div>
          )}
          {/* CTA row */}
          <div className="profile-bento-cta-row">
            <button onClick={onMessage} className="profile-bento-cta-primary">
              💬 Nhắn tin với {firstName}
            </button>
            {basePriceMonthly && (
              <span className="profile-bento-price">
                Từ <strong>{basePriceMonthly.toLocaleString('vi-VN')}₫</strong>/tháng
              </span>
            )}
          </div>
        </div>

        {/* PR Achievement card — 2/5 */}
        {topAchievement && (
          <div className="profile-bento-pr">
            <div className="profile-bento-pr-inner">
              <div className="profile-bento-pr-badge">Best Personal Record</div>
              <div className="profile-bento-pr-value">{topAchievement.value}</div>
              <div className="profile-bento-pr-label">{topAchievement.title}</div>
              {tagline && <div className="profile-bento-pr-tagline">"{tagline}"</div>}
              {/* Extra highlights as sub-stats */}
              {highlights.length > 1 && (
                <div className="profile-bento-pr-subs">
                  {highlights.slice(1, 3).map((h, i) => (
                    <div key={i} className="profile-bento-pr-sub">
                      <span className="profile-bento-pr-sub-val">{h.value}</span>
                      <span className="profile-bento-pr-sub-label">{h.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <span className="profile-bento-pr-watermark">★</span>
          </div>
        )}
      </div>
    </section>
  );
}
