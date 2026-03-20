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
}

export default function ProfilePricingSection({ packages, subscribing, onSubscribe }: ProfilePricingSectionProps) {
  if (!packages.length) return null;

  return (
    <section className="profile-pricing-section">
      <div className="profile-pricing-inner">
        <h2 className="profile-section-title">Gói dịch vụ</h2>
        <p className="profile-section-subtitle">Chọn gói phù hợp với mục tiêu và ngân sách của bạn</p>

        <div className="profile-pricing-grid">
          {packages.map((pkg, i) => (
            <div key={i} className={`profile-pricing-card${pkg.is_popular ? ' profile-pricing-card--popular' : ''}`}>
              {pkg.is_popular && (
                <div className="profile-pricing-popular-badge">⭐ Phổ biến nhất</div>
              )}
              <div className="profile-pricing-header">
                <h3 className="profile-pricing-name">{pkg.name}</h3>
                <div className="profile-pricing-price">
                  <span className="profile-pricing-amount">
                    {pkg.price.toLocaleString('vi-VN')}₫
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
                onClick={() => pkg.id && onSubscribe(pkg.id)}
                disabled={!!subscribing}
                className={`profile-pricing-btn${pkg.is_popular ? ' profile-pricing-btn--popular' : ''}`}
              >
                {subscribing === pkg.id ? 'Đang xử lý...' : 'Đăng ký ngay'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
