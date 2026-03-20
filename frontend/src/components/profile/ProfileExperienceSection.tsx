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

const TYPE_CONFIG = {
  work: { label: 'Làm việc', color: '#4338ca', bg: '#eef2ff', icon: '💼' },
  education: { label: 'Học vấn', color: '#0891b2', bg: '#ecfeff', icon: '🎓' },
  certification: { label: 'Chứng chỉ', color: '#059669', bg: '#ecfdf5', icon: '📜' },
  achievement: { label: 'Thành tích', color: '#d97706', bg: '#fffbeb', icon: '🏆' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
}

export default function ProfileExperienceSection({
  experiences, certifications, awards, yearsExperience,
}: ProfileExperienceSectionProps) {
  if (!experiences.length && !certifications.length && !awards.length) return null;

  return (
    <section className="profile-experience-section">
      <div className="profile-experience-inner">
        <h2 className="profile-section-title">
          Kinh nghiệm
          {yearsExperience && (
            <span className="profile-section-title-badge">{yearsExperience} năm</span>
          )}
        </h2>

        {/* Timeline */}
        {experiences.length > 0 && (
          <div className="profile-timeline">
            {experiences.map((exp, i) => {
              const cfg = TYPE_CONFIG[exp.experience_type] || TYPE_CONFIG.work;
              return (
                <div key={i} className="profile-timeline-item">
                  <div className="profile-timeline-dot" style={{ background: cfg.color }}>
                    <span className="profile-timeline-dot-icon">{cfg.icon}</span>
                  </div>
                  <div className="profile-timeline-content">
                    <div className="profile-timeline-header">
                      <h3 className="profile-timeline-title">{exp.title}</h3>
                      <span className="profile-timeline-type-badge" style={{ color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="profile-timeline-org">{exp.organization}</p>
                    <p className="profile-timeline-date">
                      {formatDate(exp.start_date)}
                      {exp.is_current ? ' — Hiện tại' : exp.end_date ? ` — ${formatDate(exp.end_date)}` : ''}
                    </p>
                    {exp.description && (
                      <p className="profile-timeline-desc">{exp.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="profile-certs">
            <h3 className="profile-certs-title">Chứng chỉ quốc tế</h3>
            <div className="profile-certs-grid">
              {certifications.map((c, i) => (
                <div key={i} className="profile-cert-card">
                  <span className="profile-cert-icon">📜</span>
                  <div>
                    <p className="profile-cert-name">{c.name}</p>
                    <p className="profile-cert-issuer">{c.issuer} · {c.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Awards */}
        {awards.length > 0 && (
          <div className="profile-awards">
            <h3 className="profile-certs-title">Giải thưởng & Thành tích</h3>
            <div className="profile-certs-grid">
              {awards.map((a, i) => (
                <div key={i} className="profile-cert-card profile-cert-card--award">
                  <span className="profile-cert-icon">🏆</span>
                  <div>
                    <p className="profile-cert-name">{a.name}</p>
                    <p className="profile-cert-issuer">{a.organization} · {a.year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
