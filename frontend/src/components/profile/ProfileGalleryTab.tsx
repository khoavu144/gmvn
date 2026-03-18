import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addGalleryThunk, deleteGalleryThunk } from '../../store/slices/profileSlice';
import type { AppDispatch, RootState } from '../../store/store';
import type { TrainerGallery } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, PlusIcon, TrashIcon, ArrowsPointingOutIcon, PhotoIcon } from '@heroicons/react/24/outline';

const typeLabels: Record<string, string> = {
    transformation: 'Transformation', workout: 'Buổi tập', event: 'Sự kiện', certificate: 'Chứng chỉ', other: 'Khác',
};

export function ProfileGalleryTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { gallery, successMsg } = useSelector((s: RootState) => s.profile);
    const [isAdding, setIsAdding] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<TrainerGallery | null>(null);
    
    const [form, setForm] = useState({
        image_url: '', caption: '', image_type: 'workout' as TrainerGallery['image_type'], order_number: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(addGalleryThunk({ ...form, caption: form.caption || null }));
        setForm({ image_url: '', caption: '', image_type: 'workout', order_number: 0 });
        setIsAdding(false);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-black uppercase tracking-tight">Thư viện Ảnh</h2>
                    <p className="text-gray-500 mt-1">Quản lý hình ảnh, thành tích và kết quả tập luyện</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" />
                        Thêm ảnh
                    </button>
                )}
            </div>

            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-green-50 text-green-800 px-4 py-3 rounded-xs text-sm border border-green-200"
                    >
                        {successMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="card border-black">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="card-header mb-0 border-0 pb-0">Thêm ảnh mới</h3>
                                <button onClick={() => setIsAdding(false)} className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors">
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="form-label">URL Ảnh</label>
                                    <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                                        required placeholder="https://..."
                                        className="form-input" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Chủ đề / Thể loại</label>
                                        <select value={form.image_type} onChange={e => setForm(f => ({ ...f, image_type: e.target.value as any }))}
                                            className="form-input">
                                            {Object.entries(typeLabels).map(([val, label]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Chú thích ngắn</label>
                                        <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                                            placeholder="Ghi chú về bức ảnh..."
                                            className="form-input" />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary mr-3 text-sm px-4 py-2">Hủy</button>
                                    <button type="submit" className="btn-primary text-sm px-4 py-2">Lưu ảnh</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                <AnimatePresence>
                    {gallery.map((img, idx) => (
                        <motion.div
                            layout
                            key={img.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            className="group relative aspect-[4/5] bg-gray-100 rounded-none overflow-hidden cursor-pointer"
                            onClick={() => setLightboxImage(img)}
                        >
                            <img src={img.image_url} alt={img.caption || 'gallery'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                                <div className="flex justify-end">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); dispatch(deleteGalleryThunk(img.id)); }}
                                        className="p-2 bg-white/10 hover:bg-red-500 hover:text-white text-white backdrop-blur-sm rounded-full transition-colors"
                                        title="Xóa ảnh"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-widest mb-2 border border-white/30">
                                        {typeLabels[img.image_type]}
                                    </span>
                                    {img.caption && (
                                        <p className="text-sm font-medium text-white line-clamp-2 leading-snug">
                                            {img.caption}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            {/* View Icon (center) */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                    <ArrowsPointingOutIcon className="w-5 h-5" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {gallery.length === 0 && !isAdding && (
                <div className="text-center py-16 px-4 bg-gray-50 border border-dashed border-gray-300 rounded-none">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                        <PhotoIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-black mb-1">Chưa có hình ảnh nào</h3>
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">Thêm hình ảnh về thân hình, phòng tập, hoặc khách hàng của bạn để thu hút học viên mới.</p>
                    <button onClick={() => setIsAdding(true)} className="btn-primary">
                        Thêm bức ảnh đầu tiên
                    </button>
                </div>
            )}

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/95 backdrop-blur-xl"
                        onClick={() => setLightboxImage(null)}
                    >
                        <button 
                            className="absolute top-6 right-6 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
                            onClick={() => setLightboxImage(null)}
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img 
                                src={lightboxImage.image_url} 
                                alt={lightboxImage.caption || 'gallery fullscreen'} 
                                className="max-w-full max-h-[80vh] object-contain shadow-2xl"
                            />
                            
                            <div className="w-full mt-6 bg-white/10 p-4 rounded-xl border border-white/10 backdrop-blur-md">
                                <div className="flex items-center gap-3">
                                    <span className="px-2.5 py-1 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-sm">
                                        {typeLabels[lightboxImage.image_type]}
                                    </span>
                                    {lightboxImage.caption && (
                                        <p className="text-white font-medium text-lg">
                                            {lightboxImage.caption}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
