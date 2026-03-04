import React, { useEffect, useState } from 'react';
import { gymService } from '../services/gymService';
import type { GymReview } from '../types';

interface GymReviewListProps {
    gymId: string;
}

const GymReviewList: React.FC<GymReviewListProps> = ({ gymId }) => {
    const [reviews, setReviews] = useState<GymReview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [gymId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await gymService.getGymReviews(gymId);
            if (res.success) {
                setReviews(res.reviews || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-100 rounded-xl w-full"></div>
            <div className="h-24 bg-gray-100 rounded-xl w-full"></div>
        </div>;
    }

    if (reviews.length === 0) {
        return <div className="text-gray-500 italic text-sm py-4">Chưa có đánh giá nào cho phòng tập này.</div>;
    }

    return (
        <div className="space-y-4">
            {reviews.map(review => (
                <div key={review.id} className="border border-gray-100 bg-white p-4 rounded-xl flex gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase flex-shrink-0">
                        {review.user?.full_name?.charAt(0) || 'H'}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm">{review.user?.full_name || `Hội viên ${review.user_id.substring(0, 4)}...`}</span>
                            <span className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={`text-sm ${review.rating >= star ? 'text-black' : 'text-gray-200'}`}>
                                    ★
                                </span>
                            ))}
                        </div>
                        {review.comment && <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default GymReviewList;
