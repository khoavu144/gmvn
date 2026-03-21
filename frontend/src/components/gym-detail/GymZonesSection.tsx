import React, { useEffect } from 'react';
import type { GymZone } from '../../types';

function useInView(threshold = 0.08): [React.RefObject<HTMLDivElement>, boolean] {
    const ref = React.useRef<HTMLDivElement>(null!);
    const [inView, setInView] = React.useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, inView];
}

function FadeIn({ children }: { children: React.ReactNode }) {
    const [ref, inView] = useInView();
    return (
        <div ref={ref} className={`transition-all duration-700 ${inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}>
            {children}
        </div>
    );
}

function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
    return (
        <div className="mb-6 space-y-2">
            <div className="marketplace-section-kicker">{kicker}</div>
            <h2 className="marketplace-section-title">{title}</h2>
            {description && <p className="marketplace-lead max-w-none text-[0.98rem]">{description}</p>}
        </div>
    );
}

interface Props {
    branchZones: GymZone[];
    setRef: (id: string) => (node: HTMLElement | null) => void;
}

const GymZonesSection = React.memo(function GymZonesSection({ branchZones, setRef }: Props) {
    if (branchZones.length === 0) return null;

    return (
        <FadeIn>
            <section ref={setRef('zones')} id="zones" className="marketplace-panel p-6 sm:p-8">
                <SectionHeading
                    kicker="Khu vực nổi bật"
                    title="Những không gian quyết định cảm giác tập"
                    description="Không chỉ là danh sách máy móc — đây là các khu vực giúp bạn đánh giá ngay cơ sở này hợp thói quen tập của mình đến đâu."
                />

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {branchZones.map((zone) => (
                        <article
                            key={zone.id}
                            className={`rounded-lg border p-5 ${zone.is_signature_zone ? 'border-[color:var(--mk-accent)]/55 bg-[color:var(--mk-accent-soft)]/55' : 'border-[color:var(--mk-line)] bg-white/75'}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">{zone.zone_type.replace(/_/g, ' ')}</div>
                                    <h3 className="mt-2 text-lg font-bold tracking-[-0.04em] text-[color:var(--mk-text)]">{zone.name}</h3>
                                </div>
                                {zone.is_signature_zone && <span className="marketplace-badge marketplace-badge--accent">Signature</span>}
                            </div>

                            {zone.description && (
                                <p className="mt-3 text-sm leading-7 text-[color:var(--mk-text-soft)]">{zone.description}</p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2">
                                {zone.capacity && <span className="marketplace-badge marketplace-badge--neutral">{zone.capacity} người</span>}
                                {zone.area_sqm && <span className="marketplace-badge marketplace-badge--neutral">{zone.area_sqm} m²</span>}
                                {zone.temperature_mode && <span className="marketplace-badge marketplace-badge--neutral">{zone.temperature_mode}</span>}
                                {zone.sound_profile && <span className="marketplace-badge marketplace-badge--neutral">{zone.sound_profile}</span>}
                                {zone.booking_required && <span className="marketplace-badge marketplace-badge--neutral">Đặt trước</span>}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </FadeIn>
    );
});

export default GymZonesSection;
