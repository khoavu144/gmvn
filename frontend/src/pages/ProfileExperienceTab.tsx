import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addExperienceThunk, updateExperienceThunk, deleteExperienceThunk } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import type { TrainerExperience } from '../types';

export function ProfileExperienceTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { experience, successMsg } = useSelector((s: RootState) => s.profile);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState({
        title: '', organization: '', start_date: '', end_date: '',
        is_current: false, description: '', experience_type: 'work' as TrainerExperience['experience_type'],
    });

    const resetForm = () => setForm({
        title: '', organization: '', start_date: '', end_date: '',
        is_current: false, description: '', experience_type: 'work',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...form, end_date: form.is_current ? null : form.end_date || null };
        if (editingId) {
            dispatch(updateExperienceThunk({ id: editingId, data: payload }));
            setEditingId(null);
        } else {
            dispatch(addExperienceThunk(payload as any));
        }
        resetForm();
    };

    const startEdit = (exp: TrainerExperience) => {
        setEditingId(exp.id);
        setForm({
            title: exp.title, organization: exp.organization,
            start_date: exp.start_date?.slice(0, 10) || '',
            end_date: exp.end_date?.slice(0, 10) || '',
            is_current: exp.is_current,
            description: exp.description || '',
            experience_type: exp.experience_type,
        });
    };

    const typeLabels: Record<string, string> = {
        work: 'Công việc', education: 'Học vấn',
        certification: 'Chứng chỉ', achievement: 'Thành tích',
    };

    return (
        <div className="space-y-6">
            {successMsg && (
                <div className="bg-gray-50 border border-black text-black px-4 py-3 rounded-xs text-sm">
                    {successMsg}
                </div>
            )}
            <div className="card">
                <h3 className="card-header">
                    {editingId ? 'Chỉnh sửa kinh nghiệm' : 'Thêm kinh nghiệm'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Chức danh / Tên khoá học</label>
                            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                required className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Tổ chức / Trường</label>
                            <input value={form.organization} onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                                required className="form-input" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="form-label">Loại</label>
                            <select value={form.experience_type} onChange={e => setForm(f => ({ ...f, experience_type: e.target.value as any }))}
                                className="form-input">
                                <option value="work">Công việc</option>
                                <option value="education">Học vấn</option>
                                <option value="certification">Chứng chỉ</option>
                                <option value="achievement">Thành tích</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Từ ngày</label>
                            <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                                required className="form-input" />
                        </div>
                        <div>
                            <label className="form-label">Đến ngày</label>
                            <input type="date" value={form.end_date} disabled={form.is_current}
                                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                className="form-input" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer w-fit">
                        <input type="checkbox" checked={form.is_current}
                            onChange={e => setForm(f => ({ ...f, is_current: e.target.checked, end_date: '' }))}
                            className="rounded-xs border-gray-300 text-black focus:ring-black" />
                        Vẫn đang diễn ra
                    </label>
                    <div>
                        <label className="form-label">Mô tả</label>
                        <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            className="form-input resize-none" />
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-gray-200">
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); resetForm(); }}
                                className="btn-secondary">
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {experience.length > 0 && (
                <div className="card">
                    <h3 className="card-header">Danh sách kinh nghiệm ({experience.length})</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-semibold text-black">Chức danh</th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-semibold text-black">Tổ chức</th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-semibold text-black">Loại</th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-semibold text-black">Thời gian</th>
                                    <th className="border-b border-gray-200 py-3 px-4 text-sm font-semibold text-black text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {experience.map(exp => (
                                    <tr key={exp.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-4 text-sm text-black">
                                            {exp.title}
                                            {exp.is_current && <span className="ml-2 text-xs border border-black px-1.5 py-0.5 rounded-xs">Hiện tại</span>}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{exp.organization}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">{typeLabels[exp.experience_type]}</td>
                                        <td className="py-3 px-4 text-sm text-gray-700">
                                            {exp.start_date?.slice(0, 7)} — {exp.is_current ? 'Nay' : exp.end_date?.slice(0, 7) || '?'}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-right space-x-3">
                                            <button onClick={() => startEdit(exp)} className="font-medium text-black hover:underline">Sửa</button>
                                            <button onClick={() => dispatch(deleteExperienceThunk(exp.id))} className="font-medium text-gray-500 hover:text-black hover:underline">Xóa</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
