import React, { useEffect, useState } from 'react';
import GymReviewForm from '../GymReviewForm';
import GymReviewList from '../GymReviewList';
import { gymService } from '../../services/gymService';

interface Props {
    gymId: string;
    branchId: string | null;
    gymTrustSummary?: any;
    setRef: (id: string) => (node: HTMLElement | null) => void;
}

const DIMENSION_LABELS = [
    { label: 'Tổng quan', key: 'avg_rating', isTop: true },
    { label: 'Thiết bị', key: 'equipment_rating' },
    { label: 'Sạch sẽ', key: 'cleanliness_rating' },
    { label: 'Hướng dẫn', key: 'coaching_rating' },
    { label: 'Không gian', key: 'atmosphere_rating' },
    { label: 'Chi phí', key: 'value_rating' },
];

const GymReviewsSection = React.memo(function GymReviewsSection({ gymId, branchId, gymTrustSummary, setRef }: Props) {
    const [canReview, setCanReview] = useState(false);
    const [refreshTick, setRefreshTick] = useState(0);

    useEffect(() => {
        if (!gymId) return;
        gymService.checkReviewEligibility(gymId)
            .then((res) => setCanReview(Boolean(res.success && res.canReview)))
            .catch(() => setCanReview(false));
    }, [gymId]);

    const getDimensionValue = (item: typeof DIMENSION_LABELS[0]) => {
        if (item.isTop) {
            return gymTrustSummary?.avg_rating != null
                ? `★ ${Number(gymTrustSummary.avg_rating).toFixed(1)}`
                : '—';
        }
        const val = gymTrustSummary?.dimensions?.[item.key];
        return val ? Number(val).toFixed(1) : '—';
    };

    return (
            <section ref={setRef('reviews')} id="reviews" className="rounded-lg border border-black/10 bg-[linear-gradient(180deg,rgba(32,25,20,1),rgba(24,18,15,1))] p-6 text-white sm:p-8">
                <div className="mb-6 space-y-2">
                    <div className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-white/60">Trust</div>
                    <h2 className="text-xl font-bold tracking-tight text-white">Cộng đồng nói gì về nơi này</h2>
                    <p className="text-sm leading-relaxed text-white/70">Trust block này kết hợp review tổng, dimension ratings và phản hồi từ venue để bạn đỡ phải đoán mò trước khi thử buổi đầu tiên.</p>
                </div>

                <div className="mb-6 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
                    {DIMENSION_LABELS.map((item) => (
                        <div key={item.label} className="rounded-lg border border-white/10 bg-white/6 px-4 py-4">
                            <div className="text-[0.64rem] font-bold uppercase tracking-[0.18em] text-white/55">{item.label}</div>
                            <div className="mt-2 text-lg font-bold tracking-[-0.04em] text-white">{getDimensionValue(item)}</div>
                        </div>
                    ))}
                </div>

                <GymReviewList gymId={gymId} refreshTick={refreshTick} />

                {branchId && canReview && (
                    <div className="mt-8 border-t border-white/10 pt-8">
                        <GymReviewForm gymId={gymId} branchId={branchId} onSuccess={() => setRefreshTick((c) => c + 1)} />
                    </div>
                )}

                {branchId && !canReview && (
                    <div className="mt-8 rounded-lg border border-white/10 bg-white/5 px-5 py-4 text-sm text-white/68">
                        Bạn cần có gói tập hoặc từng tương tác tư vấn với cơ sở này để để lại một review hợp lệ trên marketplace.
                    </div>
                )}
            </section>
    );
});

export default GymReviewsSection;
