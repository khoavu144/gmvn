import React from 'react';
import GymCard from '../GymCard';
import type { GymCenter } from '../../types';
import { GymSectionHeading } from './GymSectionHeading';

interface Props {
    similarGyms: GymCenter[];
    setRef: (id: string) => (node: HTMLElement | null) => void;
}

const GymSimilarSection = React.memo(function GymSimilarSection({ similarGyms, setRef }: Props) {
    if (similarGyms.length === 0) return null;

    return (
        <section ref={setRef('similar')} id="similar" className="gym-detail-section marketplace-panel p-6 sm:p-8">
            <GymSectionHeading
                kicker="Cơ sở tương tự"
                title="Nếu địa điểm này gần đúng yêu cầu, hãy xem thêm những lựa chọn liên quan"
                description="Những cơ sở tương tự được gợi ý theo loại hình, vùng giá và khu vực để bạn so sánh nhanh trước khi quyết định."
            />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                {similarGyms.map((item) => (
                    <div key={item.id} className="h-full min-h-0">
                        <GymCard gym={item} variant="compact" />
                    </div>
                ))}
            </div>
        </section>
    );
});

export default GymSimilarSection;
