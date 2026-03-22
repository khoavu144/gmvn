import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, Search, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import '../styles/marketplace.css';
import type {
    Product,
    ProductCategory,
    MarketplaceFeaturedResponse,
    MarketplaceListResponse,
    MarketplaceCategoriesResponse,
} from '../types';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api/v1';

// ─── Helpers ──────────────────────────────────────────────────────────────

function formatPrice(n: number | string, currency = 'VND'): string {
    const num = Number(n);
    if (currency === 'VND') {
        return num.toLocaleString('vi-VN') + 'đ';
    }
    return num.toLocaleString('en-US', { style: 'currency', currency });
}

// ─── Product Card ─────────────────────────────────────────────────────────

export function ProductCard({
    product,
    variant = 'standard',
    priorityThumb = false,
}: {
    product: Product;
    variant?: 'featured' | 'standard' | 'compact';
    /** First hero row image only — improves LCP on marketplace */
    priorityThumb?: boolean;
}) {
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discountPct = hasDiscount
        ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
        : 0;

    return (
        <Link
            to={`/marketplace/product/${product.slug}`}
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
                {product.product_type === 'digital' && variant !== 'compact' && (
                    <span className="marketplace-badge marketplace-badge--digital">Digital</span>
                )}
                {discountPct > 0 && (
                    <span className="marketplace-badge marketplace-badge--discount">-{discountPct}%</span>
                )}
            </div>

            <div className="marketplace-card-body">
                {variant !== 'compact' && (
                    <span className="marketplace-card-category">
                        {product.category?.icon_emoji} {product.category?.label}
                    </span>
                )}
                <h3 className="marketplace-card-title">{product.title}</h3>

                {variant !== 'compact' && product.seller && (
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
                    </div>
                )}

                <div className="marketplace-card-footer">
                    <div className="marketplace-card-price">
                        <span className="marketplace-card-price-main">{formatPrice(product.price, product.currency)}</span>
                        {hasDiscount && (
                            <s className="marketplace-card-price-orig">{formatPrice(product.compare_at_price!, product.currency)}</s>
                        )}
                    </div>
                    {variant !== 'compact' && (
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
}

// ─── Category Pill ────────────────────────────────────────────────────────

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

function CategoryPill({
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
            className={`marketplace-cat-pill ${active ? 'marketplace-cat-pill--active' : ''}`}
            onClick={onClick}
            type="button"
        >
            {category.icon_emoji && <span>{category.icon_emoji}</span>}
            {category.label}
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────

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
    const newArrivalsRailRef = useRef<HTMLDivElement>(null);
    const [railCanPrev, setRailCanPrev] = useState(false);
    const [railCanNext, setRailCanNext] = useState(false);

    const updateRailScrollState = useCallback(() => {
        const el = newArrivalsRailRef.current;
        if (!el) return;
        const { scrollLeft, scrollWidth, clientWidth } = el;
        const max = scrollWidth - clientWidth;
        setRailCanPrev(scrollLeft > 2);
        setRailCanNext(max > 2 && scrollLeft < max - 2);
    }, []);

    const scrollNewArrivalsRail = useCallback(
        (direction: -1 | 1) => {
            const el = newArrivalsRailRef.current;
            if (!el) return;
            const step = Math.max(240, Math.round(el.clientWidth * 0.72));
            el.scrollBy({ left: direction * step, behavior: 'smooth' });
            window.setTimeout(updateRailScrollState, 320);
        },
        [updateRailScrollState]
    );

    const activeCategory = searchParams.get('category') ?? '';
    const activeSearch = searchParams.get('q') ?? '';
    const activeSort = searchParams.get('sort') ?? 'popular';

    const qParam = searchParams.get('q') ?? '';
    useEffect(() => {
        setSearchInput(qParam);
    }, [qParam]);

    // Load categories + featured on mount
    useEffect(() => {
        axios.get<MarketplaceCategoriesResponse>(`${API}/marketplace/categories`)
            .then(r => setCategories(r.data.categories))
            .catch(() => {});

        axios.get<MarketplaceFeaturedResponse>(`${API}/marketplace/featured`)
            .then(r => {
                setFeatured(r.data.featured ?? []);
                setNewArrivals(r.data.new_arrivals ?? []);
            })
            .catch(() => {});
    }, []);

    // Load products on filter change
    const loadProducts = useCallback(async (pg = 1) => {
        setLoading(true);
        setListError(false);
        try {
            const params: Record<string, string> = {
                page: String(pg),
                limit: '20',
                sort: activeSort,
            };
            if (activeCategory) params['category'] = activeCategory;
            if (activeSearch) params['search'] = activeSearch;

            const r = await axios.get<MarketplaceListResponse>(`${API}/marketplace/products`, { params });
            if (pg === 1) {
                setProducts(r.data.products);
            } else {
                setProducts((prev) => [...prev, ...r.data.products]);
            }
            setTotal(r.data.total);
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
    }, [activeCategory, activeSearch, activeSort]);

    useEffect(() => {
        loadProducts(1);
    }, [loadProducts]);

    function setFilter(key: string, value: string) {
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        next.delete('page');
        setSearchParams(next);
    }

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        setFilter('q', searchInput.trim());
        filterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    const showHero = !activeCategory && !activeSearch;

    useEffect(() => {
        const el = newArrivalsRailRef.current;
        if (!el || !showHero || newArrivals.length === 0) return;

        updateRailScrollState();
        el.addEventListener('scroll', updateRailScrollState, { passive: true });
        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateRailScrollState) : null;
        ro?.observe(el);

        return () => {
            el.removeEventListener('scroll', updateRailScrollState);
            ro?.disconnect();
        };
    }, [showHero, newArrivals.length, updateRailScrollState]);

    const curatedPicks = useMemo(
        () =>
            products
                .filter((p) => (p.featured_weight ?? 0) > 80 && !featured.some((f) => f.id === p.id))
                .slice(0, 3),
        [products, featured]
    );

    return (
        <>
            <Helmet>
                <title>Marketplace | GYMERVIET — Mua sắm fitness & sức khỏe</title>
                <meta name="description" content="Mua gói tập, gear, thực phẩm bổ sung, máy tập và hơn nữa từ các coach, gym và brand uy tín trên GYMERVIET." />
            </Helmet>

            <div className="marketplace-page">
                <div className="marketplace-inner">
                {/* Hero */}
                {showHero && (
                    <section className="marketplace-editorial-intro">
                        <h1 className="marketplace-editorial-title">
                            Mọi thứ bạn cần cho hành trình fitness
                        </h1>
                        <p className="marketplace-editorial-sub">
                            Gói tập từ coach uy tín · Gear chính hãng · Supplements an toàn · Máy tập chất lượng. Khám phá các lựa chọn tốt nhất được tuyển chọn cho bạn.
                        </p>
                        <form className="marketplace-editorial-search" onSubmit={handleSearch}>
                            <input
                                type="search"
                                placeholder="Tìm gói tập, whey protein, găng tay..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                className="marketplace-editorial-search-input"
                            />
                            <button type="submit" className="marketplace-editorial-search-btn">
                                <Search className="h-4 w-4 shrink-0" aria-hidden />
                                Tìm kiếm
                            </button>
                        </form>
                    </section>
                )}

                    {/* Category filter bar */}
                    <nav ref={filterRef} className="marketplace-cat-bar" aria-label="Danh mục sản phẩm">
                        <CategoryPill
                            category={{ slug: '', label: 'Tất cả', icon_emoji: '🏪' }}
                            active={!activeCategory}
                            onClick={() => setFilter('category', '')}
                        />
                        {categories.map(cat => (
                            <CategoryPill
                                key={cat.id}
                                category={cat}
                                active={activeCategory === cat.slug}
                                onClick={() => setFilter('category', cat.slug)}
                            />
                        ))}
                    </nav>

                    {!showHero && (
                        <form className="marketplace-compact-search" onSubmit={handleSearch}>
                            <div className="marketplace-compact-search-field">
                                <Search className="h-4 w-4" aria-hidden />
                                <input
                                    type="search"
                                    className="form-input coaches-dir-control marketplace-compact-search-input"
                                    placeholder="Tìm gói tập, whey protein, găng tay..."
                                    aria-label="Tìm kiếm sản phẩm marketplace"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="marketplace-compact-search-btn">
                                <Search className="h-4 w-4 shrink-0" aria-hidden />
                                Tìm kiếm
                            </button>
                        </form>
                    )}

                    {/* Sort bar */}
                    <div className="marketplace-toolbar">
                        <span className="marketplace-toolbar-count">
                            {loading && total === 0
                                ? 'Đang tải danh sách…'
                                : `${total.toLocaleString('vi-VN')} sản phẩm`}
                        </span>
                        <div className="marketplace-sort">
                            <label htmlFor="marketplace-sort-select" className="sr-only">Sắp xếp</label>
                            <select
                                id="marketplace-sort-select"
                                value={activeSort}
                                onChange={(e) => setFilter('sort', e.target.value)}
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

                    {/* Featured bento — only on homepage */}
                    {showHero && featured.length > 0 && (
                        <section className="marketplace-section">
                            <div className="marketplace-section-head">
                                <p className="marketplace-section-kicker">Lựa chọn nổi bật</p>
                                <h2 className="marketplace-section-title">Nổi bật</h2>
                            </div>
                            <div className="marketplace-bento">
                                {featured.slice(0, 3).map((p, index) => (
                                    <ProductCard
                                        key={p.id}
                                        product={p}
                                        variant="featured"
                                        priorityThumb={index === 0}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* New arrivals rail — only on homepage */}
                    {showHero && newArrivals.length > 0 && (
                        <section className="marketplace-section">
                            <div className="marketplace-section-head">
                                <p className="marketplace-section-kicker">Vừa lên kệ</p>
                                <h2 className="marketplace-section-title">Mới nhất</h2>
                            </div>
                            <div className="marketplace-rail-wrap">
                                <button
                                    type="button"
                                    className="marketplace-rail-nav marketplace-rail-nav--prev"
                                    onClick={() => scrollNewArrivalsRail(-1)}
                                    disabled={!railCanPrev}
                                    aria-label="Cuộn sản phẩm về trước"
                                >
                                    <ChevronLeft className="h-5 w-5" aria-hidden />
                                </button>
                                <div ref={newArrivalsRailRef} className="marketplace-rail">
                                    {newArrivals.map((p) => (
                                        <ProductCard key={p.id} product={p} variant="compact" />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    className="marketplace-rail-nav marketplace-rail-nav--next"
                                    onClick={() => scrollNewArrivalsRail(1)}
                                    disabled={!railCanNext}
                                    aria-label="Cuộn sản phẩm tiếp"
                                >
                                    <ChevronRight className="h-5 w-5" aria-hidden />
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Curated Picks — only when có ít nhất một sản phẩm gợi ý */}
                    {showHero && curatedPicks.length > 0 && (
                        <section className="marketplace-section">
                            <div className="marketplace-section-head">
                                <p className="marketplace-section-kicker">Gymerviet gợi ý</p>
                                <h2 className="marketplace-section-title">Biên tập chọn</h2>
                            </div>
                            <div className="marketplace-grid">
                                {curatedPicks.map((p) => (
                                    <ProductCard key={p.id} product={p} variant="standard" />
                                ))}
                                <Link
                                    to="/marketplace?sort=newest"
                                    className="marketplace-typo-slot"
                                >
                                    <p className="marketplace-typo-kicker">Tiêu chí lựa chọn</p>
                                    <h3 className="marketplace-typo-title">
                                        Ưu tiên sản phẩm mới, đánh giá tốt và seller uy tín.
                                    </h3>
                                    <p className="marketplace-typo-lead">
                                        Lưới sản phẩm bên cạnh là lựa chọn nội bộ, không phải sắp xếp theo một tiêu chí đơn lẻ. Chọn &quot;Xem hàng mới&quot; để mở bộ lọc Mới nhất và khám phá thêm.
                                    </p>
                                    <span className="marketplace-typo-cta">Xem hàng mới →</span>
                                </Link>
                            </div>
                        </section>
                    )}

                    {/* Main grid */}
                    <section className="marketplace-section">
                        {(activeCategory || activeSearch) && (
                            <h2 className="marketplace-section-title">
                                {activeCategory
                                    ? categories.find(c => c.slug === activeCategory)?.label ?? 'Sản phẩm'
                                    : `Kết quả cho "${activeSearch}"`}
                            </h2>
                        )}

                        {listError && !loading && products.length === 0 ? (
                            <div className="marketplace-load-error">
                                <div className="marketplace-load-error-icon" aria-hidden>
                                    <AlertCircle className="h-7 w-7" strokeWidth={2} />
                                </div>
                                <h3>Không tải được danh sách sản phẩm</h3>
                                <p>Kiểm tra kết nối mạng rồi thử lại. Nếu vẫn lỗi, có thể máy chủ đang bận.</p>
                                <button type="button" className="marketplace-btn-ghost" onClick={() => loadProducts(1)}>
                                    Thử lại
                                </button>
                            </div>
                        ) : loading && products.length === 0 && !listError ? (
                            <div className="marketplace-grid" aria-busy="true" aria-label="Đang tải sản phẩm">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <MarketplaceProductSkeleton key={i} />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="marketplace-empty">
                                <div className="marketplace-empty-icon-svg">
                                    <Search className="h-7 w-7" strokeWidth={1.75} aria-hidden />
                                </div>
                                <h3>Không tìm thấy sản phẩm</h3>
                                <p>
                                    Thử từ khóa ngắn hơn, bỏ bớt bộ lọc hoặc chọn một danh mục khác — đôi khi chỉ cần quay lại
                                    &quot;Tất cả&quot; là đủ lựa chọn.
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
                                    {categories[0] ? (
                                        <Link
                                            to={`/marketplace?category=${categories[0].slug}`}
                                            className="marketplace-btn-ghost"
                                        >
                                            Gợi ý: {categories[0].label}
                                        </Link>
                                    ) : null}
                                </div>
                            </div>
                        ) : (
                            <div className="marketplace-grid">
                                {products.map(p => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        )}

                        {/* Load more */}
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
                            <div className="marketplace-loading-more">Đang tải...</div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}
