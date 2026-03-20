interface Experience {
  id?: string;
  title: string;
  organization: string;
  experience_type: 'work' | 'education' | 'certification' | 'achievement';
  start_date: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
}

interface Certification { name: string; issuer: string; year: number; }
interface Award { name: string; organization: string; year: number; }

interface ProfileExperienceSectionProps {
  experiences: Experience[];
  certifications: Certification[];
  awards: Award[];
  yearsExperience: number | null;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
}

const TYPE_DOT: Record<string, { active: boolean }> = {
  work: { active: true },
  education: { active: false },
  certification: { active: false },
  achievement: { active: false },
};

export default function ProfileExperienceSection({
  experiences, certifications, awards, yearsExperience,
}: ProfileExperienceSectionProps) {
  if (!experiences.length && !certifications.length && !awards.length) return null;

  const allCerts = [
    ...certifications.map(c => ({ name: c.name, issuer: c.issuer, detail: String(c.year), icon: 'verified' })),
    ...awards.map(a => ({ name: a.name, issuer: a.organization, detail: String(a.year), icon: 'emoji_events' })),
  ];

  return (
    <section className="profile-experience-section">
      <div className="profile-experience-inner">
        {/* 2-col grid: Cột mốc sự nghiệp | Chứng chỉ */}
        <div className="profile-exp-grid">

          {/* Left: Cột mốc sự nghiệp */}
          {experiences.length > 0 && (
            <div className="profile-exp-col-left">
              <h2 className="profile-section-title">
                Cột mốc sự nghiệp
                {yearsExperience && (
                  <span className="profile-section-title-badge">{yearsExperience} năm</span>
                )}
              </h2>
              <div className="profile-exp-timeline">
                {experiences.map((exp, i) => {
                  const isActive = exp.is_current || TYPE_DOT[exp.experience_type]?.active;
                  return (
                    <div key={i} className="profile-exp-item">
                      <div className={`profile-exp-dot ${isActive ? 'profile-exp-dot--active' : ''}`}>
                        <div className="profile-exp-dot-inner" />
                      </div>
                      <div className="profile-exp-content">
                        <div className={`profile-exp-date ${isActive ? 'profile-exp-date--active' : ''}`}>
                          {formatDate(exp.start_date)}
                          {exp.is_current ? ' - Hiện tại' : exp.end_date ? ` — ${formatDate(exp.end_date)}` : ''}
                        </div>
                        <div className="profile-exp-title">{exp.title}</div>
                        <div className="profile-exp-org">{exp.organization}</div>
                        {exp.description && (
                          <p className="profile-exp-desc">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Right: Chứng chỉ và thành tích */}
          {allCerts.length > 0 && (
            <div className="profile-exp-col-right">
              <h3 className="profile-skills-title" style={{ marginBottom: 12 }}>Chứng chỉ & Thành tích</h3>
              <div className="profile-cert-list">
                {allCerts.map((c, i) => (
                  <div key={i} className="profile-cert-row">
                    <div className="profile-cert-row-icon">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="profile-cert-row-name">{c.name}</div>
                      <div className="profile-cert-row-issuer">{c.issuer}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
