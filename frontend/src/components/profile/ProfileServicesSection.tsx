interface Skill { name: string; level: number; category: string; }
interface Highlight { id?: string; title: string; value: string; icon_key?: string; }

interface ProfileServicesSectionProps {
  specialties: string[] | null;
  skills: Skill[];
  highlights: Highlight[];
}

const ICON_MAP: Record<string, string> = {
  users: '👥', calendar: '📅', trophy: '🏆', award: '🏅',
  fire: '🔥', star: '⭐', zap: '⚡', heart: '❤️',
  target: '🎯', activity: '📊', dumbbell: '💪', default: '✅',
};

export default function ProfileServicesSection({ specialties, skills, highlights }: ProfileServicesSectionProps) {
  if (!skills.length && !highlights.length && !specialties?.length) return null;

  return (
    <section className="profile-services-section">
      <div className="profile-services-inner">
        <h2 className="profile-section-title">Chuyên môn & Kỹ năng</h2>

        {/* Stats highlights */}
        {highlights.length > 0 && (
          <div className="profile-stats-grid">
            {highlights.map((h, i) => (
              <div key={i} className="profile-stat-card">
                <span className="profile-stat-icon">
                  {ICON_MAP[h.icon_key || ''] || ICON_MAP.default}
                </span>
                <span className="profile-stat-value">{h.value}</span>
                <span className="profile-stat-label">{h.title}</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills with progress bars */}
        {skills.length > 0 && (
          <div className="profile-skills-list">
            <h3 className="profile-skills-title">Kỹ năng chuyên sâu</h3>
            {skills.map((s, i) => (
              <div key={i} className="profile-skill-item">
                <div className="profile-skill-header">
                  <span className="profile-skill-name">{s.name}</span>
                  <span className="profile-skill-level">{s.level}%</span>
                </div>
                <div className="profile-skill-bar">
                  <div
                    className="profile-skill-bar-fill"
                    style={{ width: `${s.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Specialties tag cloud */}
        {specialties && specialties.length > 0 && (
          <div className="profile-specialties-cloud">
            {specialties.map((s, i) => (
              <span key={i} className="profile-specialty-pill">{s}</span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
