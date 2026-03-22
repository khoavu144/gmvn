import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAxiosError } from 'axios';
import type { RootState } from '../../store/store';
import type { ProductCategory } from '../../types';
import {
    createSellerProduct,
    fetchMarketplaceCategories,
    flattenProductCategories,
    type CreateSellerProductBody,
    type MarketplaceSellerApiError,
} from '../../services/marketplaceSellerService';

export default function SellerProductNewPage() {
    const user = useSelector((s: RootState) => s.auth.user);
    const navigate = useNavigate();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [productType, setProductType] = useState<'physical' | 'digital' | 'service'>('physical');
    const [price, setPrice] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [galleryText, setGalleryText] = useState('');
    const [compareAt, setCompareAt] = useState('');
    const [stock, setStock] = useState('');

    const restrictPhysical = user?.user_type === 'user' || user?.user_type === 'gym_owner';

    useEffect(() => {
        if (restrictPhysical) {
            setProductType('physical');
        }
    }, [restrictPhysical]);

    useEffect(() => {
        fetchMarketplaceCategories()
            .then((cats) => {
                setCategories(flattenProductCategories(cats));
            })
            .catch(() => setError('Không tải được danh mục.'))
            .finally(() => setLoading(false));
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const priceNum = Number(price.replace(/\./g, '').replace(/,/g, ''));
        if (!title.trim() || !categoryId || !Number.isFinite(priceNum) || priceNum < 0) {
            setError('Kiểm tra tiêu đề, danh mục và giá.');
            return;
        }
        setSaving(true);
        const gallery = galleryText
            .split(/\n|,/)
            .map((s) => s.trim())
            .filter(Boolean);
        const body: CreateSellerProductBody = {
            title: title.trim(),
            description: description.trim() || undefined,
            category_id: categoryId,
            product_type: restrictPhysical ? 'physical' : productType,
            price: priceNum,
            thumbnail_url: thumbnailUrl.trim() || undefined,
            gallery: gallery.length ? gallery : undefined,
        };
        const c = compareAt.replace(/\./g, '').replace(/,/g, '');
        if (c) body.compare_at_price = Number(c);
        const st = stock.trim();
        if (st) {
            body.stock_quantity = Number(st);
            body.track_inventory = true;
        }
        try {
            const product = await createSellerProduct(body);
            navigate(`/dashboard/marketplace/edit/${product.id}`, { replace: true });
        } catch (err) {
            if (isAxiosError(err) && err.response?.data) {
                const d = err.response.data as MarketplaceSellerApiError;
                if (d.needs_membership) {
                    setError(`${d.error ?? ''} Nâng cấp tại trang Gói thành viên.`);
                    return;
                }
                setError(d.error || 'Không tạo được sản phẩm.');
                return;
            }
            setError('Lỗi mạng hoặc máy chủ.');
        } finally {
            setSaving(false);
        }
    };

    if (user?.user_type === 'admin') {
        return (
            <div className="page-container py-12">
                <Link to="/dashboard">← Về bảng điều khiển</Link>
            </div>
        );
    }

    return (
        <div className="page-shell-muted min-h-[70vh]">
            <Helmet>
                <title>Thêm sản phẩm — Marketplace</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <div className="page-container py-8 max-w-2xl">
                <Link
                    to="/dashboard/marketplace"
                    className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-6 inline-block"
                >
                    ← Quay lại danh sách
                </Link>
                <h1 className="page-title mb-2">Thêm sản phẩm</h1>
                {restrictPhysical && (
                    <p className="text-sm text-gray-500 mb-6">
                        Tài khoản của bạn chỉ đăng được <strong>sản phẩm vật lý</strong>. Để bán gói tập / giáo án, hãy
                        nâng cấp Athlete hoặc Coach.
                    </p>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black" />
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        {error && (
                            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                                {error}{' '}
                                {error.includes('Gói') && (
                                    <Link to="/dashboard/subscriptions" className="font-bold underline">
                                        Đi tới gói thành viên
                                    </Link>
                                )}
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                Tiêu đề
                            </label>
                            <input className="form-input w-full" value={title} onChange={(e) => setTitle(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                Mô tả
                            </label>
                            <textarea
                                className="form-input w-full min-h-[100px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                Danh mục
                            </label>
                            <select
                                className="form-input w-full"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                required
                            >
                                <option value="">Chọn…</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.icon_emoji ? `${c.icon_emoji} ` : ''}
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {!restrictPhysical && (
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                    Loại sản phẩm
                                </label>
                                <select
                                    className="form-input w-full"
                                    value={productType}
                                    onChange={(e) => setProductType(e.target.value as typeof productType)}
                                >
                                    <option value="physical">Vật lý</option>
                                    <option value="digital">Kỹ thuật số</option>
                                    <option value="service">Dịch vụ</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                Giá (VND)
                            </label>
                            <input
                                className="form-input w-full"
                                inputMode="numeric"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="199000"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                Giá so sánh (tuỳ chọn)
                            </label>
                            <input
                                className="form-input w-full"
                                inputMode="numeric"
                                value={compareAt}
                                onChange={(e) => setCompareAt(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                Tồn kho (tuỳ chọn)
                            </label>
                            <input
                                className="form-input w-full"
                                inputMode="numeric"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                URL ảnh đại diện
                            </label>
                            <input
                                className="form-input w-full"
                                value={thumbnailUrl}
                                onChange={(e) => setThumbnailUrl(e.target.value)}
                                placeholder="https://…"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                Gallery (mỗi URL một dòng)
                            </label>
                            <textarea
                                className="form-input w-full min-h-[80px] font-mono text-xs"
                                value={galleryText}
                                onChange={(e) => setGalleryText(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Đang lưu…' : 'Tạo sản phẩm'}
                            </button>
                            <Link to="/dashboard/marketplace" className="btn-secondary">
                                Huỷ
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
