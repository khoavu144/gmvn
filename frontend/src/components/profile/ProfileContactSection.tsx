interface CtaProps { text: string; action: () => void; }

interface ProfileContactSectionProps {
  coachName: string;
  location: string | null;
  socialLinks: Record<string, string>;
  onMessage: () => void;
  primaryCta?: CtaProps;
}

const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram', tiktok: 'TikTok', youtube: 'YouTube',
  facebook: 'Facebook', website: 'Trang web',
};

export default function ProfileContactSection({ coachName, location, socialLinks, onMessage, primaryCta }: ProfileContactSectionProps) {
  const firstName = coachName.split(' ').slice(-1)[0];
  const validSocialLinks = Object.entries(socialLinks).filter(([, url]) => Boolean(url));
  const hasSocial = validSocialLinks.length > 0;

  return (
    <section className="profile-contact-section">
      <div className="profile-contact-inner">
        {/* 3-col compact layout */}
        <div className="profile-contact-grid">

          {/* Col 1: Heading + CTA */}
          <div className="profile-contact-col-main">
            <h2 className="profile-contact-heading">
              Sẵn sàng bắt đầu{' '}
              <span className="profile-contact-heading-accent">
                hành trình cùng {firstName}?
              </span>
            </h2>
            <p className="profile-contact-subtitle">
              Nhắn tin để được tư vấn miễn phí và nhận lộ trình phù hợp với mục tiêu của bạn.
            </p>
            <button
              onClick={primaryCta?.action || onMessage}
              className="profile-contact-cta-btn"
              aria-label={primaryCta?.text || `Nhắn tin với ${coachName} để được tư vấn`}
            >
              {primaryCta ? primaryCta.text : '💬 Nhắn tin để tư vấn'}
            </button>
          </div>

          {/* Col 2: Location */}
          {location && (
            <div className="profile-contact-col-info">
              <div className="profile-contact-info-group">
                <p className="profile-contact-info-label">Khu vực</p>
                <p className="profile-contact-info-value profile-contact-location">
                  <span aria-hidden="true">📍</span>
                  <span>{location}</span>
                </p>
              </div>
              <div className="profile-contact-info-group">
                <p className="profile-contact-info-label">Phản hồi</p>
                <p className="profile-contact-info-value">Thường phản hồi trong 2 giờ</p>
              </div>
            </div>
          )}

          {/* Col 3: Social */}
          {hasSocial && (
            <div className="profile-contact-col-info">
              <p className="profile-contact-info-label">Mạng xã hội</p>
              <div className="profile-contact-social-list">
                {validSocialLinks.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="profile-contact-social-link"
                  >
                    {SOCIAL_LABELS[key] || key}
                    <svg viewBox="0 0 12 12" fill="currentColor" width="10" height="10" className="profile-contact-social-link-icon" aria-hidden="true">
                      <path d="M3.5 1h-2a.5.5 0 00-.5.5v7a.5.5 0 00.5.5h7a.5.5 0 00.5-.5v-2a.5.5 0 00-1 0V8H2V2h1.5a.5.5 0 000-1zM6 1a.5.5 0 000 1h2.293L4.146 6.146a.5.5 0 00.708.708L9 2.707V5a.5.5 0 001 0V1.5A.5.5 0 009.5 1H6z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
