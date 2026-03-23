import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { sanitizeNewsArticleHtml } from '../utils/sanitizeNewsContent';
import { Clock, ArrowLeft, Tag, Eye } from 'lucide-react';
import { SITE_LOGO_URL, SITE_ORIGIN, SITE_TWITTER_HANDLE } from '../lib/site';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NewsArticle {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    thumbnail_url: string | null;
    og_image_url: string | null;
    og_image_alt: string | null;
    seo_title: string | null;
    seo_description: string | null;
    category: string;
    tags: string[] | null;
    view_count: number;
    read_time_min: number | null;
    published_at: string | null;
    source_domain: string | null;
}

const SKELETON_LINE_WIDTHS = [88, 92, 78, 85, 90, 82, 87, 80] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const canonicalBase = SITE_ORIGIN;

    /* eslint-disable react-hooks/set-state-in-effect -- article fetch lifecycle */
    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        apiClient.get(`/news/${slug}`)
            .then((res) => setArticle(res.data.data))
            .catch(() => setError('Bài viết không tồn tại hoặc đã bị gỡ.'))
            .finally(() => setLoading(false));
    }, [slug]);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (loading) {
        return (
            <div className="marketplace-shell min-h-screen animate-pulse">
                <div className="marketplace-container gv-pad-y max-w-3xl space-y-4">
                    <div className="h-8 bg-gray-100 rounded-lg w-3/4" />
                    <div className="h-4 bg-gray-50 rounded-lg w-1/2" />
                    <div className="mt-6 aspect-[16/9] rounded-lg bg-gray-100" />
                    <div className="mt-6 space-y-3">
                        {SKELETON_LINE_WIDTHS.map((pct, i) => (
                            <div key={i} className="h-4 bg-gray-50 rounded-lg" style={{ width: `${pct}%` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="marketplace-shell min-h-screen flex items-center justify-center">
                <div className="text-center px-6 max-w-md">
                    <div className="text-6xl font-black text-gray-200 mb-4">404</div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Bài viết không tìm thấy</h1>
                    <p className="text-sm text-gray-500 mb-6">{error}</p>
                    <Link to="/news" className="btn-primary inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Về trang Tin Tức
                    </Link>
                </div>
            </div>
        );
    }

    const dateStr = article.published_at
        ? new Date(article.published_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : null;

    const pageTitle = article.seo_title || article.title;
    const pageDesc = article.seo_description || article.excerpt || '';
    const ogImage = article.og_image_url || article.thumbnail_url || '';
    const canonical = `${canonicalBase}/news/${article.slug}`;

    // JSON-LD Structured Data (Article schema for Google)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': article.title,
        'description': pageDesc,
        'image': ogImage || undefined,
        'url': canonical,
        'datePublished': article.published_at || undefined,
        'author': {
            '@type': 'Organization',
            'name': 'GYMERVIET',
            'url': canonicalBase,
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'GYMERVIET',
            'logo': { '@type': 'ImageObject', 'url': SITE_LOGO_URL },
        },
    };

    return (
        <>
            <Helmet>
                <title>{pageTitle} — GYMERVIET</title>
                <meta name="description" content={pageDesc} />
                <link rel="canonical" href={canonical} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDesc} />
                <meta property="og:type" content="article" />
                <meta property="og:url" content={canonical} />
                {ogImage && <meta property="og:image" content={ogImage} />}
                {article.og_image_alt && <meta property="og:image:alt" content={article.og_image_alt} />}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:site" content={SITE_TWITTER_HANDLE} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDesc} />
                {ogImage && <meta name="twitter:image" content={ogImage} />}
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>

            <div className="marketplace-shell min-h-screen">
                <div className="marketplace-container gv-pad-y max-w-3xl">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
                        <Link to="/news" className="hover:text-gray-900 transition-colors flex items-center gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Tin Tức
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 truncate max-w-[200px]">{article.title}</span>
                    </nav>

                    {/* Header */}
                    <header className="mb-6">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="rounded-full bg-gray-900 px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white">
                                {article.category}
                            </span>
                            {dateStr && (
                                <span className="text-xs text-gray-500">{dateStr}</span>
                            )}
                            {article.read_time_min && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                    <Clock className="w-3.5 h-3.5" />
                                    {article.read_time_min} phút đọc
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Eye className="w-3.5 h-3.5" />
                                {article.view_count.toLocaleString()} lượt xem
                            </span>
                        </div>

                        <h1 className="text-[1.9rem] font-black leading-[1.2] tracking-[-0.04em] text-gray-900">
                            {article.title}
                        </h1>

                        {article.excerpt && (
                            <p className="mt-3 text-base leading-7 text-gray-500">
                                {article.excerpt}
                            </p>
                        )}
                    </header>

                    {/* Hero image */}
                    {article.thumbnail_url && (
                        <figure className="mb-8 overflow-hidden rounded-lg">
                            <img
                                src={article.thumbnail_url}
                                alt={article.og_image_alt || article.title}
                                className="w-full object-cover"
                                loading="eager"
                                decoding="async"
                            />
                        </figure>
                    )}

                    {/* Article body */}
                    <article
                        className="prose prose-lg prose-gray max-w-none
                            prose-headings:font-black prose-headings:tracking-tight
                            prose-h2:text-[1.4rem] prose-h3:text-[1.15rem]
                            prose-p:leading-8 prose-p:text-gray-600
                            prose-strong:text-gray-900 prose-strong:font-bold
                            prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-lg prose-img:shadow-md
                            prose-ul:list-disc prose-ol:list-decimal"
                        dangerouslySetInnerHTML={{ __html: sanitizeNewsArticleHtml(article.content) }}
                    />

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-6">
                            <Tag className="w-4 h-4 text-gray-500" />
                            {article.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    to={`/news?tag=${encodeURIComponent(tag)}`}
                                    className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500 hover:border-gray-900 hover:text-gray-900 transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Footer breadcrumb */}
                    <div className="mt-10 pt-6 border-t border-gray-200">
                        <Link
                            to="/news"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Xem thêm bài viết khác
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
