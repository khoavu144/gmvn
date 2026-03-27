import { CheckCircle2 } from 'lucide-react';
import type { ProductReview } from '../../types';
import { StarRating } from '../ui/StarRating';

interface ProductReviewsProps {
    reviews: ProductReview[];
    reviewCount: number;
}

export function ProductReviews({ reviews, reviewCount }: ProductReviewsProps) {
    return (
        <section className="mpd-section" id="reviews">
            <div className="mpd-section-head">
                <h2 className="mpd-section-title">
                    Đánh giá từ khách hàng {reviewCount > 0 && `(${reviewCount})`}
                </h2>
                <p className="mpd-section-copy">
                    Xác nhận lại chất lượng thực tế sau khi đã xem đủ thông tin mua hàng.
                </p>
            </div>
            <div className="mpd-reviews">
                {reviews.length === 0 ? (
                    <p className="mpd-empty-text">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="mpd-review">
                            <div className="mpd-review-head">
                                <strong>{review.user?.full_name ?? 'Người dùng'}</strong>
                                <StarRating rating={review.rating} />
                                {review.is_verified_purchase && (
                                    <span className="mpd-verified-badge inline-flex items-center gap-1">
                                        <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                                        Đã mua
                                    </span>
                                )}
                                <span className="mpd-review-date">
                                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            {review.comment && <p className="mpd-review-comment">&quot;{review.comment}&quot;</p>}
                            {review.reply_text && (
                                <div className="mpd-review-reply">
                                    <strong>Phản hồi từ người bán:</strong>
                                    <p>{review.reply_text}</p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
