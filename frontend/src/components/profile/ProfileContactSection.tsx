interface ProfileContactSectionProps {
  coachName: string;
  location: string | null;
  socialLinks: Record<string, string>;
  onMessage: () => void;
}

export default function ProfileContactSection({ coachName, location, socialLinks, onMessage }: ProfileContactSectionProps) {
  const firstName = coachName.split(' ').slice(-1)[0];

  return (
    <section className="profile-contact-section">
      <div className="profile-contact-inner">
        {/* Gradient heading */}
        <div className="profile-contact-heading-wrap">
          <h2 className="profile-contact-heading">
            Sẵn sàng bắt đầu<br />
            <span className="profile-contact-heading-accent">hành trình cùng {firstName}?</span>
          </h2>
          <p className="profile-contact-subtitle">
            Nhắn tin ngay hôm nay để nhận tư vấn miễn phí và lộ trình phù hợp với bạn.
          </p>
        </div>

        {/* Contact cards */}
        <div className="profile-contact-cards">
          <button onClick={onMessage} className="profile-contact-card profile-contact-card--primary">
            <span className="profile-contact-card-icon">💬</span>
            <div>
              <p className="profile-contact-card-title">Nhắn tin trực tiếp</p>
              <p className="profile-contact-card-desc">Phản hồi trong vòng 2 giờ</p>
            </div>
            <svg className="profile-contact-card-arrow" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {location && (
            <div className="profile-contact-card">
              <span className="profile-contact-card-icon">📍</span>
              <div>
                <p className="profile-contact-card-title">Khu vực hoạt động</p>
                <p className="profile-contact-card-desc">{location}</p>
              </div>
            </div>
          )}

          {Object.keys(socialLinks).length > 0 && (
            <div className="profile-contact-card">
              <span className="profile-contact-card-icon">🌐</span>
              <div>
                <p className="profile-contact-card-title">Mạng xã hội</p>
                <div className="profile-contact-social">
                  {socialLinks.instagram && (
                    <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="profile-contact-social-link">Instagram</a>
                  )}
                  {socialLinks.tiktok && (
                    <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="profile-contact-social-link">TikTok</a>
                  )}
                  {socialLinks.youtube && (
                    <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="profile-contact-social-link">YouTube</a>
                  )}
                  {socialLinks.facebook && (
                    <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="profile-contact-social-link">Facebook</a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
