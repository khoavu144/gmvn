import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { logger } from '../lib/logger';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import apiClient from '../services/api';
import { useToast } from '../components/Toast';
import { uploadService } from '../services/uploadService';
import type { Program } from '../types';

const Select = lazy(() => import('react-select'));
const CreatableSelect = lazy(() => import('react-select/creatable'));
const ImageCropperModal = lazy(() =>
    import('../components/ImageCropperModal').then((module) => ({ default: module.ImageCropperModal }))
);

interface FormData {
    name: string;
    description: string;
    duration_weeks: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';

    training_format: 'online' | 'offline_1on1' | 'offline_group' | 'hybrid';
    included_features: string[];
    pricing_type: 'lump_sum' | 'monthly' | 'per_session';
    price_monthly: string; // Tái sử dụng field này cho input, parse ra DB sau
    price_one_time: string;
    price_per_session: string;

    training_goals: string[];
    prerequisites: string;
    cover_image_url: string;
}

const defaultForm: FormData = {
    name: '',
    description: '',
    duration_weeks: '12',
    difficulty: 'beginner',
    training_format: 'online',
    included_features: [],
    pricing_type: 'monthly',
    price_monthly: '',
    price_one_time: '',
    price_per_session: '',
    training_goals: [],
    prerequisites: '',
    cover_image_url: ''
};

const featureOptions = [
    { value: 'Giáo án tập luyện cá nhân hóa', label: 'Giáo án tập luyện cá nhân hóa' },
    { value: 'Thực đơn dinh dưỡng', label: 'Thực đơn dinh dưỡng' },
    { value: 'Chữa form qua video', label: 'Chữa form qua video' },
    { value: 'Check-in hàng tuần', label: 'Check-in hàng tuần' },
    { value: 'Hỗ trợ chat 24/7', label: 'Hỗ trợ chat 24/7' },
    { value: 'Tài liệu kiến thức', label: 'Tài liệu kiến thức' },
];

const goalOptions = [
    { value: 'Giảm mỡ', label: 'Giảm mỡ (Fat Loss)' },
    { value: 'Tăng cơ', label: 'Tăng cơ (Hypertrophy)' },
    { value: 'Tăng sức mạnh', label: 'Tăng sức mạnh (Powerlifting)' },
    { value: 'Phục hồi chấn thương', label: 'Phục hồi chấn thương (Rehab)' },
    { value: 'Chuẩn bị thi đấu', label: 'Chuẩn bị thi đấu (Prep)' },
];

const formatOptions = [
    { id: 'online', title: 'Online Coaching', desc: 'Coach từ xa hoàn toàn' },
    { id: 'offline_1on1', title: 'Offline 1 kèm 1', desc: 'Huấn luyện trực tiếp tại phòng' },
    { id: 'offline_group', title: 'Offline Nhóm', desc: 'Huấn luyện nhóm nhỏ' },
    { id: 'hybrid', title: 'Hybrid', desc: 'Kết hợp trực tiếp và từ xa' },
];

const pricingTypeOptions = [
    { id: 'lump_sum', title: 'Trả một lần (Trọn gói)' },
    { id: 'monthly', title: 'Trả hàng tháng' },
    { id: 'per_session', title: 'Trả theo buổi' },
];

const prereqOptions = [
    { value: 'Yêu cầu có thẻ đến phòng gym', label: 'Yêu cầu đến phòng gym' },
    { value: 'Có thể tập tại nhà không cần tạ', label: 'Tập tại nhà (Bodyweight)' },
    { value: 'Cần tạ đơn cơ bản', label: 'Thiết bị cơ bản (Dumbbell/Band)' },
];

const InputFallback = () => <div className="h-10 w-full animate-pulse rounded-xs bg-gray-100" />;

