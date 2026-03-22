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
    const firstSectionId = navItems[0]?.id;
    if (!firstSectionId) return;

    const firstSection = document.getElementById(`section-${firstSectionId}`);
    if (!firstSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShow(!entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '-80px 0px 0px 0px',
        threshold: [0.2, 0.5, 0.8],
      }
    );

    observer.observe(firstSection);
    return () => observer.disconnect();
  }, [navItems]);

  useEffect(() => {
    const activeCandidates = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).dataset.navId;
          if (!id) return;

          if (entry.isIntersecting) {
            activeCandidates.set(id, entry.boundingClientRect.top);
          } else {
            activeCandidates.delete(id);
          }
        });

        if (activeCandidates.size === 0) return;
        const nearest = [...activeCandidates.entries()].sort(
          (a, b) => Math.abs(a[1]) - Math.abs(b[1])
        )[0]?.[0];

        if (nearest) {
          setActiveSection(nearest);
        }
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.35, 0.6, 0.85] }
    );

    navItems.forEach(({ id }) => {
      const el = document.getElementById(`section-${id}`);
      if (!el) return;
      el.dataset.navId = id;
      observer.observe(el);
    });

    return () => observer.disconnect();
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
