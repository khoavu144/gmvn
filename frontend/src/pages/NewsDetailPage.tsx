import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { Clock, ArrowLeft, Tag, Eye } from 'lucide-react';

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewsDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const [article, setArticle] = useState<NewsArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const canonicalBase = import.meta.env.VITE_CANONICAL_BASE_URL || 'https://gymerviet.com';

    useEffect(() => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        apiClient.get(`/news/${slug}`)
            .then((res) => setArticle(res.data.data))
            .catch(() => setError('Bài viết không tồn tại hoặc đã bị gỡ.'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) {
        return (
            <div className="marketplace-shell min-h-screen animate-pulse">
                <div className="marketplace-container max-w-3xl pt-10 pb-24 space-y-4">
                    <div className="h-8 bg-[color:var(--mk-paper-strong)] rounded-lg w-3/4" />
                    <div className="h-4 bg-[color:var(--mk-paper)] rounded-lg w-1/2" />
                    <div className="mt-6 aspect-[16/9] rounded-lg bg-[color:var(--mk-paper-strong)]" />
                    <div className="mt-6 space-y-3">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-4 bg-[color:var(--mk-paper)] rounded-lg" style={{ width: `${75 + Math.random() * 25}%` }} />
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
                    <h1 className="text-2xl font-black text-[color:var(--mk-text)] mb-2">Bài viết không tìm thấy</h1>
                    <p className="text-sm text-[color:var(--mk-muted)] mb-6">{error}</p>
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
            'logo': { '@type': 'ImageObject', 'url': `${canonicalBase}/logo.png` },
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
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDesc} />
                {ogImage && <meta name="twitter:image" content={ogImage} />}
                <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
            </Helmet>

            <div className="marketplace-shell min-h-screen pb-24">
                <div className="marketplace-container max-w-3xl pt-8">

                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-xs text-[color:var(--mk-muted)] mb-6" aria-label="Breadcrumb">
                        <Link to="/news" className="hover:text-[color:var(--mk-text)] transition-colors flex items-center gap-1.5">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Tin Tức
                        </Link>
                        <span>/</span>
                        <span className="text-[color:var(--mk-text)] truncate max-w-[200px]">{article.title}</span>
                    </nav>

                    {/* Header */}
                    <header className="mb-6">
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="rounded-full bg-[color:var(--mk-text)] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-white">
                                {article.category}
                            </span>
                            {dateStr && (
                                <span className="text-xs text-[color:var(--mk-muted)]">{dateStr}</span>
                            )}
                            {article.read_time_min && (
                                <span className="flex items-center gap-1 text-xs text-[color:var(--mk-muted)]">
                                    <Clock className="w-3.5 h-3.5" />
                                    {article.read_time_min} phút đọc
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-[color:var(--mk-muted)]">
                                <Eye className="w-3.5 h-3.5" />
                                {article.view_count.toLocaleString()} lượt xem
                            </span>
                        </div>

                        <h1 className="text-[1.9rem] font-black leading-[1.2] tracking-[-0.04em] text-[color:var(--mk-text)]">
                            {article.title}
                        </h1>

                        {article.excerpt && (
                            <p className="mt-3 text-base leading-7 text-[color:var(--mk-muted)]">
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
                            prose-p:leading-8 prose-p:text-[color:var(--mk-muted)]
                            prose-strong:text-[color:var(--mk-text)] prose-strong:font-bold
                            prose-a:text-[color:var(--mk-accent)] prose-a:no-underline hover:prose-a:underline
                            prose-img:rounded-lg prose-img:shadow-md
                            prose-ul:list-disc prose-ol:list-decimal"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                    />

                    {/* Tags */}
                    {article.tags && article.tags.length > 0 && (
                        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[color:var(--mk-line)] pt-6">
                            <Tag className="w-4 h-4 text-[color:var(--mk-muted)]" />
                            {article.tags.map((tag) => (
                                <Link
                                    key={tag}
                                    to={`/news?tag=${encodeURIComponent(tag)}`}
                                    className="rounded-full border border-[color:var(--mk-line)] px-3 py-1 text-xs font-semibold text-[color:var(--mk-muted)] hover:border-[color:var(--mk-text)] hover:text-[color:var(--mk-text)] transition-colors"
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Footer breadcrumb */}
                    <div className="mt-10 pt-6 border-t border-[color:var(--mk-line)]">
                        <Link
                            to="/news"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--mk-muted)] hover:text-[color:var(--mk-text)] transition-colors"
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
