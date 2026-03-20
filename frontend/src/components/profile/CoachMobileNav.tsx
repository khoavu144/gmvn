import { useEffect, useState } from 'react';

const NAV_ITEMS = [
  { id: 'about', label: 'Giới thiệu' },
  { id: 'services', label: 'Chuyên môn' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'experience', label: 'Kinh nghiệm' },
  { id: 'packages', label: 'Gói dịch vụ' },
  { id: 'testimonials', label: 'Đánh giá' },
  { id: 'contact', label: 'Liên hệ' },
];

interface CoachMobileNavProps {
  name: string;
}

export default function CoachMobileNav({ name }: CoachMobileNavProps) {
  const [activeSection, setActiveSection] = useState('about');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // FIX: aria-hidden when not visible so hidden buttons can't be focused by AT
    // FIX: inert via tabIndex=-1 on all children when !show handled by CSS display:none still
    // Best approach: only render the interactive content when visible
    <div
      className={`coach-mobile-nav${show ? ' coach-mobile-nav--visible' : ''}`}
      aria-hidden={!show}
    >
      <div className="coach-mobile-nav-inner">
        <span className="coach-mobile-nav-name" aria-label={`Hồ sơ: ${name}`}>{name}</span>
        {/* FIX: Only render nav items when visible so keyboard can't reach hidden buttons */}
        {show && (
          <nav aria-label="Điều hướng trang" className="coach-mobile-nav-tabs">
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`coach-mobile-nav-tab${activeSection === id ? ' active' : ''}`}
                // FIX: aria-current marks active section semantically, not just visually
                aria-current={activeSection === id ? 'true' : undefined}
              >
                {label}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
