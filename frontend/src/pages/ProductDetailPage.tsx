import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Heart,
    Star,
} from 'lucide-react';
import '../styles/marketplace.css';
import type { Product, ProductReview } from '../types';
import { ProductCard } from './MarketplacePage';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

function formatPrice(n: number | string, currency = 'VND'): string {
    const num = Number(n);
    if (currency === 'VND') return num.toLocaleString('vi-VN') + 'đ';
    return num.toLocaleString('en-US', { style: 'currency', currency });
}

function truncateMetaDescription(text: string, maxLen: number): string {
    const trimmed = text.trim();
    if (trimmed.length <= maxLen) return trimmed;
    const slice = trimmed.slice(0, maxLen);
    const lastSpace = slice.lastIndexOf(' ');
    const head = lastSpace > 40 ? slice.slice(0, lastSpace) : slice;
    return `${head.trimEnd()}…`;
}

function humanizeToken(value: string) {
    return value.replace(/_/g, ' ').trim();
}

function titleizeToken(value: string) {
    return humanizeToken(value).replace(/\b\w/g, (char) => char.toUpperCase());
}

function StarRating({ rating }: { rating: number }) {
    const rounded = Math.round(rating);
    return (
        <div className="mpd-stars" role="img" aria-label={`Đánh giá ${rating}/5`}>
            {[1, 2, 3, 4, 5].map((index) => (
                <Star
                    key={index}
                    className={`h-4 w-4 shrink-0 ${index <= rounded ? 'fill-amber-400 text-amber-500' : 'text-[color:var(--cur-outline-var)]'}`}
                    strokeWidth={1.5}
                    aria-hidden
                />
            ))}
        </div>
    );
}

const REGION_ATTR_HINTS = ['khu vực', 'ship từ', 'tỉnh thành', 'địa điểm', 'phạm vi', 'giao hàng'];

function normalizeKey(value: string) {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
}

function pickSalesRegionFromAttributes(attrs: Record<string, unknown> | null | undefined): string | null {
    if (!attrs) return null;
    for (const [key, value] of Object.entries(attrs)) {
        const normalizedKey = normalizeKey(key);
        if (REGION_ATTR_HINTS.some((hint) => normalizedKey.includes(normalizeKey(hint)))) {
            return String(value);
        }
    }
    for (const [key, value] of Object.entries(attrs)) {
        if (/khu|vực|ship|tỉnh|thành|giao|phạm/i.test(key)) {
            return String(value);
        }
    }
    return null;
}

function salesAreaFallbackCopy(product: Product): string {
    switch (product.product_type) {
        case 'digital':
            return 'Sản phẩm số được giao trực tuyến sau thanh toán và không cần vận chuyển vật lý.';
        case 'service':
            return 'Dịch vụ được triển khai theo lịch hẹn với người bán; cần xác nhận trước khu vực và hình thức làm việc.';
        default:
            return 'Hàng vật lý được giao theo chính sách của người bán, thường là toàn quốc trừ khi có ghi chú riêng.';
    }
}

