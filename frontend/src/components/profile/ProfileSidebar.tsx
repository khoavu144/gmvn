import { useEffect, useState } from 'react';
import { BadgeCheck, MapPin, MessageCircle } from 'lucide-react';
import { COACH_PROFILE_NAV_ITEMS } from './profileSidebarNav';
import type { ProfileNavItem } from './profileSidebarNav';

interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  facebook?: string;
  website?: string;
}

interface CtaProps {
  text: string;
  action: () => void;
}

interface ProfileSidebarProps {
  name: string;
  avatarUrl: string | null;
  headline: string | null;
  isVerified: boolean;
  isAcceptingClients: boolean;
  socialLinks: SocialLinks;
  location: string | null;
  onContactClick?: () => void;
  primaryCta?: CtaProps;
  secondaryCta?: CtaProps;
  /** When omitted, uses coach default nav */
  navItems?: ProfileNavItem[];
  /** Athlete: teal accent + slate sidebar (see coachProfile.css) */
  profileVariant?: 'coach' | 'athlete';
  /** Default true; set false for athlete single primary CTA */
  showSecondaryCta?: boolean;
}

export default function ProfileSidebar({
  name, avatarUrl, headline, isVerified, isAcceptingClients,
  socialLinks, location, onContactClick, primaryCta, secondaryCta,
  navItems = COACH_PROFILE_NAV_ITEMS,
  profileVariant = 'coach',
  showSecondaryCta = true,
}: ProfileSidebarProps) {
  const [activeSection, setActiveSection] = useState(navItems[0]?.id ?? 'about');
  const safeSocialLinks: SocialLinks = (socialLinks && typeof socialLinks === 'object') ? socialLinks : {};

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

  const initials = name.split(' ').slice(-2).map(w => w[0]).join('').toUpperCase();

  const asideClass = profileVariant === 'athlete'
    ? 'profile-sidebar profile-sidebar--athlete'
    : 'profile-sidebar';

  return (
    <aside className={asideClass}>
      <div className="sidebar-avatar-wrap">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="sidebar-avatar" />
        ) : (
          <div className="sidebar-avatar sidebar-avatar-fallback" aria-hidden="true">{initials}</div>
        )}
        {isAcceptingClients && (
          <span className="sidebar-online-dot" title="Đang nhận học viên" aria-hidden="true" />
        )}
      </div>

      <div className="sidebar-identity">
        <h2 className="sidebar-name">
          {name}
          {isVerified && (
            <span className="inline-flex items-center" title="Đã xác minh">
              <BadgeCheck className="sidebar-verified" strokeWidth={2} aria-hidden="true" />
              <span className="sr-only">Đã xác minh</span>
            </span>
          )}
        </h2>
        {headline && <p className="sidebar-headline">{headline}</p>}
        {location && (
          <p className="sidebar-location">
            <MapPin className="sidebar-location-icon" strokeWidth={2} aria-hidden="true" />
            {location}
          </p>
        )}
        {isAcceptingClients && (
          <span className="sidebar-accepting-badge">● Đang nhận học viên</span>
        )}
      </div>

      <nav className="sidebar-nav" aria-label="Điều hướng trang">
        {navItems.map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => scrollTo(id)}
            className={`sidebar-nav-item${activeSection === id ? ' active' : ''}`}
            aria-current={activeSection === id ? 'location' : undefined}
          >
            <span className="sidebar-nav-item-icon" aria-hidden="true">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {Object.keys(safeSocialLinks).length > 0 && (
        <div className="sidebar-social">
          <p className="sidebar-social-label">Theo dõi</p>
          <div className="sidebar-social-icons">
            {safeSocialLinks.instagram && (
              <a href={safeSocialLinks.instagram} target="_blank" rel="noopener noreferrer" className="sidebar-social-link" aria-label="Theo dõi trên Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
            )}
            {safeSocialLinks.tiktok && (
              <a href={safeSocialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="sidebar-social-link" aria-label="Theo dõi trên TikTok">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.77a4.85 4.85 0 01-1.01-.08z" /></svg>
              </a>
            )}
            {safeSocialLinks.youtube && (
              <a href={safeSocialLinks.youtube} target="_blank" rel="noopener noreferrer" className="sidebar-social-link" aria-label="Xem kênh YouTube">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            )}
            {safeSocialLinks.facebook && (
              <a href={safeSocialLinks.facebook} target="_blank" rel="noopener noreferrer" className="sidebar-social-link" aria-label="Theo dõi trên Facebook">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
            )}
            {safeSocialLinks.website && (
              <a href={safeSocialLinks.website} target="_blank" rel="noopener noreferrer" className="sidebar-social-link" aria-label="Truy cập trang web cá nhân">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg>
              </a>
            )}
          </div>
        </div>
      )}

      {primaryCta && (
        <button
          type="button"
          onClick={primaryCta.action}
          className="sidebar-cta-btn sidebar-cta-btn--flat-primary"
          aria-label={primaryCta.text}
        >
          {primaryCta.text}
        </button>
      )}
      {showSecondaryCta && (
        <button
          type="button"
          onClick={secondaryCta ? secondaryCta.action : onContactClick}
          className={`sidebar-cta-btn${primaryCta ? ' sidebar-cta-btn--outline-secondary' : ''}`}
          aria-label={secondaryCta ? secondaryCta.text : `Nhắn tin với ${name} để được tư vấn`}
        >
          <span className="sidebar-cta-btn-inner">
            <MessageCircle className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden="true" />
            {secondaryCta ? secondaryCta.text : 'Nhắn tin để tư vấn'}
          </span>
        </button>
      )}
    </aside>
  );
}
