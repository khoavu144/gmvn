import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import type { Product } from '../../types';
import { formatPrice } from '../../utils/format';
import { StarRating } from '../ui/StarRating';
import { titleizeToken } from '../../utils/productDetailUtils';
import { trackEvent } from '../../lib/analytics';

interface ProductBuyPanelProps {
    product: Product;
    activeVariants: Product['variants'];
    selectedVariantId: string | null;
    setSelectedVariantId: (id: string | null) => void;
    buyLead: string;
    isAuthenticated: boolean;
}

export function ProductBuyPanel({
    product,
    activeVariants = [],
    selectedVariantId,
    setSelectedVariantId,
    buyLead,
    isAuthenticated,
}: ProductBuyPanelProps) {
    const selectedVariant = activeVariants.find((variant) => variant.id === selectedVariantId);
    const displayPrice = selectedVariant?.price ?? product.price;
    const comparePrice = selectedVariant?.compare_at_price ?? product.compare_at_price ?? null;
    const hasDiscount = comparePrice != null && comparePrice > displayPrice;
    const discountPct = hasDiscount ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100) : 0;
    const trainingPackage = product.training_package ?? null;
    const sellerConversationParams = (() => {
        if (!product.seller?.id) {
            return null;
        }

        const params = new URLSearchParams({
            to: product.seller.id,
            name: product.seller.full_name || 'Người bán',
            draft: `Xin chào, tôi muốn hỏi thêm về sản phẩm ${product.title}.`,
            context_type: 'product',
            context_id: product.id,
            context_label: product.title,
        });

        return params.toString();
    })();

    const sellerChatTarget = product.seller?.id
        ? isAuthenticated
            ? `/messages?${sellerConversationParams}`
            : '/login'
        : '/marketplace';

    return (
        <div className="mpd-buy-panel">
            <div className="mpd-info-head">
                <span className="mpd-category-label">
                    {product.category?.icon_emoji} {product.category?.label}
                </span>
                {product.product_type === 'digital' && (
                    <span className="marketplace-badge marketplace-badge--digital">Sản phẩm số</span>
                )}
            </div>

            <h1 className="mpd-title">{product.title}</h1>
            <p className="mpd-buy-lead">{buyLead}</p>

            {product.seller && (
                <div className="mpd-seller-proof">
                    <div className="mpd-seller-proof-avatar">
                        {product.seller.avatar_url ? (
                            <img src={product.seller.avatar_url} alt={product.seller.full_name} />
                        ) : (
                            <div className="mpd-seller-initials">{product.seller.full_name.charAt(0)}</div>
                        )}
                    </div>
                    <div className="mpd-seller-proof-info">
                        <strong>{product.seller.full_name}</strong>
                        <div className="mpd-seller-proof-stats">
                            {product.sale_count > 0 && <span>{product.sale_count} đã bán</span>}
                            {product.avg_rating != null && Number(product.avg_rating) > 0 && (
                                <span className="inline-flex items-center gap-1">
                                    <StarRating rating={Number(product.avg_rating)} />
                                    {Number(product.avg_rating).toFixed(1)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {product.review_count > 0 && (
                <div className="mpd-rating-summary">
                    <StarRating rating={product.avg_rating ?? 0} />
                    <span className="mpd-rating-value">
                        {product.avg_rating != null ? Number(product.avg_rating).toFixed(1) : '0.0'}
                    </span>
                    <span className="mpd-rating-count">({product.review_count} đánh giá)</span>
                </div>
            )}

            <div className="mpd-price-row">
                <span className="mpd-price-main">{formatPrice(displayPrice, product.currency)}</span>
                {hasDiscount && (
                    <>
                        <s className="mpd-price-orig">{formatPrice(comparePrice!, product.currency)}</s>
                        <span className="mpd-price-badge">-{discountPct}%</span>
                    </>
                )}
            </div>

            {trainingPackage ? (
                <div className="mpd-metrics-strip">
                    <span className="mpd-metric">{titleizeToken(trainingPackage.goal)}</span>
                    <span className="mpd-metric">{trainingPackage.duration_weeks} tuần</span>
                    <span className="mpd-metric">
                        {trainingPackage.level === 'all' ? 'Mọi level' : titleizeToken(trainingPackage.level)}
                    </span>
                    {trainingPackage.includes_nutrition && (
                        <span className="mpd-metric">Kèm dinh dưỡng</span>
                    )}
                </div>
            ) : product.product_type === 'physical' ? (
                <div className="mpd-metrics-strip">
                    {product.stock_quantity != null && (
                        <span className="mpd-metric">Còn {product.stock_quantity} sp</span>
                    )}
                    {activeVariants.length > 0 && (
                        <span className="mpd-metric">{activeVariants.length} lựa chọn</span>
                    )}
                    <span className="mpd-metric">Giao hàng toàn quốc</span>
                </div>
            ) : product.product_type === 'service' ? (
                <div className="mpd-metrics-strip">
                    {!!product.attributes?.['Format'] && (
                        <span className="mpd-metric">{String(product.attributes['Format'])}</span>
                    )}
                    {!!product.attributes?.['Phù hợp'] && (
                        <span className="mpd-metric">{String(product.attributes['Phù hợp'])}</span>
                    )}
                    {activeVariants.length > 0 && (
                        <span className="mpd-metric">{activeVariants.length} gói</span>
                    )}
                    <span className="mpd-metric">Đặt lịch trước</span>
                </div>
            ) : (
                <div className="mpd-metrics-strip">
                    <span className="mpd-metric">Tải sau khi người bán xác nhận</span>
                    <span className="mpd-metric">Truy cập vĩnh viễn</span>
                </div>
            )}

            {activeVariants.length > 0 && (
                <div className="mpd-variants">
                    <span className="mpd-variants-label" id="mpd-variants-label">
                        Lựa chọn:
                    </span>
                    <div className="mpd-variants-grid" role="group" aria-labelledby="mpd-variants-label">
                        <button
                            className={`mpd-variant-btn ${selectedVariantId === null ? 'mpd-variant-btn--active' : ''}`}
                            onClick={() => setSelectedVariantId(null)}
                            type="button"
                        >
                            Mặc định
                        </button>
                        {activeVariants.map((variant) => (
                            <button
                                key={variant.id}
                                className={`mpd-variant-btn ${selectedVariantId === variant.id ? 'mpd-variant-btn--active' : ''}`}
                                onClick={() => setSelectedVariantId(variant.id)}
                                type="button"
                            >
                                {variant.variant_label}
                                {variant.stock_quantity === 0 && (
                                    <span className="mpd-variant-sold"> (Hết)</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="mpd-cta-row">
                <Link
                    to={sellerChatTarget}
                    className="mpd-btn-primary"
                    onClick={() => trackEvent('detail_cta_click', {
                        page_id: 'product_detail',
                        product_id: product.id,
                        target: sellerChatTarget,
                        cta_id: product.seller?.id ? 'contact_seller' : 'back_to_marketplace',
                    })}
                >
                    {product.seller?.id ? 'Trao đổi với người bán' : 'Quay lại cửa hàng'}
                </Link>
                <button
                    className="mpd-btn-secondary"
                    type="button"
                    disabled
                    title="Danh sách yêu thích đang hoàn thiện"
                    aria-label="Lưu sản phẩm (sắp ra mắt)"
                >
                    <Heart className="h-5 w-5" strokeWidth={2} aria-hidden />
                </button>
            </div>
            <p className="text-xs leading-6 text-gray-500">
                {product.seller?.id
                    ? 'Liên hệ trực tiếp với người bán để hỏi về biến thể, giao nhận hoặc lịch triển khai. Giao dịch được thỏa thuận giữa hai bên.'
                    : 'Quay lại danh sách sản phẩm để tìm sản phẩm phù hợp.'}
            </p>

            <ul className="mpd-trust">
                {product.training_package && <li>Xem trước cấu trúc tuần tập ngay trên trang</li>}
                {!product.training_package && product.product_type === 'digital' && <li>Tải sau khi người bán xác nhận</li>}
                {product.product_type === 'physical' && <li>Giao hàng toàn quốc</li>}
                <li>Trao đổi trực tiếp với người bán</li>
                <li>Hỗ trợ 24/7</li>
            </ul>
        </div>
    );
}
