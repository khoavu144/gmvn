import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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

function formatPrice(n: number, currency = 'VND'): string {
    if (currency === 'VND') {
        return n.toLocaleString('vi-VN') + 'đ';
    }
    return n.toLocaleString('en-US', { style: 'currency', currency });
}

// ─── Product Card ─────────────────────────────────────────────────────────

function ProductCard({ product }: { product: Product }) {
    const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
    const discountPct = hasDiscount
        ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
        : 0;

    return (
        <Link
            to={`/marketplace/product/${product.slug}`}
            className="marketplace-product-card"
            aria-label={product.title}
        >
            <div className="marketplace-card-thumb">
                {product.thumbnail_url ? (
                    <img
                        src={product.thumbnail_url}
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="marketplace-card-thumb-placeholder">
                        {product.category?.icon_emoji ?? '📦'}
                    </div>
                )}
                {product.product_type === 'digital' && (
                    <span className="marketplace-badge marketplace-badge--digital">Digital</span>
                )}
                {discountPct > 0 && (
                    <span className="marketplace-badge marketplace-badge--discount">-{discountPct}%</span>
                )}
            </div>

            <div className="marketplace-card-body">
                <span className="marketplace-card-category">
                    {product.category?.icon_emoji} {product.category?.label}
                </span>
                <h3 className="marketplace-card-title">{product.title}</h3>

                <div className="marketplace-card-meta">
                    {product.seller && (
                        <div className="marketplace-card-seller">
                            {product.seller.avatar_url ? (
                                <img src={product.seller.avatar_url} alt={product.seller.full_name} className="marketplace-card-seller-avatar" />
                            ) : (
                                <div className="marketplace-card-seller-initials">
                                    {product.seller.full_name.charAt(0)}
                                </div>
                            )}
                            <span>{product.seller.full_name}</span>
                        </div>
                    )}
                </div>

                <div className="marketplace-card-footer">
                    <div className="marketplace-card-price">
                        <span className="marketplace-card-price-main">{formatPrice(product.price, product.currency)}</span>
                        {hasDiscount && (
                            <s className="marketplace-card-price-orig">{formatPrice(product.compare_at_price!, product.currency)}</s>
                        )}
                    </div>
                    {product.review_count > 0 && (
                        <div className="marketplace-card-rating">
                            <span>⭐</span>
                            <span>{product.avg_rating?.toFixed(1) ?? '—'}</span>
                            <span className="marketplace-card-review-count">({product.review_count})</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

// ─── Category Pill ────────────────────────────────────────────────────────

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
    const [searchInput, setSearchInput] = useState(searchParams.get('q') ?? '');

    const activeCategory = searchParams.get('category') ?? '';
    const activeSearch = searchParams.get('q') ?? '';
    const activeSort = searchParams.get('sort') ?? 'popular';

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
                setProducts(prev => [...prev, ...r.data.products]);
            }
            setTotal(r.data.total);
            setPage(pg);
        } catch {
            // stay with previous data
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
    }

    const showHero = !activeCategory && !activeSearch;

    return (
        <>
            <Helmet>
                <title>Marketplace | GYMERVIET — Mua sắm fitness & sức khỏe</title>
                <meta name="description" content="Mua gói tập, gear, thực phẩm bổ sung, máy tập và hơn nữa từ các coach, gym và brand uy tín trên GYMERVIET." />
            </Helmet>

            <div className="marketplace-page">
                {/* Hero */}
                {showHero && (
                    <section className="marketplace-hero">
                        <div className="marketplace-hero-inner">
                            <h1 className="marketplace-hero-title">
                                Mọi thứ bạn cần cho hành trình fitness
                            </h1>
                            <p className="marketplace-hero-sub">
                                Gói tập từ coach uy tín · Gear chính hãng · Supplements An toàn · Máy tập chất lượng
                            </p>
                            <form className="marketplace-hero-search" onSubmit={handleSearch}>
                                <input
                                    type="search"
                                    placeholder="Tìm gói tập, whey protein, găng tay..."
                                    value={searchInput}
                                    onChange={e => setSearchInput(e.target.value)}
                                    className="marketplace-hero-search-input"
                                />
                                <button type="submit" className="marketplace-hero-search-btn">
                                    🔍 Tìm kiếm
                                </button>
                            </form>
                        </div>
                    </section>
                )}

                <div className="marketplace-layout">
                    {/* Category filter bar */}
                    <nav className="marketplace-cat-bar" aria-label="Danh mục sản phẩm">
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

                    {/* Sort bar */}
                    <div className="marketplace-toolbar">
                        <span className="marketplace-toolbar-count">
                            {activeSearch || activeCategory
                                ? `${total.toLocaleString('vi-VN')} sản phẩm`
                                : ''}
                        </span>
                        <div className="marketplace-sort">
                            <label htmlFor="marketplace-sort-select" className="sr-only">Sắp xếp</label>
                            <select
                                id="marketplace-sort-select"
                                value={activeSort}
                                onChange={e => setFilter('sort', e.target.value)}
                                className="marketplace-sort-select"
                            >
                                <option value="popular">Phổ biến nhất</option>
                                <option value="newest">Mới nhất</option>
                                <option value="price_asc">Giá thấp → cao</option>
                                <option value="price_desc">Giá cao → thấp</option>
                                <option value="rating">Đánh giá cao</option>
                            </select>
                        </div>
                    </div>

                    {/* Featured rail — only on homepage */}
                    {showHero && featured.length > 0 && (
                        <section className="marketplace-section">
                            <h2 className="marketplace-section-title">⭐ Nổi bật</h2>
                            <div className="marketplace-rail">
                                {featured.map(p => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* New arrivals — only on homepage */}
                    {showHero && newArrivals.length > 0 && (
                        <section className="marketplace-section">
                            <h2 className="marketplace-section-title">🆕 Mới nhất</h2>
                            <div className="marketplace-rail">
                                {newArrivals.map(p => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
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

                        {loading && products.length === 0 ? (
                            <div className="marketplace-loading">
                                <div className="marketplace-loading-spinner" />
                                <p>Đang tải sản phẩm...</p>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="marketplace-empty">
                                <p className="marketplace-empty-icon">🔍</p>
                                <h3>Không tìm thấy sản phẩm</h3>
                                <p>Hãy thử từ khóa khác hoặc chọn danh mục khác.</p>
                                <button
                                    className="marketplace-btn-ghost"
                                    onClick={() => {
                                        setSearchInput('');
                                        setSearchParams({});
                                    }}
                                >
                                    Xem tất cả sản phẩm
                                </button>
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
