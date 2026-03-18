import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addExperienceThunk, updateExperienceThunk, deleteExperienceThunk } from '../../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { TrainerExperience } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { PencilIcon, TrashIcon, PlusIcon, BriefcaseIcon, AcademicCapIcon, DocumentTextIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export function ProfileExperienceTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { experience, successMsg } = useSelector((s: RootState) => s.profile);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    
    const [form, setForm] = useState({
        title: '', organization: '', start_date: '', end_date: '',
        is_current: false, description: '', experience_type: 'work' as TrainerExperience['experience_type'],
    });

    const resetForm = () => {
        setForm({
            title: '', organization: '', start_date: '', end_date: '',
            is_current: false, description: '', experience_type: 'work',
        });
        setEditingId(null);
        setIsAdding(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...form, end_date: form.is_current ? null : form.end_date || null };
        if (editingId) {
            dispatch(updateExperienceThunk({ id: editingId, data: payload }));
        } else {
            dispatch(addExperienceThunk(payload as any));
        }
        resetForm();
    };

    const startEdit = (exp: TrainerExperience) => {
        setEditingId(exp.id);
        setIsAdding(false);
        setForm({
            title: exp.title, organization: exp.organization,
            start_date: exp.start_date?.slice(0, 10) || '',
            end_date: exp.end_date?.slice(0, 10) || '',
            is_current: exp.is_current,
            description: exp.description || '',
            experience_type: exp.experience_type,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const typeIcons: Record<string, React.ReactNode> = {
        work: <BriefcaseIcon className="w-5 h-5" />,
        education: <AcademicCapIcon className="w-5 h-5" />,
        certification: <DocumentTextIcon className="w-5 h-5" />,
        achievement: <TrophyIcon className="w-5 h-5" />,
    };

    const typeLabels: Record<string, string> = {
        work: 'Công việc', education: 'Học vấn',
        certification: 'Chứng chỉ', achievement: 'Thành tích',
    };

    return (
        <div className="space-y-6">
            <AnimatePresence>
                {successMsg && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-green-50/50 text-green-600 px-4 py-3 rounded-2xl text-sm border border-green-100 flex items-center justify-between"
                    >
                        {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {(isAdding || editingId) ? (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5"
                    >
                        <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-6">
                            {editingId ? 'Chỉnh sửa kinh nghiệm' : 'Thêm kinh nghiệm'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Chức danh / Tên khoá học</label>
                                    <input 
                                        value={form.title} 
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        required 
                                        className="w-full form-input rounded-2xl transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tổ chức / Trường</label>
                                    <input 
                                        value={form.organization} 
                                        onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                                        required 
                                        className="w-full form-input rounded-2xl transition-all" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại</label>
                                    <select 
                                        value={form.experience_type} 
                                        onChange={e => setForm(f => ({ ...f, experience_type: e.target.value as any }))}
                                        className="w-full form-input rounded-2xl transition-all"
                                    >
                                        <option value="work">Công việc</option>
                                        <option value="education">Học vấn</option>
                                        <option value="certification">Chứng chỉ</option>
                                        <option value="achievement">Thành tích</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày</label>
                                    <input 
                                        type="date" 
                                        value={form.start_date} 
                                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                                        required 
                                        className="w-full form-input rounded-2xl transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày</label>
                                    <input 
                                        type="date" 
                                        value={form.end_date} 
                                        disabled={form.is_current}
                                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                        className="w-full form-input rounded-2xl transition-all disabled:bg-gray-50 disabled:text-gray-400" 
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer w-fit p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={form.is_current}
                                    onChange={e => setForm(f => ({ ...f, is_current: e.target.checked, end_date: '' }))}
                                    className="w-5 h-5 rounded-md border-gray-300 text-black focus:ring-black transition-all" 
                                />
                                Vẫn đang làm việc / học học tại đây
                            </label>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chi tiết</label>
                                <textarea 
                                    rows={4} 
                                    value={form.description} 
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full form-input rounded-2xl resize-none transition-all placeholder:text-gray-400" 
                                    placeholder="Mô tả công việc, thành tích, hoặc những gì bạn học được..."
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                                <button type="submit" className="btn-primary rounded-2xl px-8 py-3 bg-black text-white hover:bg-gray-900 transition-colors">
                                    {editingId ? 'Lưu thay đổi' : 'Thêm kinh nghiệm'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={resetForm}
                                    className="btn-secondary rounded-2xl px-8 py-3 border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5"
                    >
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 items-start sm:items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-gray-900">Kinh nghiệm & Học vấn</h3>
                                <p className="text-sm text-gray-500 mt-1">Hồ sơ chuyên môn của bạn ({experience.length})</p>
                            </div>
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 hover:bg-black hover:text-white text-gray-700 rounded-2xl transition-all duration-300 border border-gray-200 hover:border-black font-medium text-sm"
                            >
                                <PlusIcon className="w-4 h-4" /> 
                                Thêm mới
                            </button>
                        </div>

                        {experience.length === 0 ? (
                            <div className="text-center py-12 px-4 rounded-3xl bg-gray-50 border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ring-1 ring-black/5">
                                    <BriefcaseIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <h4 className="text-gray-900 font-semibold mb-2">Chưa có kinh nghiệm nào</h4>
                                <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
                                    Thêm kinh nghiệm làm việc, học vấn hoặc các chứng chỉ để làm nổi bật hồ sơ của bạn.
                                </p>
                                <button 
                                    onClick={() => setIsAdding(true)}
                                    className="btn-primary rounded-2xl"
                                >
                                    Bắt đầu thêm
                                </button>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-gray-100 ml-3 md:ml-4 space-y-10 py-2">
                                <AnimatePresence>
                                    {experience.map((exp, idx) => (
                                        <motion.div 
                                            key={exp.id} 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="relative pl-8 md:pl-10 group"
                                        >
                                            <div className="absolute -left-[17px] top-1 bg-white p-1 rounded-full border-2 border-gray-100 group-hover:border-black transition-colors duration-300">
                                                <div className="bg-gray-50 text-gray-500 group-hover:bg-black group-hover:text-white p-2 rounded-full transition-all duration-300">
                                                    {typeIcons[exp.experience_type] || <BriefcaseIcon className="w-4 h-4" />}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white rounded-3xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 group-hover:border-gray-200">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900">{exp.title}</h4>
                                                        <p className="text-gray-600 font-medium">{exp.organization}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-gray-50 text-gray-600 border border-gray-200 uppercase">
                                                            {typeLabels[exp.experience_type]}
                                                        </span>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => startEdit(exp)} 
                                                                className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => dispatch(deleteExperienceThunk(exp.id))} 
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 font-medium">
                                                    <span>
                                                        {exp.start_date ? format(parseISO(exp.start_date), 'MM/yyyy', { locale: vi }) : ''} 
                                                        {' '}—{' '} 
                                                        {exp.is_current ? 'Hiện tại' : (exp.end_date ? format(parseISO(exp.end_date), 'MM/yyyy', { locale: vi }) : '')}
                                                    </span>
                                                </div>

                                                {exp.description && (
                                                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50/50 p-4 rounded-2xl">
                                                        {exp.description}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

