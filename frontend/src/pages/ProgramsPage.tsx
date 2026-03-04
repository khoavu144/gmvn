import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import apiClient from '../services/api';
import { useToast } from '../components/Toast';

interface Program {
    id: string;
    name: string;
    description: string | null;
    duration_weeks: number | null;
    difficulty: string | null;
    price_monthly: number | null;
    is_published: boolean;
    current_clients: number;
    max_clients: number;
    created_at: string;
}

interface FormData {
    name: string;
    description: string;
    duration_weeks: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    price_monthly: string;
}

const defaultForm: FormData = {
    name: '',
    description: '',
    duration_weeks: '12',
    difficulty: 'beginner',
    price_monthly: '',
};

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

    useEffect(() => {
        if (!user || user.user_type !== 'trainer') { navigate('/dashboard'); return; }
        loadPrograms();
    }, [user]);

    const loadPrograms = async () => {
        try {
            const res = await apiClient.get(`/programs/trainers/${user!.id}/programs`);
            setPrograms(res.data.programs || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
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
                price_monthly: form.price_monthly ? parseFloat(form.price_monthly) : undefined,
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
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Lỗi khi lưu');
        } finally { setSaving(false); }
    };

    const handlePublish = async (id: string) => {
        try {
            await apiClient.post(`/programs/${id}/publish`);
            loadPrograms();
            toast.success('Đã đăng gói tập thành công');
        } catch (err: any) { toast.error(err.response?.data?.error || 'Lỗi khi publish'); }
    };

    const handleEdit = (prog: Program) => {
        setEditingId(prog.id);
        setForm({
            name: prog.name,
            description: prog.description || '',
            duration_weeks: prog.duration_weeks?.toString() || '12',
            difficulty: (prog.difficulty as any) || 'beginner',
            price_monthly: prog.price_monthly?.toString() || '',
        });
        setShowForm(true);
    };

    const difficultyLabel: Record<string, string> = { beginner: 'Cơ bản', intermediate: 'Trung cấp', advanced: 'Nâng cao' };

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {ToastComponent}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-black text-sm mb-2 block font-medium">← Về Dashboard</button>
                        <h1 className="text-h2 m-0">Quản lý Gói tập</h1>
                    </div>
                    <button
                        onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
                        className="btn-primary"
                    >
                        + Tạo gói mới
                    </button>
                </div>

                {/* Create/Edit Form */}
                {showForm && (
                    <div className="card mb-8 border-black shadow-sm">
                        <h2 className="card-header">{editingId ? 'Chỉnh sửa gói tập' : 'Tạo gói tập mới'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Tên gói tập *</label>
                                <input
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    className="form-input"
                                    placeholder="VD: 12 tuần giảm cân hiệu quả"
                                />
                            </div>
                            <div>
                                <label className="form-label">Mô tả</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    rows={3}
                                    className="form-input"
                                    placeholder="Mô tả chi tiết về chương trình..."
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="form-label">Số tuần</label>
                                    <input type="number" value={form.duration_weeks} onChange={e => setForm(f => ({ ...f, duration_weeks: e.target.value }))}
                                        className="form-input" />
                                </div>
                                <div>
                                    <label className="form-label">Cấp độ</label>
                                    <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as any }))}
                                        className="form-input">
                                        <option value="beginner">Cơ bản</option>
                                        <option value="intermediate">Trung cấp</option>
                                        <option value="advanced">Nâng cao</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Giá/tháng (đ)</label>
                                    <input type="number" value={form.price_monthly} onChange={e => setForm(f => ({ ...f, price_monthly: e.target.value }))}
                                        className="form-input" placeholder="500000" />
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                                <button onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary px-6">Hủy</button>
                                <button onClick={handleSubmit} disabled={saving || !form.name.trim()}
                                    className="btn-primary px-8">
                                    {saving ? 'Đang lưu...' : (editingId ? 'Cập nhật' : 'Tạo gói tập')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Programs List */}
                {loading ? (
                    <div className="text-center text-gray-500 py-16 text-sm">Đang tải...</div>
                ) : programs.length === 0 ? (
                    <div className="card text-center py-16 border-dashed">
                        <p className="text-gray-500 text-sm">Bạn chưa có gói tập nào.</p>
                        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }} className="mt-4 text-black font-semibold underline text-sm">Tạo gói đầu tiên ngay</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {programs.map(prog => (
                            <div key={prog.id} className="card">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg text-black">{prog.name}</h3>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs border ${prog.is_published ? 'border-black bg-black text-white' : 'border-gray-300 bg-gray-100 text-gray-500'}`}>
                                                {prog.is_published ? 'Đã đăng' : 'Bản nháp'}
                                            </span>
                                        </div>
                                        {prog.description && <p className="text-gray-600 text-sm line-clamp-2">{prog.description}</p>}
                                        <div className="flex flex-wrap gap-2 text-[10px] font-medium uppercase tracking-wider text-gray-600">
                                            {prog.duration_weeks && <span className="bg-gray-100 px-2 py-1 rounded-xs">{prog.duration_weeks} tuần</span>}
                                            {prog.difficulty && <span className="bg-gray-100 px-2 py-1 rounded-xs">{difficultyLabel[prog.difficulty] || prog.difficulty}</span>}
                                            {prog.price_monthly && <span className="bg-gray-100 px-2 py-1 rounded-xs">{Number(prog.price_monthly).toLocaleString('vi-VN')} ₫/th</span>}
                                            <span className="bg-gray-100 px-2 py-1 rounded-xs">{prog.current_clients}/{prog.max_clients} slot</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t border-gray-100 sm:border-0">
                                        <button onClick={() => handleEdit(prog)} className="btn-secondary flex-1 sm:flex-none">Sửa</button>
                                        {!prog.is_published && (
                                            <button onClick={() => handlePublish(prog.id)} className="btn-primary flex-1 sm:flex-none">Đăng</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
