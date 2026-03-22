import React from 'react';
import GymCard from '../GymCard';
import type { GymCenter } from '../../types';

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
    similarGyms: GymCenter[];
    setRef: (id: string) => (node: HTMLElement | null) => void;
}

const GymSimilarSection = React.memo(function GymSimilarSection({ similarGyms, setRef }: Props) {
    if (similarGyms.length === 0) return null;

    return (
        <section ref={setRef('similar')} id="similar" className="marketplace-panel p-6 sm:p-8">
            <SectionHeading
                kicker="Cơ sở tương tự"
                title="Nếu địa điểm này gần đúng yêu cầu, hãy xem thêm những lựa chọn liên quan"
                description="Những cơ sở tương tự được gợi ý theo loại hình, vùng giá và khu vực để bạn so sánh nhanh trước khi quyết định."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {similarGyms.map((item) => (
                    <GymCard key={item.id} gym={item} variant="compact" />
                ))}
            </div>
        </section>
    );
});

export default GymSimilarSection;
