import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addFAQThunk, updateFAQThunk, deleteFAQThunk } from '../../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { TrainerFAQ } from '../../types';

export function ProfileFAQTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { faq, successMsg } = useSelector((s: RootState) => s.profile);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [openId, setOpenId] = useState<string | null>(null);
    const [form, setForm] = useState({ question: '', answer: '', order_number: 0 });

    const resetForm = () => setForm({ question: '', answer: '', order_number: 0 });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingId) {
            dispatch(updateFAQThunk({ id: editingId, data: form }));
            setEditingId(null);
        } else {
            dispatch(addFAQThunk(form));
        }
        resetForm();
    };

    const startEdit = (f: TrainerFAQ) => {
        setEditingId(f.id);
        setForm({ question: f.question, answer: f.answer, order_number: f.order_number });
    };

    return (
        <div className="space-y-6">
            {successMsg && (
                <div className="bg-[color:var(--mk-paper)] border border-black text-black px-4 py-3 rounded-xs text-sm">
                    {successMsg}
                </div>
            )}

            <div className="card">
                <h3 className="card-header">
                    {editingId ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi thường gặp'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">Câu hỏi</label>
                        <input value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))}
                            required placeholder="VD: Tôi cần tập mấy buổi/tuần?"
                            className="form-input" />
                    </div>
                    <div>
                        <label className="form-label">Câu trả lời</label>
                        <textarea rows={4} value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))}
                            required placeholder="Trả lời chi tiết..."
                            className="form-input resize-none" />
                    </div>
                    <div className="flex gap-3 pt-2 border-t border-[color:var(--mk-line)]">
                        <button type="submit" className="btn-primary">
                            {editingId ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => { setEditingId(null); resetForm(); }}
                                className="btn-secondary">Hủy</button>
                        )}
                    </div>
                </form>
            </div>

            {faq.length > 0 && (
                <div className="card">
                    <h3 className="card-header">Danh sách câu hỏi thường gặp ({faq.length})</h3>
                    <div className="border border-[color:var(--mk-line)] rounded-xs divide-y divide-gray-200">
                        {faq.map(item => (
                            <div key={item.id} className="bg-white">
                                <button
                                    onClick={() => setOpenId(openId === item.id ? null : item.id)}
                                    className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-[color:var(--mk-paper)] transition-colors focus:outline-none focus:bg-[color:var(--mk-paper)]"
                                >
                                    <span className="text-sm text-black font-medium">{item.question}</span>
                                    <span className="text-[color:var(--mk-muted)] font-mono text-xs">{openId === item.id ? '-' : '+'}</span>
                                </button>
                                {openId === item.id && (
                                    <div className="px-4 pb-4 pt-1 bg-[color:var(--mk-paper)]">
                                        <p className="text-[color:var(--mk-text-soft)] text-sm whitespace-pre-line mb-3">{item.answer}</p>
                                        <div className="flex gap-4">
                                            <button onClick={() => startEdit(item)} className="text-sm font-medium text-black hover:underline">Sửa</button>
                                            <button onClick={() => dispatch(deleteFAQThunk(item.id))} className="text-sm font-medium text-[color:var(--mk-muted)] hover:text-black hover:underline">Xóa</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