function buildOverviewFacts(product: Product, variants: Product['variants'] = []) {
    const facts: Array<{ label: string; value: string }> = [];
    const trainingPackage = product.training_package;

    if (trainingPackage) {
        facts.push(
            { label: 'Mục tiêu', value: titleizeToken(trainingPackage.goal) },
            { label: 'Thời lượng', value: `${trainingPackage.duration_weeks} tuần` },
            { label: 'Tần suất', value: `${trainingPackage.sessions_per_week} buổi / tuần` },
            { label: 'Cấp độ', value: trainingPackage.level === 'all' ? 'Mọi level' : titleizeToken(trainingPackage.level) }
        );

        if (trainingPackage.includes_nutrition) {
            facts.push({ label: 'Kèm theo', value: 'Hướng dẫn dinh dưỡng' });
        }
        if (trainingPackage.includes_video) {
            facts.push({ label: 'Định dạng', value: 'Có video hướng dẫn' });
        }
        if (trainingPackage.equipment_required?.length) {
            facts.push({ label: 'Thiết bị', value: trainingPackage.equipment_required.join(', ') });
        }

        return facts;
    }

    if (product.product_type === 'physical') {
        if (product.stock_quantity != null) {
            facts.push({ label: 'Tồn kho', value: `Còn ${product.stock_quantity} sản phẩm` });
        }
        if (variants.length > 0) {
            facts.push({ label: 'Lựa chọn', value: `${variants.length} biến thể đang mở bán` });
        }
        facts.push({ label: 'Giao nhận', value: pickSalesRegionFromAttributes(product.attributes ?? null) ?? 'Giao hàng toàn quốc' });
        return facts;
    }

    if (product.product_type === 'service') {
        if (product.attributes?.['Format']) {
            facts.push({ label: 'Hình thức', value: String(product.attributes['Format']) });
        }
        if (product.attributes?.['Phù hợp']) {
            facts.push({ label: 'Phù hợp', value: String(product.attributes['Phù hợp']) });
        }
        if (variants.length > 0) {
            facts.push({ label: 'Gói dịch vụ', value: `${variants.length} lựa chọn` });
        }
        facts.push({ label: 'Lịch hẹn', value: 'Cần đặt lịch trước khi triển khai' });
        return facts;
    }

    facts.push(
        { label: 'Nhận hàng', value: 'Trực tuyến sau thanh toán' },
        { label: 'Quyền truy cập', value: 'Sử dụng lâu dài trên tài khoản' }
    );
    if (product.preview_content) {
        facts.push({ label: 'Preview', value: 'Có nội dung xem trước' });
    }
    return facts;
}

function buildFulfillmentPanel(product: Product, variants: Product['variants'] = []) {
    const region = pickSalesRegionFromAttributes(product.attributes ?? null) ?? salesAreaFallbackCopy(product);
    const trainingPackage = product.training_package;

    if (trainingPackage) {
        return {
            title: 'Cách nhận chương trình',
            description: 'Nhận lộ trình online ngay sau thanh toán.',
            points: [
                `${trainingPackage.duration_weeks} tuần nội dung`,
                trainingPackage.includes_video ? 'Có video hướng dẫn' : 'Nội dung gọn, dễ theo dõi',
                trainingPackage.includes_nutrition ? 'Kèm định hướng dinh dưỡng' : 'Không kèm meal plan riêng',
            ],
            note: 'Training package không cần bản đồ giao hàng.',
            showMap: false,
        };
    }

    if (product.product_type === 'digital') {
        return {
            title: 'Giao nhận & truy cập',
            description: 'Nhận trực tiếp trên nền tảng, không cần ship.',
            points: [
                product.digital_file_url ? 'Tải tệp sau thanh toán' : 'Nhận tài nguyên số sau thanh toán',
                'Không cần xác nhận địa chỉ',
                product.preview_content ? 'Có nội dung xem trước' : 'Mở toàn bộ sau thanh toán',
            ],
            note: 'Bản đồ không cần thiết với sản phẩm số.',
            showMap: false,
        };
    }

    if (product.product_type === 'service') {
        return {
            title: 'Phạm vi phục vụ',
            description: region,
            points: [
                variants.length > 0 ? `${variants.length} gói đang mở` : 'Gói dịch vụ cấu hình theo nhu cầu',
                'Xác nhận lịch với người bán',
                'Chốt rõ khu vực hoặc hình thức trước khi thanh toán',
            ],
            note: 'Service ưu tiên mô tả text-first thay vì bản đồ chung.',
            showMap: false,
        };
    }

    return {
        title: 'Phạm vi giao hàng',
        description: region,
        points: [
            'Nên kiểm tra khu vực giao thực tế',
            product.track_inventory ? 'Tồn kho được theo dõi trên hệ thống' : 'Nên xác nhận tồn kho trước khi chốt',
            variants.length > 0 ? `${variants.length} biến thể có thể ảnh hưởng thời gian giao` : 'Một SKU chính, dễ chốt nhanh',
        ],
        note: 'Bản đồ chỉ mang tính tham chiếu phạm vi giao hàng.',
        showMap: true,
    };
}

