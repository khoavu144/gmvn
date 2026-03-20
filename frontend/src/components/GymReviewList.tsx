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
        return <div className="animate-pulse columns-1 md:columns-2 gap-4">
            <div className="h-40 bg-white/5 border border-white/10 rounded-2xl w-full mb-4"></div>
            <div className="h-32 bg-white/5 border border-white/10 rounded-2xl w-full mb-4"></div>
        </div>;
    }

    if (reviews.length === 0) {
        return <div className="text-[color:var(--mk-muted)] italic text-sm py-8 text-center border border-dashed border-white/20 rounded-2xl bg-white/5">Chưa có đánh giá nào cho phòng tập này. Hãy là người đầu tiên!</div>;
    }

    return (
        <div className="columns-1 md:columns-2 gap-4">
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
        <div className="border border-white/10 bg-white/5 p-5 sm:p-6 rounded-2xl break-inside-avoid mb-4 hover:bg-white/10 transition-colors">
            {/* Review body */}
            <div className="flex gap-4">
                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-300 uppercase flex-shrink-0 border border-white/10">
                    {review.user?.full_name?.charAt(0) || 'H'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-sm text-gray-100 truncate pr-2">{review.user?.full_name || `Hội viên ${review.user_id.substring(0, 4)}...`}</span>
                        <span className="text-[10px] font-medium tracking-wider text-[color:var(--mk-muted)] uppercase whitespace-nowrap">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <div className="flex items-center mb-3">
                        {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} className={`text-sm ${review.rating >= star ? 'text-yellow-400' : 'text-[color:var(--mk-text-soft)]'}`}>
                                ★
                            </span>
                        ))}
                    </div>
                    {review.comment && <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>}
                </div>
            </div>

            {/* Existing reply */}
            {review.reply_text && (
                <div className="mt-5 bg-black/50 border border-white/10 rounded-xl p-4 relative">
                    <div className="absolute -top-2 left-6 w-4 h-4 bg-black/50 border-t border-l border-white/10 rotate-45"></div>
                    <div className="flex items-center gap-2 mb-2 relative z-10">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--mk-muted)]">Phản hồi từ thiết chế</span>
                        {review.replied_at && (
                            <span className="text-[10px] text-[color:var(--mk-text-soft)]">
                                • {new Date(review.replied_at).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed relative z-10">{review.reply_text}</p>
                </div>
            )}

            {/* Reply form (gym_owner / trainer, only if no reply yet) */}
            {canReply && !review.reply_text && (
                <div className="mt-4">
                    {!showReplyForm ? (
                        <button
                            onClick={() => setShowReplyForm(true)}
                            className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--mk-muted)] hover:text-white transition-colors border border-white/20 px-3 py-1.5 rounded-lg hover:border-white"
                        >
                            ↩ Trả lời đánh giá này
                        </button>
                    ) : (
                        <form onSubmit={handleReplySubmit} className="space-y-3 bg-black/30 p-4 rounded-xl border border-white/10 mt-2">
                            <textarea
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Viết phản hồi của bạn..."
                                rows={3}
                                className="w-full text-sm bg-transparent text-white border border-white/20 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-white focus:border-white placeholder-gray-500 transition-all font-medium"
                                maxLength={1000}
                                autoFocus
                            />
                            {replyError && (
                                <p className="text-[10px] font-medium text-red-400">{replyError}</p>
                            )}
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    disabled={submitting || !replyText.trim()}
                                    className="text-xs font-bold uppercase tracking-wider bg-white text-black px-4 py-2 rounded-lg hover:bg-[color:var(--mk-paper-strong)] disabled:opacity-50 transition-colors"
                                >
                                    {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowReplyForm(false); setReplyText(''); setReplyError(null); }}
                                    className="text-xs font-bold uppercase tracking-wider text-[color:var(--mk-muted)] hover:text-white transition-colors px-3"
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