export default function ProgramsPage() {
    const { toast, ToastComponent } = useToast();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState<FormData>(defaultForm);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Upload state
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        loadPrograms();
    }, [user, navigate]);

    const loadPrograms = async () => {
        try {
            setError(null);
            const res = await apiClient.get(`/programs/trainers/${user!.id}/programs`);
            setPrograms(res.data.programs || []);
        } catch (err: any) { 
            logger.error(err); 
            setError('Không thể tải danh sách gói tập.');
        } finally { setLoading(false); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImageFile(file);
            setIsCropModalOpen(true);
        }
        if (e.target) e.target.value = '';
    };

    const handleCropComplete = async (croppedBlob: Blob) => {
        setIsUploading(true);
        try {
            const originalName = selectedImageFile?.name || 'program.jpg';
            const url = await uploadService.uploadImage(croppedBlob, 'programs', originalName);
            setForm(prev => ({ ...prev, cover_image_url: url }));
        } catch (error) {
            toast.error('Upload ảnh thất bại! Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
            setSelectedImageFile(null);
        }
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const payload = {
                name: form.name,
                description: form.description || undefined,
                duration_weeks: form.duration_weeks ? parseInt(form.duration_weeks) : undefined,
                difficulty: form.difficulty,
                // New Fields
                training_format: form.training_format,
                included_features: form.included_features.length > 0 ? form.included_features : undefined,
                pricing_type: form.pricing_type,
                price_monthly: form.pricing_type === 'monthly' && form.price_monthly ? parseFloat(form.price_monthly) : null,
                price_one_time: form.pricing_type === 'lump_sum' && form.price_one_time ? parseFloat(form.price_one_time) : null,
                price_per_session: form.pricing_type === 'per_session' && form.price_per_session ? parseFloat(form.price_per_session) : null,
                training_goals: form.training_goals.length > 0 ? form.training_goals : undefined,
                prerequisites: form.prerequisites || undefined,
                cover_image_url: form.cover_image_url || undefined,
            };

            if (editingId) {
                await apiClient.put(`/programs/${editingId}`, payload);
            } else {
                await apiClient.post('/programs', payload);
            }
            setForm(defaultForm);
            setShowForm(false);
            setEditingId(null);
            loadPrograms();
            toast.success('Lưu gói tập thành công');
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Lỗi khi lưu');
        } finally { setSaving(false); }
    };

    const handlePublish = async (id: string) => {
        try {
            await apiClient.post(`/programs/${id}/publish`);
            loadPrograms();
            toast.success('Đã đăng gói tập ra cộng đồng');
        } catch (err: any) { toast.error(err.response?.data?.error || 'Lỗi khi publish'); }
    };

    const handleEdit = (prog: Program) => {
        setEditingId(prog.id);
        setForm({
            name: prog.name,
            description: prog.description || '',
            duration_weeks: prog.duration_weeks?.toString() || '12',
            difficulty: (prog.difficulty as any) || 'beginner',
            training_format: prog.training_format || 'online',
            included_features: prog.included_features || [],
            pricing_type: prog.pricing_type || 'monthly',
            price_monthly: prog.price_monthly?.toString() || '',
            price_one_time: prog.price_one_time?.toString() || '',
            price_per_session: prog.price_per_session?.toString() || '',
            training_goals: prog.training_goals || [],
            prerequisites: prog.prerequisites || '',
            cover_image_url: prog.cover_image_url || '',
        });
        setShowForm(true);
    };

    const formatLabel: Record<string, string> = { online: 'Online', offline_1on1: '1-kèm-1', offline_group: 'Tập nhóm', hybrid: 'Hybrid' };

    return (
        <div className="page-shell">
            {ToastComponent}
            <div className="page-container">
                <section className="page-header">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <button onClick={() => navigate('/dashboard')} className="back-link mb-3">← Về Dashboard</button>
                            <p className="page-kicker">Program Workspace</p>
                            <h1 className="page-title">Quản lý Gói tập</h1>
                            <p className="page-description">
                                Tạo, chỉnh sửa và công bố các gói tập với bố cục nhất quán theo phong cách homepage của hệ thống.
                            </p>
                        </div>
                        {!showForm && (
                            <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }} className="btn-primary self-start sm:self-auto">
                                + Tạo gói mới
                            </button>
                        )}
                    </div>
                </section>

                {/* Create/Edit Form */}
                {showForm && (
                    <div className="card mb-8 border-black shadow-sm overflow-visible">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                            <h2 className="text-xl font-bold text-black m-0">{editingId ? 'Chỉnh sửa gói tập' : 'Tạo gói tập mới'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-black text-sm font-medium">Đóng</button>
                        </div>

                        <div className="space-y-8">

                            {/* Core Info */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">1. Thông tin cơ bản</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        <div className="sm:col-span-2">
                                            <label className="form-label">Tên gói tập *</label>
                                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="form-input" placeholder="VD: 12 tuần Transform toàn diện" />
                                        </div>
                                        <div>
                                            <label className="form-label">Hình thức huấn luyện</label>
                                            <select value={form.training_format} onChange={e => setForm(f => ({ ...f, training_format: e.target.value as any }))} className="form-input font-medium text-black">
                                                {formatOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.title}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-label">Ảnh bìa minh hoạ (Tỷ lệ dẹt)</label>
                                        <div className="flex flex-col sm:flex-row items-center gap-4">
                                            {form.cover_image_url ? (
                                                <div className="relative w-full sm:w-64 aspect-[16/9] bg-gray-100 border border-gray-200 rounded overflow-hidden flex-shrink-0">
                                                    <img src={form.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => setForm(f => ({ ...f, cover_image_url: '' }))} className="absolute top-2 right-2 bg-white/90 text-black px-2 py-1 rounded text-xs font-medium hover:bg-white transition shadow">
                                                        Xóa
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="w-full sm:w-64 aspect-[16/9] bg-gray-50 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 flex-shrink-0">
                                                    <i className="fi fi-rr-picture text-2xl mb-1"></i>
                                                    <span className="text-xs font-medium">Chưa có ảnh</span>
                                                </div>
                                            )}
                                            <div>
                                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="btn-secondary text-sm">
                                                    {isUploading ? 'Đang tải lên...' : 'Tải lên từ thiết bị'}
                                                </button>
                                                <p className="text-xs text-gray-500 mt-2">Nên dùng ảnh chụp Form khách hàng thực tế hoặc không gian phòng tập.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="form-label">Mô tả tổng quan</label>
                                        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="form-input" placeholder="Hãy viết vài dòng hấp dẫn về chương trình này..." />
                                    </div>
                                </div>
                            </section>

                            {/* Details */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">2. Đối tượng & Chi tiết</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="form-label">Mục tiêu hình thể</label>
                                        <Suspense fallback={<InputFallback />}>
                                            <Select
                                                isMulti
                                                options={goalOptions}
                                                placeholder="Chọn các mục tiêu..."
                                                value={goalOptions.filter(o => form.training_goals.includes(o.value))}
                                                onChange={(selected) => {
                                                    const values = Array.isArray(selected)
                                                        ? selected.map((item: any) => String(item.value))
                                                        : [];
                                                    setForm(f => ({ ...f, training_goals: values }));
                                                }}
                                                className="text-sm"
                                                styles={{ control: (b) => ({ ...b, borderColor: '#e5e7eb', borderRadius: '2px' }) }}
                                            />
                                        </Suspense>
                                    </div>
                                    <div>
                                        <label className="form-label">Yêu cầu đầu vào (Prerequisites)</label>
                                        <Suspense fallback={<InputFallback />}>
                                            <CreatableSelect
                                                isClearable
                                                options={prereqOptions}
                                                placeholder="Chọn hoặc nhập yêu cầu..."
                                                value={form.prerequisites ? { value: form.prerequisites, label: form.prerequisites } : null}
                                                onChange={(val) => {
                                                    const nextValue = val && typeof val === 'object' && 'value' in val
                                                        ? String((val as any).value)
                                                        : '';
                                                    setForm(f => ({ ...f, prerequisites: nextValue }));
                                                }}
                                                className="text-sm"
                                                styles={{ control: (b) => ({ ...b, borderColor: '#e5e7eb', borderRadius: '2px' }) }}
                                            />
                                        </Suspense>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                                    <div>
                                        <label className="form-label">Checklist Quyền lợi đi kèm</label>
                                        <Suspense fallback={<InputFallback />}>
                                            <Select
                                                isMulti
                                                options={featureOptions}
                                                placeholder="Chọn các quyền lợi..."
                                                value={featureOptions.filter(o => form.included_features.includes(o.value))}
                                                onChange={(selected) => {
                                                    const values = Array.isArray(selected)
                                                        ? selected.map((item: any) => String(item.value))
                                                        : [];
                                                    setForm(f => ({ ...f, included_features: values }));
                                                }}
                                                className="text-sm"
                                                styles={{ control: (b) => ({ ...b, borderColor: '#e5e7eb', borderRadius: '2px' }) }}
                                            />
                                        </Suspense>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="form-label">Cấp độ</label>
                                            <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as any }))} className="form-input">
                                                <option value="beginner">Cơ bản</option>
                                                <option value="intermediate">Trung cấp</option>
                                                <option value="advanced">Nâng cao</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="form-label">Thời lượng (Tuần)</label>
                                            <input type="number" value={form.duration_weeks} onChange={e => setForm(f => ({ ...f, duration_weeks: e.target.value }))} className="form-input" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Pricing */}
                            <section>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">3. Cấu trúc giá</h3>
                                <div className="bg-gray-50 p-4 border border-gray-200 rounded-md">
                                    <div className="flex gap-4 mb-4 border-b border-gray-200 pb-4">
                                        {pricingTypeOptions.map(opt => (
                                            <label key={opt.id} className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                                                <input
                                                    type="radio"
                                                    name="pricing_type"
                                                    value={opt.id}
                                                    checked={form.pricing_type === opt.id}
                                                    onChange={() => setForm(f => ({ ...f, pricing_type: opt.id as any }))}
                                                    className="text-black border-gray-300 focus:ring-black"
                                                />
                                                {opt.title}
                                            </label>
                                        ))}
                                    </div>

                                    {form.pricing_type === 'monthly' && (
                                        <div>
                                            <label className="form-label">Mức phí mỗi tháng (VNĐ)</label>
                                            <input type="number" value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: e.target.value }))} className="form-input md:w-1/2" placeholder="VD: 500000" />
                                        </div>
                                    )}
                                    {form.pricing_type === 'lump_sum' && (
                                        <div>
                                            <label className="form-label">Phí thu 1 lần trọn khóa (VNĐ)</label>
                                            <input type="number" value={form.price_one_time} onChange={e => setForm(f => ({ ...f, price_one_time: e.target.value }))} className="form-input md:w-1/2" placeholder="VD: 2500000" />
                                        </div>
                                    )}
                                    {form.pricing_type === 'per_session' && (
                                        <div>
                                            <label className="form-label">Mức phí mỗi buổi tập (VNĐ)</label>
                                            <input type="number" value={form.price_per_session} onChange={e => setForm(f => ({ ...f, price_per_session: e.target.value }))} className="form-input md:w-1/2" placeholder="VD: 300000" />
                                            <p className="text-xs text-gray-500 mt-1">Dành cho các gói yêu cầu mua theo số lượng buổi trực tiếp.</p>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary px-6 py-2.5">Thoát</button>
                                <button onClick={handleSubmit} disabled={saving || !form.name.trim()}
                                    className="btn-primary px-8 py-2.5 text-sm">
                                    {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật thay đổi' : 'Tạo gói tập ngay')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Programs List */}
                {!showForm && (
                    <>
                        {loading ? (
                            <div className="grid grid-cols-1 gap-6 animate-pulse">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="card !p-0 flex flex-col sm:flex-row shadow-sm border border-gray-100">
                                        <div className="sm:w-48 aspect-[16/9] sm:aspect-auto bg-gray-200"></div>
                                        <div className="p-5 flex-1 flex flex-col justify-center">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="h-6 bg-gray-200 w-1/2 rounded-full"></div>
                                                <div className="h-6 bg-gray-200 w-16 rounded-full"></div>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="h-3 bg-gray-200 w-full rounded-sm"></div>
                                                <div className="h-3 bg-gray-200 w-5/6 rounded-sm"></div>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-5 bg-gray-200 w-12 rounded-sm"></div>
                                                <div className="h-5 bg-gray-200 w-16 rounded-sm"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="card text-center py-16 border-dashed border-red-200">
                                <p className="text-red-500 text-sm mb-4">{error}</p>
                                <button onClick={() => { setLoading(true); loadPrograms(); }} className="text-xs font-bold text-black border border-black px-4 py-2 rounded-full hover:bg-black hover:text-white transition">Thử lại</button>
                            </div>
                        ) : programs.length === 0 ? (
                            <div className="card text-center py-16 border-dashed">
                                <p className="text-gray-500 text-sm">Bạn chưa thiết lập gói huấn luyện nào.</p>
                                <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }} className="mt-4 text-black font-semibold underline text-sm">Tạo gói đầu tiên ngay</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {programs.map(prog => {
                                    const priceText = prog.pricing_type === 'monthly' ? `${Number(prog.price_monthly).toLocaleString('vi-VN')} ₫/th`
                                        : prog.pricing_type === 'lump_sum' ? `${Number(prog.price_one_time).toLocaleString('vi-VN')} ₫/Khoá`
                                            : `${Number(prog.price_per_session).toLocaleString('vi-VN')} ₫/Buổi`;

                                    return (
                                        <div key={prog.id} className="card overflow-hidden !p-0 flex flex-col sm:flex-row">
                                            {/* Thumbnail area */}
                                            <div className="sm:w-48 bg-gray-100 aspect-[16/9] sm:aspect-auto flex-shrink-0 relative">
                                                {prog.cover_image_url ? (
                                                    <img src={prog.cover_image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                                        <i className="fi fi-rr-dumbbell text-2xl"></i>
                                                    </div>
                                                )}
                                                <div className="absolute top-2 left-2 flex gap-1">
                                                    <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                                                        {formatLabel[prog.training_format] || 'Online'}
                                                    </span>
                                                    {prog.is_published && (
                                                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase">
                                                            Public
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Content */}
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start gap-4 mb-2">
                                                    <h3 className="font-bold text-lg text-black m-0 leading-tight">{prog.name}</h3>
                                                    <span className="text-black font-bold whitespace-nowrap">{priceText}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">{prog.description}</p>

                                                <div className="flex flex-wrap gap-1.5 mt-auto">
                                                    {prog.duration_weeks && <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded-xs font-medium">{prog.duration_weeks} tuần</span>}
                                                    {prog.training_goals?.slice(0, 2).map(g => (
                                                        <span key={g} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded-xs font-medium">{g}</span>
                                                    ))}
                                                    {prog.included_features?.length ? (
                                                        <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-1 rounded-xs font-medium">+{prog.included_features.length} quyền lợi</span>
                                                    ) : null}
                                                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-xs font-medium ml-auto">
                                                        {prog.current_clients}/{prog.max_clients} slots
                                                    </span>
                                                </div>

                                                <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-gray-100">
                                                    <button onClick={() => handleEdit(prog)} className="text-sm font-medium text-gray-600 hover:text-black px-3 py-1.5 hover:bg-gray-100 transition rounded-xs">Sửa gói</button>
                                                    {!prog.is_published && (
                                                        <button onClick={() => handlePublish(prog.id)} className="text-sm font-bold text-white bg-black hover:bg-zinc-800 px-4 py-1.5 transition rounded-xs shadow-sm">Phát hành</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                <Suspense fallback={null}>
                    <ImageCropperModal
                        isOpen={isCropModalOpen}
                        onClose={() => { setIsCropModalOpen(false); setSelectedImageFile(null); }}
                        imageFile={selectedImageFile}
                        onCropComplete={handleCropComplete}
                        aspectRatio={16 / 9}
                        title="Cắt ảnh bìa (Gói tập)"
                    />
                </Suspense>

            </div>
        </div>
    );
}

