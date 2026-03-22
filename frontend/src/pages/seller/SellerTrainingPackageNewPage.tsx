import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { isAxiosError } from 'axios';
import type { RootState } from '../../store/store';
import type { ProductCategory } from '../../types';
import {
    createSellerTrainingPackage,
    fetchMarketplaceCategories,
    flattenProductCategories,
    type CreateSellerTrainingPackageBody,
    type MarketplaceSellerApiError,
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

export default function SellerTrainingPackageNewPage() {
    const user = useSelector((s: RootState) => s.auth.user);
    const navigate = useNavigate();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState('');
    const [goal, setGoal] = useState<string>('general_fitness');
    const [level, setLevel] = useState<string>('all');
    const [durationWeeks, setDurationWeeks] = useState('8');
    const [sessionsPerWeek, setSessionsPerWeek] = useState('4');
    const [includesNutrition, setIncludesNutrition] = useState(false);
    const [includesVideo, setIncludesVideo] = useState(false);

    const allowed = user?.user_type === 'athlete' || user?.user_type === 'trainer';

    useEffect(() => {
        fetchMarketplaceCategories()
            .then((cats) => setCategories(flattenProductCategories(cats)))
            .catch(() => setError('Không tải được danh mục.'))
            .finally(() => setLoading(false));
    }, []);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const priceNum = Number(price.replace(/\./g, '').replace(/,/g, ''));
        const dw = Number(durationWeeks);
        const spw = Number(sessionsPerWeek);
        if (!title.trim() || !categoryId || !Number.isFinite(priceNum) || priceNum < 0) {
            setError('Kiểm tra tiêu đề, danh mục và giá.');
            return;
        }
        if (!Number.isFinite(dw) || dw < 1 || !Number.isFinite(spw) || spw < 1) {
            setError('Tuần và buổi/tuần phải là số hợp lệ.');
            return;
        }
        setSaving(true);
        const body: CreateSellerTrainingPackageBody = {
            title: title.trim(),
            description: description.trim() || undefined,
            category_id: categoryId,
            product_type: 'digital',
            price: priceNum,
            thumbnail_url: thumbnailUrl.trim() || undefined,
            goal,
            level,
            duration_weeks: dw,
            sessions_per_week: spw,
            includes_nutrition: includesNutrition,
            includes_video: includesVideo,
        };
        try {
            const { product } = await createSellerTrainingPackage(body);
            navigate(`/dashboard/marketplace/edit/${product.id}`, { replace: true });
        } catch (err) {
            if (isAxiosError(err) && err.response?.data) {
                const d = err.response.data as MarketplaceSellerApiError;
                if (d.forbidden_training_package) {
                    setError(d.error || 'Bạn không được phép đăng gói tập.');
                    return;
                }
                if (d.needs_membership) {
                    setError(`${d.error ?? ''}`);
                    return;
                }
                setError(d.error || 'Không tạo được gói tập.');
                return;
            }
            setError('Lỗi mạng hoặc máy chủ.');
        } finally {
            setSaving(false);
        }
    };

    if (!allowed) {
        return (
            <div className="page-container gv-pad-y-lg max-w-lg">
                <Helmet>
                    <title>Gói tập — Marketplace</title>
                </Helmet>
                <p className="text-gray-500 mb-4">Chỉ Athlete hoặc Coach mới đăng được gói tập / giáo án.</p>
                <Link to="/dashboard/marketplace" className="btn-secondary">
                    ← Quay lại
                </Link>
            </div>
        );
    }

    return (
        <div className="page-shell-muted min-h-[70vh]">
            <Helmet>
                <title>Thêm gói tập — Marketplace</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <div className="page-container gv-pad-y max-w-2xl">
                <Link
                    to="/dashboard/marketplace"
                    className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black mb-6 inline-block"
                >
                    ← Quay lại danh sách
                </Link>
                <h1 className="page-title mb-6">Thêm gói tập / giáo án</h1>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black" />
                    </div>
                ) : (
                    <form onSubmit={submit} className="space-y-4 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        {error && (
                            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                                {error}{' '}
                                {error.includes('listing') || error.includes('membership') ? (
                                    <Link to="/dashboard/subscriptions" className="font-bold underline">
                                        Gói thành viên
                                    </Link>
                                ) : null}
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
                        <div className="flex gap-3 pt-2">
                            <button type="submit" className="btn-primary" disabled={saving}>
                                {saving ? 'Đang lưu…' : 'Tạo gói tập'}
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
