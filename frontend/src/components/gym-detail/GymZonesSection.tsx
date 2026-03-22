import React from 'react';
import type { GymZone } from '../../types';

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
            <section ref={setRef('zones')} id="zones" className="marketplace-panel p-6 sm:p-7">
                <SectionHeading
                    kicker="Khu vực nổi bật"
                    title="Những không gian quyết định cảm giác tập"
                    description="Không chỉ là danh sách máy móc — đây là các khu vực giúp bạn đánh giá ngay cơ sở này hợp thói quen tập của mình đến đâu."
                />

                <div className="grid gap-3.5 md:grid-cols-2 xl:grid-cols-3">
                    {branchZones.map((zone) => (
                        <article
                            key={zone.id}
                            className={`rounded-lg border px-4 py-4 ${zone.is_signature_zone ? 'border-amber-500/50 bg-amber-50/70' : 'border-stone-200/90 bg-white/75'}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-stone-500">{zone.zone_type.replace(/_/g, ' ')}</div>
                                    <h3 className="mt-1.5 text-base font-bold tracking-[-0.03em] text-stone-900">{zone.name}</h3>
                                </div>
                                {zone.is_signature_zone && <span className="marketplace-badge marketplace-badge--accent">Signature</span>}
                            </div>

                            {zone.description && (
                                <p className="mt-2.5 text-sm leading-6 text-stone-600">{zone.description}</p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-1.5">
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
    );
});

export default GymZonesSection;
