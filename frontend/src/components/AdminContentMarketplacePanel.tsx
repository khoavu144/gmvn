import { useCallback, useEffect, useState } from 'react';
import apiClient from '../services/api';
import { adminEmptyStateClassName } from './admin/adminPanelPrimitives';

type NewsArticle = {
    id: string;
    title: string;
    slug: string;
    status: string;
    category: string | null;
    created_at: string;
};

type Product = {
    id: string;
    title: string;
    slug: string;
    status: string;
    seller?: { full_name?: string; user_id?: string };
};

const NEWS_STATUS_LABELS: Record<string, string> = {
    draft: 'Bản nháp',
    published: 'Đã đăng',
    archived: 'Đã lưu trữ',
};

function formatNewsStatus(status: string) {
    return NEWS_STATUS_LABELS[status] ?? status;
}

export default function AdminContentMarketplacePanel() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [newsMeta, setNewsMeta] = useState({ page: 1, total: 0 });
    const [newsPage, setNewsPage] = useState(1);
    const [crawling, setCrawling] = useState(false);

    const [products, setProducts] = useState<Product[]>([]);
    const [modTotal, setModTotal] = useState(0);
    const [modPage, setModPage] = useState(1);
    const [modNote, setModNote] = useState<Record<string, string>>({});
    const [busyProduct, setBusyProduct] = useState<string | null>(null);

    const [newsErr, setNewsErr] = useState<string | null>(null);
    const [modErr, setModErr] = useState<string | null>(null);

    const loadNews = useCallback(async () => {
        try {
            setNewsErr(null);
            const res = await apiClient.get('/news/admin/list', { params: { page: newsPage, limit: 20 } });
            setNews(res.data.data || []);
            setNewsMeta({ page: res.data.meta?.page ?? newsPage, total: res.data.meta?.total ?? 0 });
        } catch {
            setNewsErr('Không tải được danh sách tin.');
        }
    }, [newsPage]);

    const loadMod = useCallback(async () => {
        try {
            setModErr(null);
            const res = await apiClient.get('/marketplace/admin/moderation', { params: { page: modPage, limit: 20 } });
            setProducts(res.data.products || []);
            setModTotal(res.data.total ?? 0);
        } catch {
            setModErr('Không tải được hàng chờ marketplace.');
        }
    }, [modPage]);

    useEffect(() => {
        void loadNews();
    }, [loadNews]);

    useEffect(() => {
        void loadMod();
    }, [loadMod]);

    const triggerCrawl = async () => {
        setCrawling(true);
        try {
            await apiClient.post('/news/admin/crawl');
            alert('Đã kích hoạt quét tin ở chế độ chạy nền.');
        } catch {
            alert('Không thể gọi tiến trình quét tin.');
        } finally {
            setCrawling(false);
        }
    };

    const publishNews = async (id: string) => {
        try {
            await apiClient.patch(`/news/admin/${id}/publish`);
            await loadNews();
        } catch {
            alert('Xuất bản thất bại.');
        }
    };

    const archiveNews = async (id: string) => {
        try {
            await apiClient.patch(`/news/admin/${id}/archive`);
            await loadNews();
        } catch {
            alert('Lưu trữ thất bại.');
        }
    };

    const deleteNews = async (id: string) => {
        if (!window.confirm('Xóa bài viết này?')) return;
        try {
            await apiClient.delete(`/news/admin/${id}`);
            await loadNews();
        } catch {
            alert('Xóa không thành công.');
        }
    };

    const moderate = async (id: string, decision: 'approve' | 'reject') => {
        setBusyProduct(id);
        try {
            await apiClient.put(`/marketplace/admin/products/${id}/moderate`, {
                decision,
                note: modNote[id] || undefined,
            });
            setModNote((p) => {
                const n = { ...p };
                delete n[id];
                return n;
            });
            await loadMod();
        } catch {
            alert('Lỗi duyệt bài.');
        } finally {
            setBusyProduct(null);
        }
    };

    return (
        <div className="space-y-12">
            {newsErr && <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">{newsErr}</div>}
            {modErr && <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">{modErr}</div>}

            <section>
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-gray-200 pb-2 mb-4">
                    <h3 className="text-lg font-black uppercase tracking-tight">Tin tức (admin)</h3>
                    <button type="button" disabled={crawling} onClick={() => void triggerCrawl()} className="btn-secondary text-xs">
                        {crawling ? 'Đang gửi…' : 'Quét tin mới'}
                    </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">Tổng: {newsMeta.total}</p>
                {news.length === 0 && !newsErr ? (
                    <div className={adminEmptyStateClassName}>
                        <p className="font-medium text-gray-800">Chưa có bài viết</p>
                        <p className="mt-1 text-xs text-gray-500">Chạy crawl để cập nhật tin.</p>
                    </div>
                ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="p-3">Tiêu đề</th>
                                <th className="p-3">Trạng thái</th>
                                <th className="p-3">Danh mục</th>
                                <th className="p-3">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {news.map((a) => (
                                <tr key={a.id} className="border-t border-gray-200">
                                    <td className="p-3 max-w-[280px]">
                                        <div className="font-medium truncate">{a.title}</div>
                                        <div className="text-xs text-gray-500 font-mono">{a.slug}</div>
                                    </td>
                                    <td className="p-3">{formatNewsStatus(a.status)}</td>
                                    <td className="p-3">{a.category ?? '—'}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            {a.status !== 'published' && (
                                                <button type="button" onClick={() => void publishNews(a.id)} className="text-xs font-bold underline">
                                                    Đăng
                                                </button>
                                            )}
                                            <button type="button" onClick={() => void archiveNews(a.id)} className="text-xs font-bold underline">
                                                Lưu trữ
                                            </button>
                                            <button type="button" onClick={() => void deleteNews(a.id)} className="text-xs font-bold underline text-red-600">
                                                Xóa
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}
                <div className="flex justify-between mt-3 text-sm">
                    <button
                        type="button"
                        disabled={newsPage <= 1}
                        onClick={() => setNewsPage((p) => Math.max(1, p - 1))}
                        className="btn-secondary text-xs"
                    >
                        Trước
                    </button>
                    <button
                        type="button"
                        onClick={() => setNewsPage((p) => p + 1)}
                        className="btn-secondary text-xs"
                    >
                        Sau
                    </button>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
                    Sản phẩm đang chờ kiểm duyệt
                </h3>
                <p className="text-xs text-gray-500 mb-3">Tổng chờ: {modTotal}</p>
                {products.length === 0 ? (
                    <div className={adminEmptyStateClassName}>
                        <p className="font-medium text-gray-800">Không có sản phẩm chờ duyệt</p>
                        <p className="mt-1 text-xs text-gray-500">Khi người bán gửi bài, hàng chờ sẽ hiện ở đây.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {products.map((p) => (
                            <div key={p.id} className="rounded-lg border border-gray-200 p-4 text-sm">
                                <div className="font-bold">{p.title}</div>
                                <div className="text-xs text-gray-500 mt-1">Slug: {p.slug}</div>
                                <div className="text-xs mt-1">Người bán: {p.seller?.full_name ?? '—'}</div>
                                <input
                                    type="text"
                                    className="form-input text-sm mt-3"
                                    placeholder="Ghi chú kiểm duyệt (tuỳ chọn)"
                                    value={modNote[p.id] || ''}
                                    onChange={(e) => setModNote((prev) => ({ ...prev, [p.id]: e.target.value }))}
                                />
                                <div className="flex gap-2 mt-3">
                                    <button
                                        type="button"
                                        disabled={busyProduct === p.id}
                                        onClick={() => void moderate(p.id, 'approve')}
                                        className="btn-primary text-xs py-2 px-3"
                                    >
                                        Duyệt
                                    </button>
                                    <button
                                        type="button"
                                        disabled={busyProduct === p.id}
                                        onClick={() => void moderate(p.id, 'reject')}
                                        className="btn-secondary text-xs py-2 px-3"
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex justify-between mt-4 text-sm">
                    <button
                        type="button"
                        disabled={modPage <= 1}
                        onClick={() => setModPage((p) => Math.max(1, p - 1))}
                        className="btn-secondary text-xs"
                    >
                        Trang trước
                    </button>
                    <button type="button" onClick={() => setModPage((p) => p + 1)} className="btn-secondary text-xs">
                        Trang sau
                    </button>
                </div>
            </section>
        </div>
    );
}
