import { useEffect, useState } from 'react';
import { COACH_PROFILE_NAV_ITEMS } from './profileSidebarNav';

const DEFAULT_MOBILE_NAV = COACH_PROFILE_NAV_ITEMS.map(({ id, label }) => ({ id, label }));

interface CtaProps { text: string; action: () => void; }

interface CoachMobileNavProps {
  name: string;
  onMessage: () => void;
  primaryCta?: CtaProps;
  /** When omitted, uses coach section tabs */
  navItems?: { id: string; label: string }[];
  profileVariant?: 'coach' | 'athlete';
}

export default function CoachMobileNav({
  name,
  onMessage,
  primaryCta,
  navItems = DEFAULT_MOBILE_NAV,
  profileVariant = 'coach',
}: CoachMobileNavProps) {
  const [activeSection, setActiveSection] = useState(navItems[0]?.id ?? 'about');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShow(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    navItems.forEach(({ id }) => {
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
  }, [navItems]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(`section-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const rootClass = [
    'coach-mobile-nav',
    show ? 'coach-mobile-nav--visible' : '',
    profileVariant === 'athlete' ? 'coach-mobile-nav--athlete' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={rootClass}
      aria-hidden={!show}
    >
      <div className="coach-mobile-nav-inner">
        <span className="coach-mobile-nav-name" aria-label={`Hồ sơ: ${name}`}>{name}</span>
        {show && (
          <>
            <nav aria-label="Điều hướng trang" className="coach-mobile-nav-tabs">
              {navItems.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className={`coach-mobile-nav-tab${activeSection === id ? ' active' : ''}`}
                  aria-current={activeSection === id ? 'location' : undefined}
                >
                  {label}
                </button>
              ))}
            </nav>
            {primaryCta ? (
              <button type="button" onClick={primaryCta.action} className="coach-mobile-nav-message-btn !bg-gray-900 !text-white hover:!bg-gray-800">
                {primaryCta.text}
              </button>
            ) : (
              <button type="button" onClick={onMessage} className="coach-mobile-nav-message-btn">
                💬 Nhắn tin để tư vấn
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
