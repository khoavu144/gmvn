import React, { useEffect, useState } from 'react';
import { logger } from '../lib/logger';
import { gymService } from '../services/gymService';
import type { GymReview } from '../types';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface GymReviewListProps {
    gymId: string;
    refreshTick?: number;
}

const GymReviewList: React.FC<GymReviewListProps> = ({ gymId, refreshTick = 0 }) => {
    const [reviews, setReviews] = useState<GymReview[]>([]);
    const [loading, setLoading] = useState(true);
    const user = useSelector((state: RootState) => state.auth.user);
    const canReply = user?.user_type === 'gym_owner' || user?.user_type === 'trainer';

    useEffect(() => {
        fetchReviews();
    }, [gymId, refreshTick]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await gymService.getGymReviews(gymId);
            if (res.success) {
                setReviews(res.reviews || []);
            }
        } catch (err) {
            logger.error(err);
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
                <ReviewCard
                    key={review.id}
                    review={review}
                    gymId={gymId}
                    canReply={canReply}
                    onReplied={fetchReviews}
                />
            ))}
        </div>
    );
};

// ── Sub-component: individual review card with reply form ─────────────────────
interface ReviewCardProps {
    review: GymReview;
    gymId: string;
    canReply: boolean;
    onReplied: () => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, gymId, canReply, onReplied }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [replyError, setReplyError] = useState<string | null>(null);

    const handleReplySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setSubmitting(true);
        setReplyError(null);
        try {
            const res = await gymService.replyToReview(gymId, review.id, replyText);
            if (res.success) {
                setShowReplyForm(false);
                setReplyText('');
                onReplied();
            } else {
                setReplyError(res.error || 'Không thể gửi phản hồi');
            }
        } catch (err: any) {
            setReplyError(err?.response?.data?.error || 'Lỗi kết nối');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="border border-gray-100 bg-white p-4 rounded-xl">
            {/* Review body */}
            <div className="flex gap-4">
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

            {/* Existing reply */}
            {review.reply_text && (
                <div className="mt-3 ml-14 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Phản hồi từ Gym</span>
                        {review.replied_at && (
                            <span className="text-xs text-gray-400">
                                · {new Date(review.replied_at).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{review.reply_text}</p>
                </div>
            )}

            {/* Reply form (gym_owner / trainer, only if no reply yet) */}
            {canReply && !review.reply_text && (
                <div className="mt-3 ml-14">
                    {!showReplyForm ? (
                        <button
                            onClick={() => setShowReplyForm(true)}
                            className="text-xs font-bold text-gray-500 hover:text-black transition-colors underline underline-offset-2"
                        >
                            ↩ Trả lời
                        </button>
                    ) : (
                        <form onSubmit={handleReplySubmit} className="space-y-2">
                            <textarea
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Viết phản hồi của bạn..."
                                rows={3}
                                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-black/20"
                                maxLength={1000}
                                autoFocus
                            />
                            {replyError && (
                                <p className="text-xs text-red-500">{replyError}</p>
                            )}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={submitting || !replyText.trim()}
                                    className="text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowReplyForm(false); setReplyText(''); setReplyError(null); }}
                                    className="text-xs text-gray-500 hover:text-black transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
};

export default GymReviewList;
