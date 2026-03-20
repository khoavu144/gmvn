import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import '../styles/marketplace.css';
import type { Product, ProductReview } from '../types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

function formatPrice(n: number, currency = 'VND'): string {
    if (currency === 'VND') return n.toLocaleString('vi-VN') + 'đ';
    return n.toLocaleString('en-US', { style: 'currency', currency });
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="mpd-stars" aria-label={`Đánh giá ${rating}/5`}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i} className={i <= Math.round(rating) ? 'mpd-star mpd-star--filled' : 'mpd-star'}>★</span>
            ))}
        </div>
    );
}

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        axios.get(`${API}/marketplace/products/${slug}`)
            .then(r => {
                setProduct(r.data.product);
                setActiveImage(r.data.product.thumbnail_url ?? null);
            })
            .catch(err => {
                if (err.response?.status === 404) setNotFound(true);
            })
            .finally(() => setLoading(false));
    }, [slug]);

    useEffect(() => {
        if (!product) return;
        axios.get(`${API}/marketplace/products/${product.id}/reviews`)
            .then(r => setReviews(r.data.reviews ?? []))
            .catch(() => {});
    }, [product]);

    if (loading) return (
        <div className="mpd-loading">
            <div className="marketplace-loading-spinner" />
            <p>Đang tải...</p>
        </div>
    );

    if (notFound || !product) return (
        <div className="mpd-not-found">
            <p>😞</p>
            <h2>Sản phẩm không tồn tại</h2>
            <Link to="/marketplace" className="marketplace-btn-ghost">← Về Marketplace</Link>
        </div>
    );

    const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
    const displayPrice = selectedVariant?.price ?? product.price;
    const comparePrice = selectedVariant?.compare_at_price ?? product.compare_at_price;
    const hasDiscount = comparePrice && comparePrice > displayPrice;
    const discountPct = hasDiscount ? Math.round(((comparePrice! - displayPrice) / comparePrice!) * 100) : 0;

    const allImages = [
        ...(product.thumbnail_url ? [product.thumbnail_url] : []),
        ...(product.gallery ?? []),
    ].filter((url, idx, arr) => arr.indexOf(url) === idx);

    const tp = product.training_package;

    return (
        <>
            <Helmet>
                <title>{product.title} | GYMERVIET Marketplace</title>
                <meta name="description" content={product.description?.substring(0, 155) ?? `Mua ${product.title} tại GYMERVIET Marketplace`} />
            </Helmet>

            <div className="mpd-page">
                {/* Breadcrumb */}
                <nav className="mpd-breadcrumb" aria-label="Đường dẫn">
                    <Link to="/marketplace">Marketplace</Link>
                    {product.category && (
                        <>
                            <span>/</span>
                            <Link to={`/marketplace?category=${product.category.slug}`}>
                                {product.category.icon_emoji} {product.category.label}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="mpd-breadcrumb-current">{product.title}</span>
                </nav>

                <div className="mpd-layout">
                    {/* Left: Gallery */}
                    <div className="mpd-gallery">
                        <div className="mpd-gallery-main">
                            {activeImage ? (
                                <img src={activeImage} alt={product.title} className="mpd-gallery-main-img" />
                            ) : (
                                <div className="mpd-gallery-placeholder">{product.category?.icon_emoji ?? '📦'}</div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="mpd-gallery-thumbs">
                                {allImages.map((url, i) => (
                                    <button
                                        key={i}
                                        className={`mpd-gallery-thumb ${activeImage === url ? 'mpd-gallery-thumb--active' : ''}`}
                                        onClick={() => setActiveImage(url)}
                                        aria-label={`Xem ảnh ${i + 1}`}
                                        type="button"
                                    >
                                        <img src={url} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Product info + sticky buy rail */}
                    <div className="mpd-info">
                        <div className="mpd-info-head">
                            <span className="mpd-category-label">
                                {product.category?.icon_emoji} {product.category?.label}
                            </span>
                            {product.product_type === 'digital' && (
                                <span className="marketplace-badge marketplace-badge--digital">Sản phẩm số</span>
                            )}
                        </div>

                        <h1 className="mpd-title">{product.title}</h1>

                        {/* Seller */}
                        {product.seller && (
                            <div className="mpd-seller">
                                {product.seller.avatar_url ? (
                                    <img src={product.seller.avatar_url} alt={product.seller.full_name} className="mpd-seller-avatar" />
                                ) : (
                                    <div className="mpd-seller-initials">{product.seller.full_name.charAt(0)}</div>
                                )}
                                <span>Bán bởi <strong>{product.seller.full_name}</strong></span>
                            </div>
                        )}

                        {/* Rating summary */}
                        {product.review_count > 0 && (
                            <div className="mpd-rating-summary">
                                <StarRating rating={product.avg_rating ?? 0} />
                                <span className="mpd-rating-value">{product.avg_rating?.toFixed(1)}</span>
                                <span className="mpd-rating-count">({product.review_count} đánh giá)</span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="mpd-price-row">
                            <span className="mpd-price-main">{formatPrice(displayPrice, product.currency)}</span>
                            {hasDiscount && (
                                <>
                                    <s className="mpd-price-orig">{formatPrice(comparePrice!, product.currency)}</s>
                                    <span className="mpd-price-badge">-{discountPct}%</span>
                                </>
                            )}
                        </div>

                        {/* Training package highlights */}
                        {tp && (
                            <div className="mpd-tp-highlights">
                                <div className="mpd-tp-highlight">
                                    <span>🎯</span>
                                    <div>
                                        <strong>Mục tiêu</strong>
                                        <span>{tp.goal.replace(/_/g, ' ')}</span>
                                    </div>
                                </div>
                                <div className="mpd-tp-highlight">
                                    <span>📅</span>
                                    <div>
                                        <strong>Thời lượng</strong>
                                        <span>{tp.duration_weeks} tuần · {tp.sessions_per_week} buổi/tuần</span>
                                    </div>
                                </div>
                                <div className="mpd-tp-highlight">
                                    <span>💪</span>
                                    <div>
                                        <strong>Trình độ</strong>
                                        <span>{tp.level === 'all' ? 'Tất cả trình độ' : tp.level}</span>
                                    </div>
                                </div>
                                {tp.includes_nutrition && (
                                    <div className="mpd-tp-highlight">
                                        <span>🥗</span>
                                        <div>
                                            <strong>Dinh dưỡng</strong>
                                            <span>Có kèm thực đơn</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mpd-variants">
                                <label className="mpd-variants-label">Lựa chọn:</label>
                                <div className="mpd-variants-grid">
                                    <button
                                        className={`mpd-variant-btn ${selectedVariantId === null ? 'mpd-variant-btn--active' : ''}`}
                                        onClick={() => setSelectedVariantId(null)}
                                        type="button"
                                    >
                                        Mặc định
                                    </button>
                                    {product.variants.filter(v => v.is_active).map(v => (
                                        <button
                                            key={v.id}
                                            className={`mpd-variant-btn ${selectedVariantId === v.id ? 'mpd-variant-btn--active' : ''}`}
                                            onClick={() => setSelectedVariantId(v.id)}
                                            type="button"
                                        >
                                            {v.variant_label}
                                            {v.stock_quantity === 0 && <span className="mpd-variant-sold"> (Hết)</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="mpd-cta-row">
                            <button className="mpd-btn-primary" type="button">
                                {product.product_type === 'digital' ? '🔓 Mua ngay' : '🛒 Thêm vào giỏ'}
                            </button>
                            <button className="mpd-btn-secondary" type="button">
                                ♡ Lưu
                            </button>
                        </div>

                        {/* Trust signals */}
                        <ul className="mpd-trust">
                            {product.product_type === 'digital' && (
                                <li>📥 Tải ngay sau khi thanh toán</li>
                            )}
                            {product.product_type === 'physical' && (
                                <li>🚚 Giao hàng toàn quốc</li>
                            )}
                            <li>🔒 Thanh toán an toàn</li>
                            <li>💬 Hỗ trợ 24/7</li>
                        </ul>
                    </div>
                </div>

                {/* Tabs: Description / Specs / Reviews */}
                <div className="mpd-tabs-section">
                    <div className="mpd-tabs">
                        <button
                            className={`mpd-tab ${activeTab === 'description' ? 'mpd-tab--active' : ''}`}
                            onClick={() => setActiveTab('description')}
                            type="button"
                        >Mô tả</button>
                        {product.attributes && Object.keys(product.attributes).length > 0 && (
                            <button
                                className={`mpd-tab ${activeTab === 'specs' ? 'mpd-tab--active' : ''}`}
                                onClick={() => setActiveTab('specs')}
                                type="button"
                            >Thông số</button>
                        )}
                        <button
                            className={`mpd-tab ${activeTab === 'reviews' ? 'mpd-tab--active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                            type="button"
                        >
                            Đánh giá {product.review_count > 0 && `(${product.review_count})`}
                        </button>
                    </div>

                    <div className="mpd-tab-content">
                        {activeTab === 'description' && (
                            <div className="mpd-description">
                                {product.description ? (
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
                                ) : (
                                    <p className="mpd-empty-text">Chưa có mô tả chi tiết.</p>
                                )}

                                {/* Training package program preview */}
                                {tp?.program_structure && tp.preview_weeks > 0 && (
                                    <div className="mpd-program-preview">
                                        <h3>📋 Xem trước lịch tập (Tuần 1)</h3>
                                        {Object.entries(tp.program_structure).slice(0, tp.preview_weeks).map(([week, days]) => (
                                            <div key={week} className="mpd-program-week">
                                                <h4>{week.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</h4>
                                                {Object.entries(days).map(([day, plan]) => (
                                                    <div key={day} className="mpd-program-day">
                                                        <strong>{plan.title}</strong>
                                                        {plan.exercises.length > 0 && (
                                                            <table className="mpd-exercise-table">
                                                                <thead>
                                                                    <tr><th>Bài tập</th><th>Sets</th><th>Reps</th><th>Nghỉ</th></tr>
                                                                </thead>
                                                                <tbody>
                                                                    {plan.exercises.map((ex, i) => (
                                                                        <tr key={i}>
                                                                            <td>{ex.name}</td>
                                                                            <td>{ex.sets}</td>
                                                                            <td>{ex.reps}</td>
                                                                            <td>{ex.rest_seconds ? `${ex.rest_seconds}s` : '—'}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'specs' && product.attributes && (
                            <table className="mpd-specs-table">
                                <tbody>
                                    {Object.entries(product.attributes).map(([k, v]) => (
                                        <tr key={k}>
                                            <td className="mpd-specs-key">{k.replace(/_/g, ' ')}</td>
                                            <td>{String(v)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="mpd-reviews">
                                {reviews.length === 0 ? (
                                    <p className="mpd-empty-text">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                                ) : (
                                    reviews.map(r => (
                                        <div key={r.id} className="mpd-review">
                                            <div className="mpd-review-head">
                                                <strong>{r.user?.full_name ?? 'Người dùng'}</strong>
                                                <StarRating rating={r.rating} />
                                                {r.is_verified_purchase && (
                                                    <span className="mpd-verified-badge">✓ Đã mua</span>
                                                )}
                                                <span className="mpd-review-date">
                                                    {new Date(r.created_at).toLocaleDateString('vi-VN')}
                                                </span>
                                            </div>
                                            {r.comment && <p className="mpd-review-comment">{r.comment}</p>}
                                            {r.reply_text && (
                                                <div className="mpd-review-reply">
                                                    <strong>Phản hồi từ người bán:</strong>
                                                    <p>{r.reply_text}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
