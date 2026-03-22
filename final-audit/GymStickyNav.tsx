// src/components/gym-detail/GymStickyNav.tsx
// Sticky horizontal section nav — Tailwind thuần · No marketplace-nav-* class

interface NavSection {
  id: string;
  label: string;
}

interface GymStickyNavProps {
  sections: NavSection[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function GymStickyNav({ sections, activeSection, onNavigate }: GymStickyNavProps) {
  return (
    <nav
      className="sticky top-14 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200"
      aria-label="Điều hướng nội dung"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0 overflow-x-auto scrollbar-none -mb-px">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => onNavigate(section.id)}
              className={[
                'shrink-0 px-4 py-3 text-[14px] font-semibold border-b-2 transition-colors duration-150 whitespace-nowrap',
                activeSection === section.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black hover:border-gray-300',
              ].join(' ')}
              aria-current={activeSection === section.id ? 'true' : undefined}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
