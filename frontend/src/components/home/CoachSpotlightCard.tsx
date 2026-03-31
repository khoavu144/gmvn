import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { trackEvent } from '../../lib/analytics';
import type { Trainer } from '../../types';

type FeaturedTrainer = Trainer & {
    is_verified?: boolean;
    created_at?: string;
    slug?: string;
    user_type?: string;
};

interface CoachSpotlightCardProps {
    coach: FeaturedTrainer;
    currentIndex: number;
    totalCount: number;
    onNext: () => void;
    onPrefetch: (coach: FeaturedTrainer) => void;
}

function coachLink(coach: FeaturedTrainer): string {
    if (coach.user_type === 'athlete') {
        return coach.slug ? `/athlete/${coach.slug}` : `/athletes/${coach.id}`;
    }
    return coach.slug ? `/coach/${coach.slug}` : `/coaches/${coach.id}`;
}

export function CoachSpotlightCard({
    coach,
    currentIndex,
    totalCount,
    onNext,
    onPrefetch,
}: CoachSpotlightCardProps) {
    const basePriceMonthly = coach.base_price_monthly || 0;
    const priceDisplay = basePriceMonthly ? `${basePriceMonthly.toLocaleString('vi-VN')}đ` : 'Thoả thuận';
    const profileUrl = coachLink(coach);

    const handleViewProfile = () => {
        trackEvent('coach_spotlight_view', {
            coach_id: coach.id,
            index: currentIndex,
            total: totalCount,
        });
    };

    const handleNextCoach = () => {
        trackEvent('coach_spotlight_next', {
            coach_id: coach.id,
            index: currentIndex,
            total: totalCount,
        });
        onNext();
    };

    return (
        <div className="marketplace-panel gv-panel-pad shadow-sm ring-1 ring-gray-900/[0.06] lg:shadow-[0_12px_48px_-8px_rgba(15,23,42,0.12)]">
            {/* Header */}
            <div className="space-y-3 border-b border-gray-200 pb-4">
                <div className="marketplace-section-kicker">Thành viên nổi bật</div>
                <h2 className="marketplace-section-title">
                    Coach tháng này — cùng khám phá.
                </h2>
            </div>

            {/* Coach Card */}
            <div className="mt-6 space-y-5">
                {/* Avatar and Info */}
                <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-2 ring-blue-500/10 flex-shrink-0">
                        {coach.avatar_url ? (
                            <img
                                src={coach.avatar_url}
                                alt={coach.full_name}
                                className="h-full w-full object-cover"
                                width={96}
                                height={96}
                                loading="eager"
                                fetchPriority="high"
                                decoding="async"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl font-black text-gray-400">
                                {coach.full_name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Coach Info */}
                    <div className="min-w-0 flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold tracking-[-0.03em] text-gray-900 truncate">
                                {coach.full_name}
                            </h3>
                            {coach.is_verified && (
                                <span className="marketplace-badge marketplace-badge--verified text-xs">
                                    Đã xác minh
                                </span>
                            )}
                        </div>

                        {/* Specialty */}
                        <p className="mt-1 text-sm font-medium text-blue-600 truncate">
                            {coach.specialties?.[0] || 'Coach / vận động viên'}
                        </p>

                        {/* Price */}
                        <p className="mt-2 text-xs leading-6 text-gray-600">
                            Từ <span className="font-bold text-gray-900">{priceDisplay}</span>/tháng
                        </p>
                    </div>
                </div>

                {/* Bio */}
                {coach.bio && (
                    <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-sm leading-6 text-gray-700 line-clamp-2">
                            "{coach.bio}"
                        </p>
                    </div>
                )}

                {/* Counter and CTA Buttons */}
                <div className="space-y-3 border-t border-gray-200 pt-4">
                    <div className="text-xs font-medium text-gray-600 text-center">
                        <span className="font-bold text-gray-900">{currentIndex + 1}</span> / {totalCount} Coach
                    </div>

                    <div className="flex gap-2">
                        <Link
                            to={profileUrl}
                            onClick={handleViewProfile}
                            onMouseEnter={() => onPrefetch(coach)}
                            className="flex-1 btn-primary py-2.5 text-sm font-bold flex items-center justify-center gap-2 rounded-lg transition-all hover:scale-105"
                        >
                            Xem hồ sơ
                            <ChevronRight className="h-4 w-4" />
                        </Link>

                        {totalCount > 1 && (
                            <button
                                onClick={handleNextCoach}
                                className="btn-secondary px-4 py-2.5 text-sm font-bold rounded-lg transition-all hover:scale-105"
                                aria-label="Coach tiếp theo"
                            >
                                Tiếp →
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
