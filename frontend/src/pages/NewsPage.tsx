import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { Clock } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    thumbnail_url: string | null;
    category: string;
    tags: string[] | null;
    view_count: number;
    read_time_min: number | null;
    published_at: string | null;
}

interface NewsApiResponse {
    success: boolean;
    data: NewsArticle[];
    meta: { page: number; limit: number; total: number; totalPages: number };
}

// ─── Category Options ─────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
    all: 'Tất cả',
    'strength-training': 'Sức mạnh',
    fitness: 'Thể dục - Fitness',
    health: 'Sức khỏe',
    nutrition: 'Dinh dưỡng',
    recovery: 'Phục hồi',
    'general': 'Tổng hợp',
};

// ─── Article Card ─────────────────────────────────────────────────────────────

function NewsCard({ article }: { article: NewsArticle }) {
    const dateStr = article.published_at
        ? new Date(article.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    return (
        <Link
            to={`/news/${article.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--mk-line)] bg-white shadow-[0_4px_24px_rgba(53,41,26,0.04)] hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(53,41,26,0.12)] transition-all duration-300"
        >
            {/* Thumbnail */}
            <div className="relative aspect-[16/9] overflow-hidden bg-[color:var(--mk-paper-strong)]">
                {article.thumbnail_url ? (
                    <img
                        src={article.thumbnail_url}
                        alt={article.title}
                        className="h-full w-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-5xl font-black text-gray-300">{article.title.charAt(0)}</span>
                    </div>
                )}
                {/* Category badge */}
                <span className="absolute left-4 top-4 rounded-full bg-black/80 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                    {CATEGORY_MAP[article.category] || article.category}
                </span>
            </div>

            {/* Body */}
            <div className="flex flex-1 flex-col p-5">
                <h2 className="text-[1.05rem] font-black leading-[1.3] tracking-[-0.025em] text-[color:var(--mk-text)] line-clamp-2 group-hover:text-[color:var(--mk-accent)] transition-colors">
                    {article.title}
                </h2>
                {article.excerpt && (
                    <p className="mt-2 text-sm leading-6 text-[color:var(--mk-muted)] line-clamp-3">
                        {article.excerpt}
                    </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-[color:var(--mk-line)]">
                    <div className="flex items-center gap-3 text-[0.78rem] text-[color:var(--mk-muted)]">
                        {article.read_time_min && (
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {article.read_time_min} phút đọc
                            </span>
                        )}
                        {dateStr && <span>{dateStr}</span>}
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsPage() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeCategory, setActiveCategory] = useState('all');

    useEffect(() => {
        setLoading(true);
        setError(null);

        const params: Record<string, string | number> = { page, limit: 12 };
        if (activeCategory !== 'all') params.category = activeCategory;

        apiClient.get<NewsApiResponse>('/news', { params })
            .then((res) => {
                setArticles(res.data.data);
                setTotalPages(res.data.meta.totalPages);
            })
            .catch(() => setError('Không thể tải danh sách bài viết. Vui lòng thử lại.'))
            .finally(() => setLoading(false));
    }, [page, activeCategory]);

    const handleCategoryChange = (cat: string) => {
        setActiveCategory(cat);
        setPage(1);
    };

    const canonicalBase = import.meta.env.VITE_CANONICAL_BASE_URL || 'https://gymerviet.com';

    return (
        <>
            <Helmet>
                <title>Tin Tức Thể Hình — GYMERVIET</title>
                <meta name="description" content="Cập nhật kiến thức tập luyện, dinh dưỡng, phục hồi và xu hướng fitness mới nhất từ cộng đồng thể hình GYMERVIET." />
                <link rel="canonical" href={`${canonicalBase}/news`} />
                <meta property="og:title" content="Tin Tức Thể Hình — GYMERVIET" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${canonicalBase}/news`} />
            </Helmet>

            <div className="marketplace-shell min-h-screen pb-24">
                <div className="marketplace-container pt-8">

                    {/* Page header */}
                    <div className="mb-8">
                        <div className="marketplace-section-kicker">Cộng đồng</div>
                        <h1 className="marketplace-section-title mt-2">
                            Kiến Thức & Tin Tức Thể Hình
                        </h1>
                        <p className="marketplace-lead mt-3 max-w-2xl">
                            Tổng hợp kiến thức tập luyện, dinh dưỡng thể thao và xu hướng fitness từ các chuyên gia hàng đầu thế giới — được chuyển thể và biên tập cho cộng đồng tập luyện Việt Nam.
                        </p>
                    </div>

                    {/* Category tabs */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => handleCategoryChange(key)}
                                className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                                    activeCategory === key
                                        ? 'bg-[color:var(--mk-text)] text-white'
                                        : 'border border-[color:var(--mk-line)] bg-white text-[color:var(--mk-muted)] hover:border-[color:var(--mk-text)] hover:text-[color:var(--mk-text)]'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="rounded-2xl border border-[color:var(--mk-line)] overflow-hidden">
                                    <Skeleton className="aspect-[16/9] w-full rounded-none" />
                                    <div className="p-5 space-y-3">
                                        <Skeleton className="h-5 w-full" />
                                        <Skeleton className="h-5 w-3/4" />
                                        <Skeleton className="h-3 w-1/2 mt-2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error state */}
                    {error && !loading && (
                        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-6 text-center text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && articles.length === 0 && (
                        <EmptyState 
                            numberIcon={0}
                            description="Chưa có bài viết trong danh mục này. Hệ thống sẽ tự động cập nhật hàng ngày."
                        />
                    )}

                    {/* Article grid */}
                    {!loading && !error && articles.length > 0 && (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {articles.map((article) => (
                                <NewsCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-10 flex items-center justify-center gap-2">
                            <button
                                type="button"
                                disabled={page === 1}
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                className="rounded-xl border border-[color:var(--mk-line)] px-4 py-2 text-sm font-semibold text-[color:var(--mk-text)] disabled:opacity-40 transition hover:border-[color:var(--mk-text)]"
                            >
                                ← Trang trước
                            </button>
                            <span className="text-sm text-[color:var(--mk-muted)]">
                                {page} / {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                className="rounded-xl border border-[color:var(--mk-line)] px-4 py-2 text-sm font-semibold text-[color:var(--mk-text)] disabled:opacity-40 transition hover:border-[color:var(--mk-text)]"
                            >
                                Trang sau →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
