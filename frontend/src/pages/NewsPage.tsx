import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Clock } from 'lucide-react';
import apiClient from '../services/api';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

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

const CATEGORY_MAP: Record<string, string> = {
    all: 'Tất cả',
    'strength-training': 'Sức mạnh',
    fitness: 'Thể dục - Fitness',
    health: 'Sức khỏe',
    nutrition: 'Dinh dưỡng',
    recovery: 'Phục hồi',
    general: 'Tổng hợp',
};

const CATEGORY_NOTES: Record<string, string> = {
    all: 'Tổng hợp toàn bộ bài viết đang được biên tập cho cộng đồng tập luyện Việt Nam.',
    'strength-training': 'Tập trung vào kỹ thuật sức mạnh, progressive overload và tổ chức buổi tập hiệu quả.',
    fitness: 'Cập nhật xu hướng tập luyện phổ thông, bài tập nền tảng và thói quen vận động bền vững.',
    health: 'Những góc nhìn thực tế về sức khỏe, lối sống và khả năng duy trì phong độ dài hạn.',
    nutrition: 'Dinh dưỡng thể thao, thói quen ăn uống và cách tối ưu năng lượng cho người tập.',
    recovery: 'Phục hồi, ngủ nghỉ, giảm tải và các tín hiệu cần lưu ý trước khi quá tải kéo dài.',
    general: 'Những chủ đề giao thoa giữa tập luyện, cộng đồng và các thay đổi trong ngành fitness.',
};

