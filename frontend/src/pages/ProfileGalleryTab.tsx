import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addGalleryThunk, deleteGalleryThunk } from '../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../store/store';
import type { TrainerGallery } from '../types';

export function ProfileGalleryTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { gallery, successMsg } = useSelector((s: RootState) => s.profile);
    const [form, setForm] = useState({
        image_url: '', caption: '', image_type: 'workout' as TrainerGallery['image_type'], order_number: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(addGalleryThunk({ ...form, caption: form.caption || null }));
        setForm({ image_url: '', caption: '', image_type: 'workout', order_number: 0 });
    };

    const typeLabels: Record<string, string> = {
        transformation: 'Transformation', workout: 'Buổi tập', event: 'Sự kiện', certificate: 'Chứng chỉ', other: 'Khác',
    };

    return (
        <div className="space-y-6">
            {successMsg && (
                <div className="bg-gray-50 border border-black text-black px-4 py-3 rounded-xs text-sm">
                    {successMsg}
                </div>
            )}

            <div className="card">
                <h3 className="card-header">Thêm ảnh vào gallery</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="form-label">URL ảnh</label>
                        <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                            required placeholder="https://..."
                            className="form-input" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Loại ảnh</label>
                            <select value={form.image_type} onChange={e => setForm(f => ({ ...f, image_type: e.target.value as any }))}
                                className="form-input">
                                <option value="workout">Buổi tập</option>
                                <option value="transformation">Transformation</option>
                                <option value="event">Sự kiện</option>
                                <option value="certificate">Chứng chỉ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Chú thích</label>
                            <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                                placeholder="Mô tả ngắn..."
                                className="form-input" />
                        </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                        <button type="submit" className="btn-primary">
                            Thêm ảnh
                        </button>
                    </div>
                </form>
            </div>

            {gallery.length > 0 && (
                <div className="card">
                    <h3 className="card-header">Gallery ({gallery.length} ảnh)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {gallery.map(img => (
                            <div key={img.id} className="relative group border border-gray-200 rounded-xs overflow-hidden aspect-square bg-gray-50">
                                <img src={img.image_url} alt={img.caption || 'gallery'}
                                    className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 border border-black m-1">
                                    <div>
                                        <span className="text-xs font-semibold text-black uppercase tracking-wider">{typeLabels[img.image_type]}</span>
                                        {img.caption && <p className="text-sm text-gray-700 mt-1 line-clamp-3">{img.caption}</p>}
                                    </div>
                                    <button onClick={() => dispatch(deleteGalleryThunk(img.id))}
                                        className="text-sm font-medium text-black underline mt-auto self-start">
                                        Xóa ảnh
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
