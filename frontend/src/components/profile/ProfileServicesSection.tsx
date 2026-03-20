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
          {/* FIX: "Dynamic"/"Static" → Vietnamese labels */}
          <div className="profile-skills-chips">
            <span className="profile-skills-chip">Thực chiến</span>
            <span className="profile-skills-chip">Nền tảng</span>
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
              <div className="profile-skill-bar" role="progressbar" aria-valuenow={s.level} aria-valuemin={0} aria-valuemax={100} aria-label={`${s.name}: ${s.level}%`}>
                {/* FIX: use CSS custom property + scaleX for composited animation (no width layout recalc) */}
                <div
                  className="profile-skill-bar-fill"
                  style={{ '--skill-level': s.level / 100 } as React.CSSProperties}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
