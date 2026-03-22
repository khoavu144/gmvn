import React from 'react';
import type { GymBranch } from '../../types';

function SectionHeading({ kicker, title, description }: { kicker: string; title: string; description?: string }) {
    return (
        <div className="mb-6 space-y-2">
            <div className="marketplace-section-kicker">{kicker}</div>
            <h2 className="marketplace-section-title">{title}</h2>
            {description && <p className="marketplace-lead max-w-none text-[0.98rem]">{description}</p>}
        </div>
    );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-stone-200/90 bg-white/75 px-4 py-3 shadow-[0_10px_28px_rgba(53,41,26,0.04)]">
            <div className="text-[0.66rem] font-bold uppercase tracking-[0.2em] text-stone-500">{label}</div>
            <div className="mt-1 text-sm font-bold text-stone-900">{value}</div>
        </div>
    );
}

interface Props {
    branchMapEmbedUrl: string | null;
    branchLatitude: number | null;
    branchLongitude: number | null;
    branchName: string;
    branchDetail: GymBranch | null;
    setRef: (id: string) => (node: HTMLElement | null) => void;
}

const GymMapSection = React.memo(function GymMapSection({
    branchMapEmbedUrl,
    branchLatitude,
    branchLongitude,
    branchName,
    branchDetail,
    setRef,
}: Props) {
    const hasCoords = branchLatitude !== null && branchLongitude !== null;
    if (!branchMapEmbedUrl && !hasCoords) return null;

    const lat = Number(branchLatitude);
    const lon = Number(branchLongitude);

    return (
        <section ref={setRef('map')} id="map" className="marketplace-panel p-6 sm:p-8">
            <SectionHeading
                kicker="Bản đồ định vị"
                title="Định vị chi nhánh và bối cảnh quanh phòng tập"
                description="Bản đồ giúp bạn trả lời ngay một câu hỏi thực tế: mình có tiện đường rẽ vào nơi này đều đặn trong tuần hay không."
            />

            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                <div className="space-y-4">
                    <SummaryPill label="Địa chỉ" value={branchDetail?.address || 'Chưa cập nhật'} />
                    <SummaryPill label="Gửi xe" value={branchDetail?.parking_summary || 'Chưa cập nhật chỗ gửi xe'} />
                    <SummaryPill
                        label="Check-in"
                        value={branchDetail?.check_in_instructions || 'Tư vấn tại rail bên phải để được hướng dẫn nhanh'}
                    />
                </div>

                {branchMapEmbedUrl ? (
                    <div className="overflow-hidden rounded-lg border border-stone-200/90 bg-stone-100">
                        <iframe
                            src={branchMapEmbedUrl}
                            width="100%"
                            height="420"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`Bản đồ ${branchName}`}
                        />
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-stone-200/90 bg-stone-100">
                        <iframe
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.01},${lat - 0.01},${lon + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lon}`}
                            width="100%"
                            height="420"
                            style={{ border: 0 }}
                            loading="lazy"
                            title={`Bản đồ ${branchName}`}
                        />
                    </div>
                )}
            </div>
        </section>
    );
});

export default GymMapSection;
