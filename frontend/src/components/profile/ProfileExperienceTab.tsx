import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addExperienceThunk, updateExperienceThunk, deleteExperienceThunk } from '../../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { TrainerExperience } from '../../types';
import { m as motion, AnimatePresence } from 'framer-motion';
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
                        className="bg-green-50/50 text-green-600 px-4 py-3 rounded-lg text-sm border border-green-100 flex items-center justify-between"
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
                        className="bg-white rounded-lg p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5"
                    >
                        <h3 className="text-xl font-bold tracking-tight text-[color:var(--mk-text)] mb-6">
                            {editingId ? 'Chỉnh sửa kinh nghiệm' : 'Thêm kinh nghiệm'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[color:var(--mk-text-soft)] mb-2">Chức danh / Tên khoá học</label>
                                    <input 
                                        value={form.title} 
                                        onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        required 
                                        className="w-full form-input rounded-lg transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[color:var(--mk-text-soft)] mb-2">Tổ chức / Trường</label>
                                    <input 
                                        value={form.organization} 
                                        onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                                        required 
                                        className="w-full form-input rounded-lg transition-all" 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-[color:var(--mk-text-soft)] mb-2">Loại</label>
                                    <select 
                                        value={form.experience_type} 
                                        onChange={e => setForm(f => ({ ...f, experience_type: e.target.value as any }))}
                                        className="w-full form-input rounded-lg transition-all"
                                    >
                                        <option value="work">Công việc</option>
                                        <option value="education">Học vấn</option>
                                        <option value="certification">Chứng chỉ</option>
                                        <option value="achievement">Thành tích</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[color:var(--mk-text-soft)] mb-2">Từ ngày</label>
                                    <input 
                                        type="date" 
                                        value={form.start_date} 
                                        onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                                        required 
                                        className="w-full form-input rounded-lg transition-all" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[color:var(--mk-text-soft)] mb-2">Đến ngày</label>
                                    <input 
                                        type="date" 
                                        value={form.end_date} 
                                        disabled={form.is_current}
                                        onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                                        className="w-full form-input rounded-lg transition-all disabled:bg-[color:var(--mk-paper)] disabled:text-[color:var(--mk-muted)]" 
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-3 text-sm font-medium text-[color:var(--mk-text-soft)] cursor-pointer w-fit p-3 bg-[color:var(--mk-paper)] rounded-lg hover:bg-[color:var(--mk-paper)] transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={form.is_current}
                                    onChange={e => setForm(f => ({ ...f, is_current: e.target.checked, end_date: '' }))}
                                    className="w-5 h-5 rounded-md border-[color:var(--mk-line)] text-black focus:ring-black transition-all" 
                                />
                                Vẫn đang làm việc / học học tại đây
                            </label>

                            <div>
                                <label className="block text-sm font-medium text-[color:var(--mk-text-soft)] mb-2">Mô tả chi tiết</label>
                                <textarea 
                                    rows={4} 
                                    value={form.description} 
                                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                    className="w-full form-input rounded-lg resize-none transition-all placeholder:text-[color:var(--mk-muted)]" 
                                    placeholder="Mô tả công việc, thành tích, hoặc những gì bạn học được..."
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-[color:var(--mk-line)]">
                                <button type="submit" className="btn-primary rounded-lg px-8 py-3 bg-black text-white hover:bg-gray-900 transition-colors">
                                    {editingId ? 'Lưu thay đổi' : 'Thêm kinh nghiệm'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={resetForm}
                                    className="btn-secondary rounded-lg px-8 py-3 border border-[color:var(--mk-line)] text-[color:var(--mk-text-soft)] hover:bg-[color:var(--mk-paper)] transition-colors"
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
                        className="bg-white rounded-lg p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5"
                    >
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 items-start sm:items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold tracking-tight text-[color:var(--mk-text)]">Kinh nghiệm & Học vấn</h3>
                                <p className="text-sm text-[color:var(--mk-muted)] mt-1">Hồ sơ chuyên môn của bạn ({experience.length})</p>
                            </div>
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[color:var(--mk-paper)] hover:bg-black hover:text-white text-[color:var(--mk-text-soft)] rounded-lg transition-all duration-300 border border-[color:var(--mk-line)] hover:border-black font-medium text-sm"
                            >
                                <PlusIcon className="w-4 h-4" /> 
                                Thêm mới
                            </button>
                        </div>

                        {experience.length === 0 ? (
                            <div className="text-center py-12 px-4 rounded-lg bg-[color:var(--mk-paper)] border border-dashed border-[color:var(--mk-line)]">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm ring-1 ring-black/5">
                                    <BriefcaseIcon className="w-8 h-8 text-[color:var(--mk-muted)]" />
                                </div>
                                <h4 className="text-[color:var(--mk-text)] font-semibold mb-2">Chưa có kinh nghiệm nào</h4>
                                <p className="text-sm text-[color:var(--mk-muted)] max-w-sm mx-auto mb-6">
                                    Thêm kinh nghiệm làm việc, học vấn hoặc các chứng chỉ để làm nổi bật hồ sơ của bạn.
                                </p>
                                <button 
                                    onClick={() => setIsAdding(true)}
                                    className="btn-primary rounded-lg"
                                >
                                    Bắt đầu thêm
                                </button>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-[color:var(--mk-line)] ml-3 md:ml-4 space-y-10 py-2">
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
                                            <div className="absolute -left-[17px] top-1 bg-white p-1 rounded-full border-2 border-[color:var(--mk-line)] group-hover:border-black transition-colors duration-300">
                                                <div className="bg-[color:var(--mk-paper)] text-[color:var(--mk-muted)] group-hover:bg-black group-hover:text-white p-2 rounded-full transition-all duration-300">
                                                    {typeIcons[exp.experience_type] || <BriefcaseIcon className="w-4 h-4" />}
                                                </div>
                                            </div>
                                            
                                            <div className="bg-white rounded-lg p-6 border border-[color:var(--mk-line)] hover:shadow-lg transition-all duration-300 group-hover:border-[color:var(--mk-line)]">
                                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-[color:var(--mk-text)]">{exp.title}</h4>
                                                        <p className="text-[color:var(--mk-text-soft)] font-medium">{exp.organization}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-[color:var(--mk-paper)] text-[color:var(--mk-text-soft)] border border-[color:var(--mk-line)] uppercase">
                                                            {typeLabels[exp.experience_type]}
                                                        </span>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => startEdit(exp)} 
                                                                className="p-2 text-[color:var(--mk-muted)] hover:text-black hover:bg-[color:var(--mk-paper)] rounded-lg transition-colors"
                                                                title="Chỉnh sửa"
                                                            >
                                                                <PencilIcon className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => dispatch(deleteExperienceThunk(exp.id))} 
                                                                className="p-2 text-[color:var(--mk-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Xóa"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-sm text-[color:var(--mk-muted)] mb-4 font-medium">
                                                    <span>
                                                        {exp.start_date ? format(parseISO(exp.start_date), 'MM/yyyy', { locale: vi }) : ''} 
                                                        {' '}—{' '} 
                                                        {exp.is_current ? 'Hiện tại' : (exp.end_date ? format(parseISO(exp.end_date), 'MM/yyyy', { locale: vi }) : '')}
                                                    </span>
                                                </div>

                                                {exp.description && (
                                                    <p className="text-[color:var(--mk-text-soft)] text-sm leading-relaxed whitespace-pre-wrap bg-[color:var(--mk-paper)]/50 p-4 rounded-lg">
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