function buildBuyLead(product: Product) {
    if (product.training_package) {
        return 'Nhận lộ trình online và xem trước cấu trúc chương trình.';
    }
    if (product.product_type === 'digital') {
        return 'Nhận nội dung trực tiếp trên nền tảng, không cần ship.';
    }
    if (product.product_type === 'service') {
        return 'Phù hợp khi bạn cần chốt nhanh hình thức làm việc và lịch hẹn.';
    }
    return 'Xem tồn kho và phạm vi giao trước khi thêm vào giỏ.';
}

const VN_OSM_EMBED =
    'https://www.openstreetmap.org/export/embed.html?bbox=102.14%2C8.18%2C109.46%2C23.39&layer=mapnik';

function ProductFulfillmentPanel({
    product,
    variants,
    id,
}: {
    product: Product;
    variants: Product['variants'];
    id?: string;
}) {
    const panel = buildFulfillmentPanel(product, variants);
    const titleId = id ?? 'mpd-fulfillment-heading';

    return (
        <aside className={`mpd-fulfillment-panel ${panel.showMap ? 'mpd-fulfillment-panel--map' : 'mpd-fulfillment-panel--plain'}`} aria-labelledby={titleId}>
            <h3 className="mpd-fulfillment-panel-title" id={titleId}>
                {panel.title}
            </h3>
            <p className="mpd-fulfillment-panel-desc">{panel.description}</p>
            {panel.points.length > 0 && (
                <ul className="mpd-fulfillment-points">
                    {panel.points.map((point) => (
                        <li key={point}>{point}</li>
                    ))}
                </ul>
            )}
            <p className="mpd-fulfillment-panel-note">{panel.note}</p>
            {panel.showMap && (
                <>
                    <div className="mpd-sales-map-frame-wrap">
                        <iframe
                            title="Bản đồ tham chiếu khu vực Việt Nam"
                            src={VN_OSM_EMBED}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                    <a
                        className="mpd-sales-map-link"
                        href="https://www.openstreetmap.org/#map=6/16.06/107.83"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Mở bản đồ đầy đủ
                    </a>
                </>
            )}
        </aside>
    );
}

function ProductDetailSkeleton() {
    return (
        <div className="mpd-skeleton-page" aria-busy="true" aria-label="Đang tải trang sản phẩm">
            <div className="mpd-skeleton-breadcrumb">
                <div className="mpd-skeleton-bar" />
                <div className="mpd-skeleton-bar" />
                <div className="mpd-skeleton-bar" />
            </div>
            <div className="mpd-skeleton-layout">
                <div className="mpd-skeleton-gallery-main" />
                <div className="mpd-skeleton-info">
                    <div className="mpd-skeleton-bar" />
                    <div className="mpd-skeleton-bar" />
                    <div className="mpd-skeleton-bar" />
                    <div className="mpd-skeleton-bar" />
                    <div className="mpd-skeleton-bar" />
                </div>
            </div>
        </div>
    );
}

