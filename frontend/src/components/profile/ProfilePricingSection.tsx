interface Package {
  id?: string;
  name: string;
  duration_months: number;
  sessions_per_week: number | null;
  price: number;
  features: string[];
  is_popular?: boolean;
}

interface ProfilePricingSectionProps {
  packages: Package[];
  subscribing: string | null;
  onSubscribe: (programId: string) => void;
  /** Athlete / no checkout: CTA opens contact flow */
  contactOnly?: boolean;
  onContact?: () => void;
  emptyCopy?: string;
}

export default function ProfilePricingSection({
  packages,
  subscribing,
  onSubscribe,
  contactOnly = false,
  onContact,
  emptyCopy = 'Coach chưa công bố gói công khai trên hồ sơ. Hãy nhắn tin để được tư vấn mức giá và lịch phù hợp với bạn.',
}: ProfilePricingSectionProps) {
  return (
    <section className="profile-pricing-section">
      <div className="profile-pricing-inner">
        <h2 className="profile-section-title">Gói dịch vụ</h2>
        <p className="profile-section-subtitle">Chọn gói phù hợp với mục tiêu, lịch tập và ngân sách của bạn</p>

        {!packages.length ? (
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-5 text-sm leading-7 text-gray-600">
            {emptyCopy}
          </p>
        ) : (
        <div className="profile-pricing-grid">
          {packages.map((pkg, i) => (
            <div key={i} className={`profile-pricing-card${pkg.is_popular ? ' profile-pricing-card--popular' : ''}`}>
              {pkg.is_popular && (
                <div className="profile-pricing-popular-badge">Được chọn nhiều</div>
              )}
              <div className="profile-pricing-header">
                <h3 className="profile-pricing-name">{pkg.name}</h3>
                <div className="profile-pricing-price">
                  <span className="profile-pricing-amount">
                    {Number(pkg.price).toLocaleString('vi-VN')}₫
                  </span>
                  <span className="profile-pricing-period">/{pkg.duration_months === 1 ? 'tháng' : `${pkg.duration_months} tháng`}</span>
                </div>
                {pkg.sessions_per_week && (
                  <p className="profile-pricing-sessions">{pkg.sessions_per_week} buổi/tuần</p>
                )}
              </div>

              <ul className="profile-pricing-features">
                {pkg.features.map((f, fi) => (
                  <li key={fi} className="profile-pricing-feature">
                    <svg className="profile-pricing-check" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => {
                  if (contactOnly) onContact?.();
                  else if (pkg.id) onSubscribe(pkg.id);
                }}
                disabled={!contactOnly && !!subscribing}
                className={`profile-pricing-btn${pkg.is_popular ? ' profile-pricing-btn--popular' : ''}`}
                aria-label={contactOnly ? `Liên hệ về gói ${pkg.name}` : `Chọn gói ${pkg.name}`}
              >
                {contactOnly ? 'Liên hệ' : (subscribing === pkg.id ? 'Đang mở thanh toán...' : 'Chọn gói này')}
              </button>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
