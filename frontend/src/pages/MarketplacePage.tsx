import { formatPrice } from "../utils/format";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, Search, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import '../styles/marketplace.css';
import { useMobileReducedEffects } from '../hooks/useMobileReducedEffects';
import { trackEvent } from '../lib/analytics';
import type {
    Product,
    ProductCategory,
    MarketplaceFeaturedResponse,
    MarketplaceListResponse,
    MarketplaceCategoriesResponse,
} from '../types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

function uniqueProductsById(items: Product[]) {
    const seen = new Set<string>();
    return items.filter((item) => {
        if (!item?.id || seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
}

export const ProductCard = React.memo(function ProductCard({
    product,
    variant = 'listing',
    priorityThumb = false,
}: {
    product: Product;
    variant?: 'spotlight' | 'listing' | 'rail';
    priorityThumb?: boolean;
}) {
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discountPct = hasDiscount
        ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
        : 0;
    const isRail = variant === 'rail';
    const isSpotlight = variant === 'spotlight';

    return (
        <Link
            to={`/marketplace/product/${product.slug}`}
            onClick={() => trackEvent('card_click', {
                route: 'marketplace',
                entity_id: product.id,
                target: `/marketplace/product/${product.slug}`,
                card_variant: variant,
            })}
            className={`marketplace-product-card marketplace-card--${variant}`}
            aria-label={product.title}
        >
            <div className="marketplace-card-thumb">
                {product.thumbnail_url ? (
                    <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        loading={priorityThumb ? 'eager' : 'lazy'}
                        fetchPriority={priorityThumb ? 'high' : undefined}
                        decoding="async"
                    />
                ) : (
                    <div className="marketplace-card-thumb-placeholder">
                        <span aria-hidden="true">{product.category?.icon_emoji ?? '📦'}</span>
                    </div>
                )}
                {product.product_type === 'digital' && !isRail && (
                    <span className="marketplace-badge marketplace-badge--digital">Digital</span>
                )}
                {discountPct > 0 && (
                    <span className="marketplace-badge marketplace-badge--discount">-{discountPct}%</span>
                )}
            </div>

            <div className="marketplace-card-body">
                {!isRail && (
                    <span className="marketplace-card-category">
                        {product.category?.icon_emoji} {product.category?.label}
                    </span>
                )}

                <h3 className="marketplace-card-title">{product.title}</h3>

                {!isRail && product.seller && (
                    <div className="marketplace-card-meta">
                        <div className="marketplace-card-seller">
                            {product.seller.avatar_url ? (
                                <img
                                    src={product.seller.avatar_url}
                                    alt={product.seller.full_name}
                                    className="marketplace-card-seller-avatar"
                                    loading="lazy"
                                    decoding="async"
                                />
                            ) : (
                                <div className="marketplace-card-seller-initials">
                                    {product.seller.full_name.charAt(0)}
                                </div>
                            )}
                            <span>{product.seller.full_name}</span>
                        </div>
                        {isSpotlight && product.review_count > 0 ? (
                            <div className="marketplace-card-rating">
                                <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" aria-hidden strokeWidth={1.5} />
                                <span>{product.avg_rating != null ? Number(product.avg_rating).toFixed(1) : '—'}</span>
                            </div>
                        ) : null}
                    </div>
                )}

                <div className="marketplace-card-footer">
                    <div className="marketplace-card-price">
                        <span className="marketplace-card-price-main">{formatPrice(product.price, product.currency)}</span>
                        {hasDiscount && (
                            <s className="marketplace-card-price-orig">{formatPrice(product.compare_at_price!, product.currency)}</s>
                        )}
                    </div>
                    {!isRail && !isSpotlight && (
                        <div className="marketplace-card-rating-slot">
                            {product.review_count > 0 ? (
                                <div className="marketplace-card-rating">
                                    <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-500" aria-hidden strokeWidth={1.5} />
                                    <span>{product.avg_rating != null ? Number(product.avg_rating).toFixed(1) : '—'}</span>
                                    <span className="marketplace-card-review-count">({product.review_count})</span>
                                </div>
                            ) : (
                                <span className="marketplace-card-rating-placeholder">Chưa có đánh giá</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
});
ProductCard.displayName = 'ProductCard';

function MarketplaceProductSkeleton() {
    return (
        <div className="marketplace-product-skeleton">
            <div className="marketplace-product-skeleton-thumb" />
            <div className="marketplace-product-skeleton-body">
                <div className="marketplace-product-skeleton-line marketplace-product-skeleton-line--short" />
                <div className="marketplace-product-skeleton-line" />
                <div className="marketplace-product-skeleton-line marketplace-product-skeleton-line--price" />
            </div>
        </div>
    );
}

const CategoryPill = React.memo(function CategoryPill({
    category,
    active,
    onClick,
}: {
    category: ProductCategory | { slug: string; label: string; icon_emoji: string | null };
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            className={`marketplace-cat-pill gv-pill-btn text-xs ${active ? 'gv-pill-btn--active' : 'gv-pill-btn--soft'}`}
            onClick={onClick}
            type="button"
        >
            {category.icon_emoji && <span>{category.icon_emoji}</span>}
            {category.label}
        </button>
    );
});
CategoryPill.displayName = 'CategoryPill';

export default function MarketplacePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [featured, setFeatured] = useState<Product[]>([]);
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [listError, setListError] = useState(false);
    const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');
    const filterRef = useRef<HTMLElement>(null);
    const merchRailRef = useRef<HTMLDivElement>(null);
    const railRafRef = useRef<number | null>(null);
    const [railCanPrev, setRailCanPrev] = useState(false);
    const [railCanNext, setRailCanNext] = useState(false);
    const reducedEffects = useMobileReducedEffects();

    const updateRailScrollState = useCallback(() => {
        const el = merchRailRef.current;
        if (!el) return;
        if (railRafRef.current !== null) return;
        railRafRef.current = requestAnimationFrame(() => {
            railRafRef.current = null;
            const { scrollLeft, scrollWidth, clientWidth } = el;
            const max = scrollWidth - clientWidth;
            setRailCanPrev(scrollLeft > 2);
            setRailCanNext(max > 2 && scrollLeft < max - 2);
        });
    }, []);

    const scrollMerchRail = useCallback(
        (direction: -1 | 1) => {
            const el = merchRailRef.current;
            if (!el) return;
            const step = Math.max(220, Math.round(el.clientWidth * 0.82));
            el.scrollBy({ left: direction * step, behavior: 'smooth' });
            window.setTimeout(updateRailScrollState, 320);
        },
        [updateRailScrollState]
    );

    const activeCategory = searchParams.get('category') ?? '';
    const activeSearch = searchParams.get('q') ?? '';
    const activeSort = searchParams.get('sort') ?? 'popular';
    const showHero = !activeCategory && !activeSearch;

    const qParam = searchParams.get('q') ?? '';
    useEffect(() => {
        setSearchInput(qParam);
    }, [qParam]);

    useEffect(() => {
        let alive = true;

        Promise.allSettled([
            axios.get<MarketplaceCategoriesResponse>(`${API}/marketplace/categories`),
            axios.get<MarketplaceFeaturedResponse>(`${API}/marketplace/featured`),
        ]).then(([categoriesResult, featuredResult]) => {
            if (!alive) return;
            if (categoriesResult.status === 'fulfilled') {
                setCategories(categoriesResult.value.data.categories);
            }
            if (featuredResult.status === 'fulfilled') {
                setFeatured(featuredResult.value.data.featured ?? []);
                setNewArrivals(featuredResult.value.data.new_arrivals ?? []);
            }
        });

        return () => {
            alive = false;
        };
    }, []);

    const pageLimit = reducedEffects ? 8 : 12;

    const loadProducts = useCallback(async (pg = 1) => {
        setLoading(true);
        setListError(false);
        try {
            const params: Record<string, string> = {
                page: String(pg),
                limit: String(pageLimit),
                sort: activeSort,
            };
            if (activeCategory) params['category'] = activeCategory;
            if (activeSearch) params['search'] = activeSearch;

            const response = await axios.get<MarketplaceListResponse>(`${API}/marketplace/products`, { params });
            if (pg === 1) {
                setProducts(response.data.products);
            } else {
                setProducts((prev) => [...prev, ...response.data.products]);
            }
            setTotal(response.data.total);
            setPage(pg);
        } catch {
            setListError(true);
            if (pg === 1) {
                setProducts([]);
                setTotal(0);
            }
        } finally {
            setLoading(false);
        }
    }, [activeCategory, activeSearch, activeSort, pageLimit]);

    useEffect(() => {
        loadProducts(1);
    }, [loadProducts]);

    function setFilter(key: string, value: string) {
        if (key !== 'page') {
            trackEvent(key === 'q' ? 'browse_search_use' : 'browse_filter_use', {
                route: 'marketplace',
                action: key,
                value: value || 'all',
            });
        }
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        next.delete('page');
        setSearchParams(next);
    }

    function handleSearch(event: React.FormEvent) {
        event.preventDefault();
        setFilter('q', searchInput.trim());
        filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const featuredItems = useMemo(
        () => uniqueProductsById(featured).slice(0, reducedEffects ? 2 : 4),
        [featured, reducedEffects]
    );

    const newArrivalsItems = useMemo(
        () => uniqueProductsById(newArrivals).slice(0, reducedEffects ? 4 : 8),
        [newArrivals, reducedEffects]
    );

    const curatedPicks = useMemo(
        () =>
            products
                .filter((product) =>
                    (product.featured_weight ?? 0) > 80 &&
                    !featuredItems.some((item) => item.id === product.id) &&
                    !newArrivalsItems.some((item) => item.id === product.id)
                )
                .slice(0, reducedEffects ? 2 : 4),
        [products, featuredItems, newArrivalsItems, reducedEffects]
    );

    const spotlightProduct = useMemo(
        () => featuredItems[0] ?? newArrivalsItems[0] ?? curatedPicks[0] ?? products[0] ?? null,
        [featuredItems, newArrivalsItems, curatedPicks, products]
    );

    const merchShelfItems = useMemo(
        () =>
            uniqueProductsById([
                ...featuredItems.slice(1),
                ...newArrivalsItems,
                ...curatedPicks,
            ])
                .filter((product) => product.id !== spotlightProduct?.id)
                .slice(0, reducedEffects ? 4 : 6),
        [featuredItems, newArrivalsItems, curatedPicks, spotlightProduct, reducedEffects]
    );

    const activeCategoryLabel = activeCategory
        ? categories.find((category) => category.slug === activeCategory)?.label ?? 'Sản phẩm'
        : '';

    const pageKicker = showHero ? 'Browse marketplace' : activeCategory ? 'Lọc theo danh mục' : 'Lọc theo từ khóa';
    const pageTitle = showHero
        ? 'Sản phẩm cho hành trình fitness'
        : activeCategory
            ? activeCategoryLabel
            : `Kết quả cho "${activeSearch}"`;
    const pageDescription = showHero
        ? 'Gói tập, gear và supplements được gom để bạn duyệt nhanh.'
        : 'Danh sách theo bộ lọc.';

    useEffect(() => {
        const el = merchRailRef.current;
        if (!el || !showHero || merchShelfItems.length === 0) return;

        updateRailScrollState();
        el.addEventListener('scroll', updateRailScrollState, { passive: true });
        const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateRailScrollState) : null;
        resizeObserver?.observe(el);

        return () => {
            el.removeEventListener('scroll', updateRailScrollState);
            resizeObserver?.disconnect();
            if (railRafRef.current !== null) {
                cancelAnimationFrame(railRafRef.current);
                railRafRef.current = null;
            }
        };
    }, [showHero, merchShelfItems.length, updateRailScrollState]);

    return (
        <>
            <Helmet>
                <title>Marketplace | GYMERVIET</title>
                <meta name="description" content="Duyệt sản phẩm fitness từ coach, gym và seller uy tín." />
            </Helmet>

            <div className="marketplace-page">
                <div className="marketplace-container gv-pad-y">
                    <header className={`marketplace-browse-hero ${showHero ? '' : 'marketplace-browse-hero--filtered'}`}>
                        <div className={`marketplace-browse-hero-grid ${showHero && spotlightProduct ? '' : 'marketplace-browse-hero-grid--single'}`}>
                            <section className={`marketplace-editorial-intro ${showHero ? '' : 'marketplace-editorial-intro--filtered'}`}>
                                <div className="marketplace-editorial-copy">
                                    <span className="marketplace-eyebrow">{pageKicker}</span>
                                    <h1 className="marketplace-editorial-title">{pageTitle}</h1>
                                    <p className="marketplace-editorial-sub">{pageDescription}</p>
                                </div>
                                <form
                                    className={`marketplace-editorial-search ${showHero ? '' : 'marketplace-editorial-search--filtered'}`}
                                    onSubmit={handleSearch}
                                >
                                    <input
                                        type="search"
                                        placeholder="Tìm sản phẩm..."
                                        value={searchInput}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                        className="marketplace-editorial-search-input gv-search-control"
                                        aria-label="Tìm sản phẩm"
                                    />
                                    <button type="submit" className="marketplace-editorial-search-btn">
                                        <Search className="h-4 w-4 shrink-0" aria-hidden />
                                        Tìm kiếm
                                    </button>
                                </form>
                                {showHero && (
                                    <div className="marketplace-quick-faq" aria-label="Hỏi nhanh">
                                        <p className="marketplace-section-kicker">Hỏi nhanh marketplace</p>
                                        <p className="marketplace-quick-faq-text">Ưu tiên gói có mục tiêu rõ</p>
                                    </div>
                                )}
                            </section>

                            {showHero && spotlightProduct && (
                                <aside className="marketplace-merch-spotlight" aria-label="Spotlight">
                                    <div className="marketplace-merch-spotlight-copy">
                                        <p className="marketplace-section-kicker">Spotlight tuần này</p>
                                        <h2 className="marketplace-section-title">Một lựa chọn nổi bật</h2>
                                        <p className="marketplace-lead">
                                            Mở nhanh rồi xem danh sách chính.
                                        </p>
                                    </div>
                                    <ProductCard
                                        product={spotlightProduct}
                                        variant="spotlight"
                                        priorityThumb={!reducedEffects}
                                    />
                                </aside>
                            )}
                        </div>
                    </header>

                    <section ref={filterRef} className="marketplace-controls-shell" aria-label="Bộ lọc marketplace">
                        <nav className="marketplace-cat-bar" aria-label="Danh mục">
                            <CategoryPill
                                category={{ slug: '', label: 'Tất cả', icon_emoji: '🏪' }}
                                active={!activeCategory}
                                onClick={() => setFilter('category', '')}
                            />
                            {categories.map((category) => (
                                <CategoryPill
                                    key={category.id}
                                    category={category}
                                    active={activeCategory === category.slug}
                                    onClick={() => setFilter('category', category.slug)}
                                />
                            ))}
                        </nav>

                        <div className={`marketplace-toolbar ${showHero ? '' : 'marketplace-toolbar--filtered'}`}>
                            <div className="marketplace-toolbar-main">
                                {showHero ? (
                                    <>
                                        <p className="marketplace-section-kicker">Duyệt nhanh</p>
                                        <span className="marketplace-toolbar-count">
                                            {loading && total === 0
                                                ? 'Đang tải…'
                                                : `${total.toLocaleString('vi-VN')} sản phẩm`}
                                        </span>
                                    </>
                                ) : (
                                    <div className="marketplace-filter-summary">
                                        <p className="marketplace-section-kicker">Bộ lọc</p>
                                        <p className="marketplace-filter-summary-value">
                                            {loading && total === 0
                                                ? 'Đang tải…'
                                                : `${total.toLocaleString('vi-VN')} sản phẩm • ${activeCategory ? activeCategoryLabel : activeSearch || 'Tất cả'}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="marketplace-sort">
                                <label htmlFor="marketplace-sort-select" className="sr-only">Sort</label>
                                <select
                                    id="marketplace-sort-select"
                                    value={activeSort}
                                    onChange={(event) => setFilter('sort', event.target.value)}
                                    className="form-input coaches-dir-control marketplace-sort-select min-w-[11rem] py-2 text-sm font-semibold"
                                >
                                    <option value="popular">Phổ biến nhất</option>
                                    <option value="newest">Mới nhất</option>
                                    <option value="price_asc">Giá thấp → cao</option>
                                    <option value="price_desc">Giá cao → thấp</option>
                                    <option value="rating">Đánh giá cao</option>
                                </select>
                            </div>
                        </div>

                    </section>

                    {showHero && merchShelfItems.length > 0 && (
                        <section className="marketplace-section marketplace-merch-shelf" aria-label="Gợi ý">
                            <div className="marketplace-section-head marketplace-section-head--split">
                                <div>
                                    <p className="marketplace-section-kicker">Gợi ý nhanh</p>
                                    <h2 className="marketplace-section-title">Một lane mở rộng lựa chọn</h2>
                                </div>
                                <Link to="/marketplace?sort=newest" className="marketplace-typo-cta">
                                    Xem hàng mới
                                </Link>
                            </div>
                            <div className="marketplace-rail-wrap marketplace-rail-wrap--compact">
                                <button
                                    type="button"
                                    className="marketplace-rail-nav marketplace-rail-nav--prev"
                                    onClick={() => scrollMerchRail(-1)}
                                    disabled={!railCanPrev}
                                    aria-label="Cuộn trái"
                                >
                                    <ChevronLeft className="h-5 w-5" aria-hidden />
                                </button>
                                <div ref={merchRailRef} className="marketplace-rail">
                                    {merchShelfItems.map((product) => (
                                        <ProductCard key={product.id} product={product} variant="rail" />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    className="marketplace-rail-nav marketplace-rail-nav--next"
                                    onClick={() => scrollMerchRail(1)}
                                    disabled={!railCanNext}
                                    aria-label="Cuộn phải"
                                >
                                    <ChevronRight className="h-5 w-5" aria-hidden />
                                </button>
                            </div>
                        </section>
                    )}

                    <section className="marketplace-section marketplace-listing-section">
                        <div className="marketplace-section-head marketplace-section-head--tight">
                            <p className="marketplace-section-kicker">{showHero ? 'Danh sách chính' : 'Kết quả hiện tại'}</p>
                            <h2 className="marketplace-section-title">
                                {showHero
                                    ? 'Sản phẩm đang mở bán'
                                    : activeCategory
                                        ? activeCategoryLabel
                                        : `Kết quả cho "${activeSearch}"`}
                            </h2>
                        </div>

                        {listError && !loading && products.length === 0 ? (
                            <div className="marketplace-load-error">
                                <div className="marketplace-load-error-icon" aria-hidden>
                                    <AlertCircle className="h-7 w-7" strokeWidth={2} />
                                </div>
                                <h3>Không tải được danh sách</h3>
                                <p>Kiểm tra mạng rồi thử lại sau ít phút.</p>
                                <button type="button" className="marketplace-btn-ghost" onClick={() => loadProducts(1)}>
                                    Thử lại
                                </button>
                            </div>
                        ) : loading && products.length === 0 && !listError ? (
                            <div className="marketplace-grid marketplace-grid--loading" aria-busy="true" aria-label="Đang tải sản phẩm">
                                {Array.from({ length: reducedEffects ? 6 : 8 }).map((_, index) => (
                                    <MarketplaceProductSkeleton key={index} />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="marketplace-empty">
                                <div className="marketplace-empty-icon-svg">
                                    <Search className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                                </div>
                                <h3>Không có sản phẩm</h3>
                                <p>
                                    Thử từ khóa ngắn hơn hoặc quay về &quot;Tất cả&quot;.
                                </p>
                                <div className="marketplace-empty-actions">
                                    {activeCategory ? (
                                        <button
                                            type="button"
                                            className="marketplace-btn-ghost"
                                            onClick={() => setFilter('category', '')}
                                        >
                                            Xóa danh mục
                                        </button>
                                    ) : null}
                                    {activeSearch ? (
                                        <button
                                            type="button"
                                            className="marketplace-btn-ghost"
                                            onClick={() => {
                                                setSearchInput('');
                                                setFilter('q', '');
                                            }}
                                        >
                                            Xóa từ khóa
                                        </button>
                                    ) : null}
                                    <button
                                        type="button"
                                        className="marketplace-btn-ghost"
                                        onClick={() => {
                                            setSearchInput('');
                                            setSearchParams({});
                                        }}
                                    >
                                        Xem tất cả sản phẩm
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="marketplace-grid">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} variant="listing" />
                                ))}
                            </div>
                        )}

                        {products.length < total && !loading && (
                            <div className="marketplace-load-more">
                                <button
                                    className="marketplace-btn-ghost"
                                    onClick={() => loadProducts(page + 1)}
                                >
                                    Xem thêm {total - products.length} sản phẩm
                                </button>
                            </div>
                        )}

                        {loading && products.length > 0 && (
                            <div className="marketplace-loading-more">Đang tải thêm sản phẩm…</div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