export default function ProductDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    /* eslint-disable react-hooks/set-state-in-effect -- fetch lifecycle resets local state before async response */
    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setNotFound(false);
        setLoadError(false);
        setProduct(null);
        setSelectedVariantId(null);
        axios
            .get(`${API}/marketplace/products/${slug}`)
            .then((response) => {
                setProduct(response.data.product);
                setActiveImage(response.data.product.thumbnail_url ?? null);
            })
            .catch((error) => {
                if (error.response?.status === 404) {
                    setNotFound(true);
                } else {
                    setLoadError(true);
                }
            })
            .finally(() => setLoading(false));
    }, [slug, reloadKey]);

    useEffect(() => {
        setReviews([]);
        setRelatedProducts([]);
        if (!product) return;

        axios
            .get(`${API}/marketplace/products/${product.id}/reviews`)
            .then((response) => setReviews(response.data.reviews ?? []))
            .catch(() => {});

        if (!product.category) return;

        axios
            .get(`${API}/marketplace/products`, {
                params: { category: product.category.slug, limit: '12' },
            })
            .then((response) => {
                setRelatedProducts(
                    (response.data.products ?? []).filter((item: Product) => item.id !== product.id).slice(0, 6)
                );
            })
            .catch(() => {});
    }, [product]);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (!slug) {
        return (
            <>
                <Helmet>
                    <title>Không tìm thấy | GYMERVIET Marketplace</title>
                </Helmet>
                <div className="mpd-page mpd-not-found">
                    <div className="mpd-not-found-icon">
                        <AlertCircle className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                    </div>
                    <h2>Liên kết không hợp lệ</h2>
                    <p>Không có mã sản phẩm trong đường dẫn.</p>
                    <div className="mpd-not-found-actions">
                        <Link to="/marketplace" className="marketplace-btn-ghost">
                            Về cửa hàng
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    if (loading) {
        return (
            <>
                <Helmet>
                    <title>Đang tải… | GYMERVIET Marketplace</title>
                </Helmet>
                <ProductDetailSkeleton />
            </>
        );
    }

    if (loadError && !notFound) {
        return (
            <>
                <Helmet>
                    <title>Không tải được sản phẩm | GYMERVIET Marketplace</title>
                </Helmet>
                <div className="mpd-page mpd-fetch-error">
                    <div className="mpd-fetch-error-icon">
                        <AlertCircle className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                    </div>
                    <h2>Không tải được thông tin sản phẩm</h2>
                    <p>Kiểm tra kết nối mạng hoặc thử lại sau.</p>
                    <div className="mpd-fetch-error-actions">
                        <button type="button" className="marketplace-btn-ghost" onClick={() => setReloadKey((value) => value + 1)}>
                            Thử lại
                        </button>
                        <Link to="/marketplace" className="marketplace-btn-ghost">
                            Về cửa hàng
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    if (notFound || !product) {
        return (
            <>
                <Helmet>
                    <title>Không tìm thấy sản phẩm | GYMERVIET Marketplace</title>
                </Helmet>
                <div className="mpd-page mpd-not-found">
                    <div className="mpd-not-found-icon">
                        <AlertCircle className="h-8 w-8" strokeWidth={1.75} aria-hidden />
                    </div>
                    <h2>Sản phẩm không tồn tại</h2>
                    <p>Sản phẩm đã gỡ hoặc đường dẫn không đúng.</p>
                    <div className="mpd-not-found-actions">
                        <Link to="/marketplace" className="marketplace-btn-ghost">
                            Về cửa hàng
                        </Link>
                        <Link to="/marketplace?sort=newest" className="marketplace-btn-ghost">
                            Xem hàng mới
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    const activeVariants = (product.variants ?? []).filter((variant) => variant.is_active);
    const selectedVariant = activeVariants.find((variant) => variant.id === selectedVariantId);
    const displayPrice = selectedVariant?.price ?? product.price;
    const comparePrice = selectedVariant?.compare_at_price ?? product.compare_at_price ?? null;
    const hasDiscount = comparePrice != null && comparePrice > displayPrice;
    const discountPct = hasDiscount ? Math.round(((comparePrice - displayPrice) / comparePrice) * 100) : 0;
    const allImages = [
        ...(product.thumbnail_url ? [product.thumbnail_url] : []),
        ...(product.gallery ?? []),
    ].filter((url, index, arr) => arr.indexOf(url) === index);
    const trainingPackage = product.training_package ?? null;
    const hasSpecs = Boolean(product.attributes && Object.keys(product.attributes).length > 0);
    const overviewFacts = buildOverviewFacts(product, activeVariants);
    const previewWeeks = trainingPackage?.program_structure
        ? Object.entries(trainingPackage.program_structure).slice(0, trainingPackage.preview_weeks)
        : [];
    const sectionItems = [
        { id: 'overview', label: 'Tổng quan' },
        ...(previewWeeks.length > 0 ? [{ id: 'preview', label: 'Lịch tập' }] : []),
        { id: hasSpecs ? 'specs' : 'delivery', label: hasSpecs ? 'Thông số' : 'Giao nhận' },
        { id: 'reviews', label: 'Đánh giá' },
        ...(relatedProducts.length > 0 ? [{ id: 'related', label: 'Liên quan' }] : []),
    ];
    const showSectionNav = sectionItems.length >= 3;
    const buyLead = buildBuyLead(product);

    return (
        <>
            <Helmet>
                <title>{product.title} | GYMERVIET Marketplace</title>
                <meta
                    name="description"
                    content={
                        product.description?.trim()
                            ? truncateMetaDescription(product.description, 155)
                            : `Mua ${product.title} tại GYMERVIET Marketplace`
                    }
                />
            </Helmet>

            <div className="mpd-page">
                <nav aria-label="Đường dẫn">
                    <ol className="mpd-breadcrumb">
                        <li>
                            <Link to="/marketplace">Cửa hàng</Link>
                        </li>
                        {product.category && (
                            <li>
                                <ChevronRight className="mpd-breadcrumb-sep" aria-hidden />
                                <Link to={`/marketplace?category=${product.category.slug}`}>
                                    {product.category.icon_emoji} {product.category.label}
                                </Link>
                            </li>
                        )}
                        <li>
                            <ChevronRight className="mpd-breadcrumb-sep" aria-hidden />
                            <span className="mpd-breadcrumb-current">{product.title}</span>
                        </li>
                    </ol>
                </nav>

                <div className="mpd-layout">
                    <div className="mpd-gallery">
                        <div className="mpd-gallery-main">
                            {activeImage ? (
                                <img src={activeImage} alt={product.title} className="mpd-gallery-main-img" />
                            ) : (
                                <div className="mpd-gallery-placeholder">
                                    <span aria-hidden="true">{product.category?.icon_emoji ?? '📦'}</span>
                                </div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="mpd-gallery-thumbs">
                                {allImages.map((url, index) => (
                                    <button
                                        key={index}
                                        className={`mpd-gallery-thumb ${activeImage === url ? 'mpd-gallery-thumb--active' : ''}`}
                                        onClick={() => setActiveImage(url)}
                                        aria-label={`Xem ảnh ${index + 1}`}
                                        type="button"
                                    >
                                        <img src={url} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="mpd-info">
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
                                                    <Star
                                                        className="h-3.5 w-3.5 fill-amber-400 text-amber-500"
                                                        strokeWidth={1.5}
                                                        aria-hidden
                                                    />
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
                                    <span className="mpd-metric">Tải ngay sau thanh toán</span>
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

                            <p className="sr-only">Thanh toán và giỏ hàng đang được hoàn thiện.</p>
                            <div className="mpd-cta-row">
                                <button
                                    className="mpd-btn-primary"
                                    type="button"
                                    disabled
                                    title="Tính năng thanh toán đang hoàn thiện"
                                >
                                    {product.product_type === 'digital' ? 'Mua ngay' : 'Thêm vào giỏ'}
                                </button>
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

                            <ul className="mpd-trust">
                                {product.training_package && <li>Xem trước cấu trúc tuần tập ngay trên trang</li>}
                                {!product.training_package && product.product_type === 'digital' && <li>Tải ngay sau khi thanh toán</li>}
                                {product.product_type === 'physical' && <li>Giao hàng toàn quốc</li>}
                                <li>Thanh toán an toàn</li>
                                <li>Hỗ trợ 24/7</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {showSectionNav && (
                    <nav className="mpd-section-nav" aria-label="Điều hướng nội dung sản phẩm">
                        {sectionItems.map((item) => (
                            <a key={item.id} href={`#${item.id}`} className="mpd-section-nav-link">
                                {item.label}
                            </a>
                        ))}
                    </nav>
                )}

                <div className="mpd-stacked-sections">
                    <section className="mpd-section" id="overview">
                        <div className="mpd-section-head">
                            <h2 className="mpd-section-title">Tổng quan</h2>
                            <p className="mpd-section-copy">
                                Mô tả chính và các dữ kiện cốt lõi được gom về cùng một nhịp đọc.
                            </p>
                        </div>
                        <div className="mpd-overview-layout">
                            <div className="mpd-overview-copy">
                                {product.description ? (
                                    <p className="mpd-description-body">{product.description}</p>
                                ) : (
                                    <p className="mpd-empty-text">Chưa có mô tả chi tiết.</p>
                                )}
                            </div>
                            {overviewFacts.length > 0 && (
                                <dl className="mpd-overview-facts">
                                    {overviewFacts.map((fact) => (
                                        <div key={`${fact.label}-${fact.value}`} className="mpd-overview-fact">
                                            <dt>{fact.label}</dt>
                                            <dd>{fact.value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            )}
                        </div>
                    </section>

                    {previewWeeks.length > 0 && (
                        <section className="mpd-section" id="preview">
                            <div className="mpd-section-head">
                                <h2 className="mpd-section-title">Xem trước chương trình</h2>
                                <p className="mpd-section-copy">
                                    Chỉ mở phần đủ để hiểu cấu trúc tuần tập.
                                </p>
                            </div>
                            <div className="mpd-program-accordion">
                                {previewWeeks.map(([week, days], index) => (
                                    <details key={week} className="mpd-program-panel" open={index === 0}>
                                        <summary className="mpd-program-summary">
                                            <span className="mpd-program-summary-copy">
                                                <strong>{titleizeToken(week)}</strong>
                                                <small>{Object.keys(days).length} buổi</small>
                                            </span>
                                            <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
                                        </summary>
                                        <div className="mpd-program-panel-body">
                                            {Object.entries(days).map(([day, plan]) => (
                                                <div key={day} className="mpd-program-day">
                                                    <div className="mpd-program-day-head">
                                                        <strong>{plan.title}</strong>
                                                        <span>{titleizeToken(day)}</span>
                                                    </div>
                                                    {plan.exercises.length > 0 && (
                                                        <div className="mpd-table-scroll">
                                                            <table className="mpd-exercise-table">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Bài tập</th>
                                                                        <th>Sets</th>
                                                                        <th>Reps</th>
                                                                        <th>Nghỉ</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {plan.exercises.map((exercise, exerciseIndex) => (
                                                                        <tr key={exerciseIndex}>
                                                                            <td>{exercise.name}</td>
                                                                            <td>{exercise.sets}</td>
                                                                            <td>{exercise.reps}</td>
                                                                            <td>{exercise.rest_seconds ? `${exercise.rest_seconds}s` : '—'}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </section>
                    )}

                    {hasSpecs ? (
                        <section className="mpd-section" id="specs">
                            <div className="mpd-section-head">
                                <h2 className="mpd-section-title">Thông số & giao nhận</h2>
                                <p className="mpd-section-copy">
                                    Thông số và giao nhận được đặt trong cùng một vùng đọc.
                                </p>
                            </div>
                            <div className="mpd-specs-layout">
                                <div className="mpd-specs-col mpd-table-scroll">
                                    <table className="mpd-specs-table">
                                        <tbody>
                                            {Object.entries(product.attributes!).map(([key, value]) => (
                                                <tr key={key}>
                                                    <td className="mpd-specs-key">{key.replace(/_/g, ' ')}</td>
                                                    <td>{String(value)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <ProductFulfillmentPanel product={product} variants={activeVariants} id="mpd-fulfillment-heading-specs" />
                            </div>
                        </section>
                    ) : (
                        <section className="mpd-section" id="delivery">
                            <div className="mpd-section-head">
                                <h2 className="mpd-section-title">Giao nhận & phạm vi phục vụ</h2>
                                <p className="mpd-section-copy">
                                    Chỉ giữ phần thật sự ảnh hưởng tới quyết định mua.
                                </p>
                            </div>
                            <ProductFulfillmentPanel product={product} variants={activeVariants} id="mpd-fulfillment-heading-standalone" />
                        </section>
                    )}

                    <section className="mpd-section" id="reviews">
                        <div className="mpd-section-head">
                            <h2 className="mpd-section-title">
                                Đánh giá từ khách hàng {product.review_count > 0 && `(${product.review_count})`}
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

                    {relatedProducts.length > 0 && (
                        <section className="mpd-section mpd-section--related" id="related">
                            <div className="mpd-section-head">
                                <h2 className="mpd-section-title">Sản phẩm liên quan</h2>
                                <p className="mpd-section-copy">
                                    Gợi ý tương tự được chuyển xuống cuối trang để không chen ngang phần đọc chính.
                                </p>
                            </div>
                            <div className="mpd-related-grid">
                                {relatedProducts.map((item) => (
                                    <ProductCard key={item.id} product={item} variant="rail" />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </>
    );
}
