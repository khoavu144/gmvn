import React from 'react';
import type { GymAmenity, GymEquipment } from '../../types';

import { GymSectionHeading } from './GymSectionHeading';

interface Props {
    branchAmenities: GymAmenity[];
    branchEquipment: GymEquipment[];
    branchEquipmentGroups: Record<string, GymEquipment[]>;
    setRef: (id: string) => (node: HTMLElement | null) => void;
}

const GymFacilitiesSection = React.memo(function GymFacilitiesSection({ branchAmenities, branchEquipment, branchEquipmentGroups, setRef }: Props) {
    if (branchAmenities.length === 0 && branchEquipment.length === 0) return null;

    return (
            <section ref={setRef('facilities')} id="facilities" className="gym-detail-section marketplace-panel gv-panel-pad">
                <GymSectionHeading
                    kicker="Tiện ích"
                    title="Tiện ích và thiết bị hỗ trợ quyết định"
                    description="Những chi tiết nhỏ như tủ để đồ, phòng tắm, dịch vụ khăn hay chất lượng trang thiết bị thường là thứ quyết định bạn có duy trì thói quen tạp luyện hay không."
                />

                <div className="space-y-8">
                    {branchAmenities.length > 0 && (
                        <div>
                            <div className="mb-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[color:var(--mk-muted)]">Danh sách tiện ích</div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {branchAmenities.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`rounded-lg border px-4 py-4 ${item.is_available ? 'border-[color:var(--mk-line)] bg-white/80' : 'border-[color:var(--mk-line)]/70 bg-[color:var(--mk-paper-strong)]/60 opacity-70'}`}
                                    >
                                        <div className="text-sm font-bold text-[color:var(--mk-text)]">{item.name}</div>
                                        {item.note && <p className="mt-2 text-sm leading-6 text-[color:var(--mk-muted)]">{item.note}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {branchEquipment.length > 0 && (
                        <details className="mt-6 rounded-lg border border-[color:var(--mk-line)] bg-white/70 group">
                            <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-4 text-sm font-bold uppercase tracking-[0.1em] text-[color:var(--mk-text)] transition hover:bg-white/90">
                                Thư viện thiết bị ({Object.values(branchEquipmentGroups).flat().length} items)
                                <span className="text-xl transition-transform group-open:rotate-180">↓</span>
                            </summary>
                            <div className="border-t border-[color:var(--mk-line)] p-5">
                                <div className="grid gap-4 md:grid-cols-2 animate-fade-in">
                                    {Object.entries(branchEquipmentGroups).map(([category, items]) => (
                                        <div key={category} className="rounded-lg border border-[color:var(--mk-line)] bg-white/75 p-4">
                                            <div className="mb-3 flex items-center justify-between gap-3">
                                                <div className="text-sm font-bold tracking-[-0.03em] text-[color:var(--mk-text)]">{category}</div>
                                                <span className="marketplace-badge marketplace-badge--neutral">{items.length} items</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((item) => (
                                                    <span key={item.id} className="rounded-lg border border-[color:var(--mk-line)] bg-[color:var(--mk-paper)] px-3 py-1.5 text-[0.8rem] font-semibold text-[color:var(--mk-text)]">
                                                        {item.name}{item.quantity && item.quantity > 1 ? ` ×${item.quantity}` : ''}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </details>
                    )}
                </div>
            </section>
    );
});

export default GymFacilitiesSection;
