interface Skill { name: string; level: number; category: string; }

interface ProfileServicesSectionProps {
  skills: Skill[];
}

export default function ProfileServicesSection({ skills }: ProfileServicesSectionProps) {
  if (!skills.length) return null;

  return (
    <section className="profile-services-section">
      <div className="profile-services-inner">
        <div className="profile-skills-header-row">
          <div>
            <h2 className="profile-section-title" style={{ marginBottom: 4 }}>Kỹ năng chuyên sâu</h2>
            <p className="profile-section-subtitle">Mức độ thành thạo từng kỹ năng chuyên môn</p>
          </div>
          <div className="profile-skills-chips">
            <span className="profile-skills-chip">Dynamic</span>
            <span className="profile-skills-chip">Static</span>
          </div>
        </div>

        {/* 2-col skill bars grid */}
        <div className="profile-skills-2col">
          {skills.map((s, i) => (
            <div key={i} className="profile-skill-item">
              <div className="profile-skill-header">
                <span className="profile-skill-name">{s.name}</span>
                <span className="profile-skill-level">{s.level}%</span>
              </div>
              <div className="profile-skill-bar">
                <div className="profile-skill-bar-fill" style={{ width: `${s.level}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