function NewsCard({ article }: { article: NewsArticle }) {
    const dateStr = article.published_at
        ? new Date(article.published_at).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
        : null;

    return (
        <Link
            to={`/news/${article.slug}`}
            className="marketplace-panel group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(53,41,26,0.1)]"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                {article.thumbnail_url ? (
                    <img
                        src={article.thumbnail_url}
                        alt={article.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-5xl font-black text-gray-500">
                        {article.title.charAt(0)}
                    </div>
                )}

                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
                    <span className="marketplace-badge marketplace-badge--neutral">
                        {CATEGORY_MAP[article.category] || article.category}
                    </span>
                    {article.tags?.[0] && (
                        <span className="marketplace-badge marketplace-badge--accent max-w-[11rem] truncate">
                            #{article.tags[0]}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                <div className="space-y-3">
                    <h2 className="text-[1.18rem] font-bold leading-[1.28] tracking-[-0.035em] text-gray-900 transition-colors group-hover:text-gray-800">
                        {article.title}
                    </h2>
                    {article.excerpt && (
                        <p className="text-sm leading-7 text-gray-600 line-clamp-3">
                            {article.excerpt}
                        </p>
                    )}
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-gray-200 pt-4 text-[0.78rem] text-gray-500">
                    {article.read_time_min && (
                        <span className="inline-flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {article.read_time_min} phút đọc
                        </span>
                    )}
                    {dateStr && <span>{dateStr}</span>}
                    <span className="ml-auto inline-flex items-center gap-2 font-bold uppercase tracking-[0.16em] text-gray-900 transition-transform group-hover:translate-x-1">
                        Đọc tiếp →
                    </span>
                </div>
            </div>
        </Link>
    );
}

export default function NewsPage() {
    const [articles, setArticles] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeCategory, setActiveCategory] = useState('all');
    const canonicalBase = import.meta.env.VITE_CANONICAL_BASE_URL || 'https://gymerviet.com';

    /* eslint-disable react-hooks/set-state-in-effect -- list fetch: loading/error flags belong to request lifecycle */
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
    /* eslint-enable react-hooks/set-state-in-effect */

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        setPage(1);
    };

    return (
        <>
            <Helmet>
                <title>Tin Tức Thể Hình — GYMERVIET</title>
                <meta
                    name="description"
                    content="Cập nhật kiến thức tập luyện, dinh dưỡng, phục hồi và xu hướng fitness mới nhất từ cộng đồng thể hình GYMERVIET."
                />
                <link rel="canonical" href={`${canonicalBase}/news`} />
                <meta property="og:title" content="Tin Tức Thể Hình — GYMERVIET" />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={`${canonicalBase}/news`} />
            </Helmet>

            <main className="marketplace-shell min-h-screen">
                <section className="marketplace-hero">
                    <div className="marketplace-container">
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-end">
                            <div className="space-y-5">
                                <span className="marketplace-eyebrow">Knowledge hub</span>
                                <h1 className="marketplace-title max-w-4xl text-balance">
                                    Kiến thức và tin tức thể hình được biên tập để người tập ra quyết định tốt hơn.
                                </h1>
                                <p className="marketplace-lead max-w-2xl">
                                    Đây không chỉ là blog để lấp đầy SEO. Mục tiêu của khu vực này là giúp người dùng hiểu nhanh điều gì đáng đọc, đáng lưu và đáng áp dụng cho hành trình tập luyện thực tế.
                                </p>
                            </div>

                            <div className="marketplace-panel gv-panel-pad">
                                <div className="marketplace-section-kicker">Trọng tâm hiện tại</div>
                                <h2 className="marketplace-section-title mt-2">
                                    {CATEGORY_MAP[activeCategory] || 'Tổng hợp'}
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-gray-600">
                                    {CATEGORY_NOTES[activeCategory] || CATEGORY_NOTES.all}
                                </p>
                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg border border-gray-200 bg-white/70 p-4">
                                        <div className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gray-500">
                                            Số bài viết / trang
                                        </div>
                                        <div className="mt-2 text-2xl font-bold tracking-[-0.05em] text-gray-900">
                                            12
                                        </div>
                                    </div>
                                    <div className="rounded-lg border border-gray-200 bg-white/70 p-4">
                                        <div className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-gray-500">
                                            Trang hiện tại
                                        </div>
                                        <div className="mt-2 text-2xl font-bold tracking-[-0.05em] text-gray-900">
                                            {page} / {totalPages}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="marketplace-container">
                    <div className="marketplace-panel gv-panel-pad-xs">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-2">
                                <div className="marketplace-section-kicker">Danh mục</div>
                                <h2 className="marketplace-section-title">
                                    Lọc nhanh theo chủ đề bạn muốn đọc tiếp theo.
                                </h2>
                            </div>
                            <div className="text-sm text-gray-500">
                                {loading ? 'Đang đồng bộ bài viết…' : `${articles.length} bài viết ở trang này`}
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {Object.entries(CATEGORY_MAP).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => handleCategoryChange(key)}
                                    className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${activeCategory === key
                                            ? 'bg-gray-900 text-white'
                                            : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900'
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="marketplace-container mt-6 space-y-6">
                    {loading && (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <div key={index} className="marketplace-panel overflow-hidden">
                                    <Skeleton className="aspect-[16/10] w-full rounded-none" />
                                    <div className="space-y-3 p-5 sm:p-6">
                                        <Skeleton className="h-5 w-1/3" />
                                        <Skeleton className="h-6 w-full" />
                                        <Skeleton className="h-6 w-4/5" />
                                        <Skeleton className="h-4 w-full" />
                                        <Skeleton className="h-4 w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && !loading && (
                        <div className="marketplace-panel border-red-200 bg-red-50 px-5 py-6 text-sm font-medium text-red-700">
                            {error}
                        </div>
                    )}

                    {!loading && !error && articles.length === 0 && (
                        <div className="marketplace-panel">
                            <EmptyState
                                numberIcon={0}
                                description="Chưa có bài viết trong danh mục này. Hệ thống sẽ tự động cập nhật hàng ngày."
                            />
                        </div>
                    )}

                    {!loading && !error && articles.length > 0 && (
                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                            {articles.map((article) => (
                                <NewsCard key={article.id} article={article} />
                            ))}
                        </div>
                    )}
                </section>

                {totalPages > 1 && (
                    <section className="marketplace-container mt-8">
                        <div className="marketplace-panel gv-panel-pad-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <div className="marketplace-section-kicker">Phân trang</div>
                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    Tiếp tục sang trang sau để xem thêm bài viết trong cùng nhịp biên tập.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 sm:justify-end">
                                <button
                                    type="button"
                                    disabled={page === 1}
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    className="btn-secondary px-4 text-sm font-bold disabled:opacity-40"
                                >
                                    ← Trang trước
                                </button>
                                <span className="min-w-[80px] text-center text-sm text-gray-500">
                                    {page} / {totalPages}
                                </span>
                                <button
                                    type="button"
                                    disabled={page === totalPages}
                                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    className="btn-secondary px-4 text-sm font-bold disabled:opacity-40"
                                >
                                    Trang sau →
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </>
    );
}
