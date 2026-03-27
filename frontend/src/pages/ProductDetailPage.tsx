import { truncateMetaDescription } from "../utils/seo";
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { AlertCircle, ChevronRight } from 'lucide-react';
import '../styles/marketplace.css';
import type { Product, ProductReview } from '../types';
import { ProductCard } from './MarketplacePage';
import type { RootState } from '../store/store';
import { trackEvent } from '../lib/analytics';
import { ProductBuyPanel } from '../components/product-detail/ProductBuyPanel';
import { ProductProgramPreview } from '../components/product-detail/ProductProgramPreview';
import { ProductReviews } from '../components/product-detail/ProductReviews';
import { buildOverviewFacts, pickSalesRegionFromAttributes, buildFulfillmentPanel, buildBuyLead } from '../utils/productDetailUtils';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

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
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
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

            <div className="mpd-page ui-detail-shell ui-detail-shell--marketplace">
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
                        <ProductBuyPanel
                            product={product}
                            activeVariants={activeVariants}
                            selectedVariantId={selectedVariantId}
                            setSelectedVariantId={setSelectedVariantId}
                            buyLead={buyLead}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>
                </div>

                {showSectionNav && (
                    <nav className="mpd-section-nav" aria-label="Điều hướng nội dung sản phẩm">
                        {sectionItems.map((item) => (
                            <a
                                key={item.id}
                                href={`#${item.id}`}
                                className="mpd-section-nav-link"
                                onClick={() => trackEvent('detail_cta_click', {
                                    page_id: 'product_detail',
                                    product_id: product.id,
                                    cta_id: `section_${item.id}`,
                                    target: `#${item.id}`,
                                })}
                            >
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

                    <ProductProgramPreview previewWeeks={previewWeeks} />

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

                    <ProductReviews reviews={reviews} reviewCount={product.review_count} />

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
