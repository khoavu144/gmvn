import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAxiosError } from 'axios';
import type { RootState } from '../../store/store';
import type { ProductCategory } from '../../types';
import {
    fetchMarketplaceCategories,
    flattenProductCategories,
    getSellerProduct,
    updateSellerProduct,
    updateSellerTrainingPackage,
    type MarketplaceSellerApiError,
    type SellerUpdateProductBody,
} from '../../services/marketplaceSellerService';

const GOALS = [
    { v: 'general_fitness', l: 'Thể lực tổng hợp' },
    { v: 'fat_loss', l: 'Giảm mỡ' },
    { v: 'muscle_gain', l: 'Tăng cơ' },
    { v: 'endurance', l: 'Sức bền' },
    { v: 'flexibility', l: 'Linh hoạt' },
    { v: 'rehabilitation', l: 'Phục hồi' },
    { v: 'competition_prep', l: 'Chuẩn bị thi đấu' },
] as const;

const LEVELS = [
    { v: 'beginner', l: 'Cơ bản' },
    { v: 'intermediate', l: 'Trung bình' },
    { v: 'advanced', l: 'Nâng cao' },
    { v: 'all', l: 'Mọi cấp' },
] as const;

export default function SellerProductEditPage() {
    const { productId } = useParams<{ productId: string }>();
    const user = useSelector((s: RootState) => s.auth.user);
    const navigate = useNavigate();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingTp, setSavingTp] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [productType, setProductType] = useState<'physical' | 'digital' | 'service'>('physical');
    const [price, setPrice] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [galleryText, setGalleryText] = useState('');
    const [status, setStatus] = useState<'draft' | 'archived' | ''>('');
    const [slug, setSlug] = useState('');

    const [goal, setGoal] = useState('general_fitness');
    const [level, setLevel] = useState('all');
    const [durationWeeks, setDurationWeeks] = useState('8');
    const [sessionsPerWeek, setSessionsPerWeek] = useState('4');
    const [includesNutrition, setIncludesNutrition] = useState(false);
    const [includesVideo, setIncludesVideo] = useState(false);

    const restrictPhysical = user?.user_type === 'user' || user?.user_type === 'gym_owner';

    const [loadedTraining, setLoadedTraining] = useState(false);

    useEffect(() => {
        if (!productId) return;
        let cancelled = false;
        setLoading(true);
        Promise.all([getSellerProduct(productId), fetchMarketplaceCategories()])
            .then(([prod, cats]) => {
                if (cancelled) return;
                setCategories(flattenProductCategories(cats));
                setTitle(prod.title);
                setDescription(prod.description || '');
                setCategoryId(prod.category_id);
                setProductType(prod.product_type);
                setPrice(String(prod.price));
                setThumbnailUrl(prod.thumbnail_url || '');
                setGalleryText((prod.gallery || []).join('\n'));
                setSlug(prod.slug);
                if (prod.training_package) {
                    setLoadedTraining(true);
                    const tp = prod.training_package;
                    setGoal(tp.goal);
                    setLevel(tp.level);
                    setDurationWeeks(String(tp.duration_weeks));
                    setSessionsPerWeek(String(tp.sessions_per_week));
                    setIncludesNutrition(tp.includes_nutrition);
                    setIncludesVideo(tp.includes_video);
                } else {
                    setLoadedTraining(false);
                }
            })
            .catch(() => {
                if (!cancelled) navigate('/dashboard/marketplace', { replace: true });
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [productId, navigate]);

    const saveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId) return;
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
        const body: SellerUpdateProductBody = {
            title: title.trim(),
            description: description.trim() || undefined,
            category_id: categoryId,
            price: priceNum,
            thumbnail_url: thumbnailUrl.trim() || undefined,
            gallery: gallery.length ? gallery : undefined,
        };
        if (!loadedTraining && !restrictPhysical) {
            body.product_type = productType;
        }
        if (status) {
            body.status = status;
        }
        try {
            const p = await updateSellerProduct(productId, body);
            setSlug(p.slug);
            setStatus('');
        } catch (err) {
            if (isAxiosError(err) && err.response?.data) {
                const d = err.response.data as MarketplaceSellerApiError;
                setError(d.error || 'Không lưu được.');
                return;
            }
            setError('Lỗi mạng hoặc máy chủ.');
        } finally {
            setSaving(false);
        }
    };

    const saveTraining = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!productId || !loadedTraining) return;
        const dw = Number(durationWeeks);
        const spw = Number(sessionsPerWeek);
        if (!Number.isFinite(dw) || dw < 1 || !Number.isFinite(spw) || spw < 1) {
            setError('Tuần và buổi/tuần không hợp lệ.');
            return;
        }
        setSavingTp(true);
        setError(null);
        try {
            await updateSellerTrainingPackage(productId, {
                goal,
                level,
                duration_weeks: dw,
                sessions_per_week: spw,
                includes_nutrition: includesNutrition,
                includes_video: includesVideo,
            });
        } catch {
            setError('Không lưu được chi tiết gói tập.');
        } finally {
            setSavingTp(false);
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
                <title>Sửa sản phẩm — Marketplace</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <div className="page-container py-8 max-w-2xl">
                <Link
                    to="/dashboard/marketplace"
                    className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-6 inline-block"
                >
                    ← Quay lại danh sách
                </Link>
                <h1 className="page-title mb-2">Sửa sản phẩm</h1>
                {slug && (
                    <p className="text-sm text-gray-500 mb-6">
                        Đường dẫn:{' '}
                        <Link
                            to={`/marketplace/product/${slug}`}
                            className="underline font-mono text-xs"
                            target="_blank"
                            rel="noreferrer"
                        >
                            /marketplace/product/{slug}
                        </Link>
                    </p>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black" />
                    </div>
                ) : (
                    <>
                        <form
                            onSubmit={saveProduct}
                            className="space-y-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8"
                        >
                            {error && (
                                <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                                    {error}
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
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.icon_emoji ? `${c.icon_emoji} ` : ''}
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {!loadedTraining && !restrictPhysical && (
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
                                    required
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
                            <div>
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                    Trạng thái hiển thị (tuỳ chọn)
                                </label>
                                <select
                                    className="form-input w-full"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as typeof status)}
                                >
                                    <option value="">Giữ nguyên</option>
                                    <option value="draft">Bản nháp</option>
                                    <option value="archived">Gỡ / lưu trữ</option>
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Chọn &quot;Gỡ / lưu trữ&quot; để ẩn khỏi chợ công khai (nếu đang active).
                                </p>
                            </div>
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Đang lưu…' : 'Lưu sản phẩm'}
                            </button>
                        </form>

                        {loadedTraining && (
                            <form
                                onSubmit={saveTraining}
                                className="space-y-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                            >
                                <h2 className="text-lg font-black uppercase tracking-tight">Chi tiết gói tập</h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                            Mục tiêu
                                        </label>
                                        <select className="form-input w-full" value={goal} onChange={(e) => setGoal(e.target.value)}>
                                            {GOALS.map((g) => (
                                                <option key={g.v} value={g.v}>
                                                    {g.l}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                            Cấp độ
                                        </label>
                                        <select className="form-input w-full" value={level} onChange={(e) => setLevel(e.target.value)}>
                                            {LEVELS.map((g) => (
                                                <option key={g.v} value={g.v}>
                                                    {g.l}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                            Số tuần
                                        </label>
                                        <input
                                            className="form-input w-full"
                                            inputMode="numeric"
                                            value={durationWeeks}
                                            onChange={(e) => setDurationWeeks(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 block mb-1">
                                            Buổi / tuần
                                        </label>
                                        <input
                                            className="form-input w-full"
                                            inputMode="numeric"
                                            value={sessionsPerWeek}
                                            onChange={(e) => setSessionsPerWeek(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-6">
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={includesNutrition}
                                            onChange={(e) => setIncludesNutrition(e.target.checked)}
                                        />
                                        Có dinh dưỡng
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={includesVideo}
                                            onChange={(e) => setIncludesVideo(e.target.checked)}
                                        />
                                        Có video
                                    </label>
                                </div>
                                <button type="submit" className="btn-secondary" disabled={savingTp}>
                                    {savingTp ? 'Đang lưu…' : 'Lưu gói tập'}
                                </button>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
