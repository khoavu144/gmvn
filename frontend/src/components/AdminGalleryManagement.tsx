import React, { useState, useEffect } from 'react';
import { Camera, Plus, Trash2, Star, Filter, RefreshCw } from 'lucide-react';
import { communityGalleryApiService } from '../services/communityGalleryService';
import type { CommunityGalleryItem } from '../services/communityGalleryService';
import { useToast } from './Toast';

export default function AdminGalleryManagement() {
    const { toast, ToastComponent } = useToast();
    const [items, setItems] = useState<CommunityGalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isUploading, setIsUploading] = useState(false);

    interface GalleryFormState {
        image_url: string;
        caption: string;
        category: 'workout' | 'lifestyle' | 'transformation' | 'event' | 'gym_space' | 'portrait' | 'other';
        is_featured: boolean;
        source: 'admin_upload' | 'trainer_gallery';
    }

    const [formItem, setFormItem] = useState<GalleryFormState>({
        image_url: '',
        caption: '',
        category: 'workout',
        is_featured: false,
        source: 'admin_upload',
    });

    const loadGallery = async (pageNum = 1) => {
        setLoading(true);
        try {
            const res = await communityGalleryApiService.adminGetGallery({ page: pageNum, limit: 12 });
            if (res.success) {
                setItems(res.items);
                setTotalPages(res.totalPages);
                setPage(res.page);
            }
        } catch (error: any) {
            toast.error(error.message || 'Lỗi tải danh sách ảnh');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadGallery();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formItem.image_url) {
            toast.error('Vui lòng nhập URL hình ảnh');
            return;
        }

        setIsUploading(true);
        try {
            const res = await communityGalleryApiService.adminCreateItem(formItem);
            if (res.success) {
                toast.success('Đã thêm hình ảnh vào Gallery');
                setFormItem({ ...formItem, image_url: '', caption: '' });
                loadGallery(1);
            }
        } catch (error: any) {
            toast.error(error.message || 'Lỗi thêm ảnh');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xoá ảnh này khỏi Gallery?')) return;
        
        try {
            const res = await communityGalleryApiService.adminDeleteItem(id);
            if (res.success) {
                toast.success('Đã xoá ảnh');
                loadGallery(page);
            }
        } catch (error: any) {
            toast.error(error.message || 'Lỗi khi xoá ảnh');
        }
    };

    const toggleFeatured = async (item: CommunityGalleryItem) => {
        try {
            const res = await communityGalleryApiService.adminUpdateItem(item.id, { is_featured: !item.is_featured });
            if (res.success) {
                toast.success('Đã cập nhật trạng thái');
                setItems(items.map(i => i.id === item.id ? { ...i, is_featured: res.item.is_featured } : i));
            }
        } catch (error: any) {
            toast.error('Lỗi cập nhật trạng thái');
        }
    };

    return (
        <div className="space-y-6">
            {ToastComponent}
            {/* Header & Add form */}
            <div className="bg-white p-6 rounded-xl border border-[color:var(--mk-line)] shadow-sm">
                <h3 className="text-lg font-black uppercase tracking-tight mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5" /> Thêm hình ảnh mới
                </h3>
                <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[color:var(--mk-text-soft)] uppercase mb-1">Image URL *</label>
                            <input 
                                type="url" 
                                value={formItem.image_url}
                                onChange={e => setFormItem({...formItem, image_url: e.target.value})}
                                placeholder="https://..."
                                className="w-full border border-[color:var(--mk-line)] rounded px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-[color:var(--mk-text-soft)] uppercase mb-1">Caption / Trích dẫn</label>
                            <input 
                                type="text" 
                                value={formItem.caption}
                                onChange={e => setFormItem({...formItem, caption: e.target.value})}
                                placeholder="Một khoảnh khắc đẹp..."
                                className="w-full border border-[color:var(--mk-line)] rounded px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-[color:var(--mk-text-soft)] uppercase mb-1">Danh mục</label>
                            <select 
                                value={formItem.category}
                                onChange={e => setFormItem({...formItem, category: e.target.value as any})}
                                className="w-full border border-[color:var(--mk-line)] rounded px-3 py-2 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                            >
                                <option value="workout">Tập Luyện</option>
                                <option value="transformation">Chuyển hóa</option>
                                <option value="gym_space">Không gian</option>
                                <option value="event">Sự kiện</option>
                                <option value="portrait">Chân dung</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    checked={formItem.is_featured}
                                    onChange={e => setFormItem({...formItem, is_featured: e.target.checked})}
                                    className="w-4 h-4 rounded border-[color:var(--mk-line)] text-black focus:ring-black"
                                />
                                <span className="text-sm font-semibold group-hover:text-black">Nổi bật (Featured)</span>
                            </label>

                            <button 
                                type="submit" 
                                disabled={isUploading}
                                className="ml-auto bg-black text-white px-6 py-2 rounded text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                            >
                                {isUploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Thêm ảnh
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="bg-white rounded-xl border border-[color:var(--mk-line)] overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[color:var(--mk-line)] flex justify-between items-center bg-[color:var(--mk-paper)]">
                    <h3 className="font-bold text-sm uppercase tracking-wider text-[color:var(--mk-text-soft)] flex items-center gap-2">
                        <Filter className="w-4 h-4" /> Danh sách ảnh ({items.length})
                    </h3>
                    <button onClick={() => loadGallery(page)} className="text-[color:var(--mk-muted)] hover:text-black p-1">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center text-[color:var(--mk-muted)]">Đang tải biểu dữ liệu...</div>
                ) : items.length === 0 ? (
                    <div className="p-8 text-center text-[color:var(--mk-muted)]">Chưa có hình ảnh nào trong thư viện.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-[color:var(--mk-paper)] border-b border-[color:var(--mk-line)] text-xs font-bold uppercase text-[color:var(--mk-muted)]">
                                <tr>
                                    <th className="px-4 py-3">Hình ảnh</th>
                                    <th className="px-4 py-3">Chi tiết</th>
                                    <th className="px-4 py-3">Nguồn</th>
                                    <th className="px-4 py-3">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(item => (
                                    <tr key={item.id} className="border-b border-[color:var(--mk-line)] hover:bg-[color:var(--mk-paper)] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="w-24 h-24 rounded-lg overflow-hidden border border-[color:var(--mk-line)] bg-[color:var(--mk-paper)] flex items-center justify-center relative group">
                                                <img src={item.image_url} alt="Gallery item" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                {item.is_featured && <div className="absolute top-1 left-1 bg-yellow-500 text-white p-0.5 rounded-full"><Star size={10} className="fill-current"/></div>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-semibold text-[color:var(--mk-text)] line-clamp-2">{item.caption || <span className="text-[color:var(--mk-muted)] italic">Không có trích dẫn</span>}</p>
                                            <p className="text-xs text-[color:var(--mk-muted)] uppercase mt-1">Danh mục: {item.category}</p>
                                            <p className="text-xs text-[color:var(--mk-muted)] mt-1">{new Date(item.created_at).toLocaleDateString('vi-VN')}</p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[color:var(--mk-paper)] text-[color:var(--mk-text-soft)]">
                                                {item.source === 'admin_upload' ? 'Upload Trực Tiếp' : 'Từ Trainer'}
                                            </span>
                                            {item.linked_user && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <div className="w-5 h-5 rounded-full bg-[color:var(--mk-paper-strong)] overflow-hidden">
                                                        {item.linked_user.avatar_url && <img src={item.linked_user.avatar_url} alt="" className="w-full h-full object-cover" />}
                                                    </div>
                                                    <span className="text-xs font-semibold">{item.linked_user.full_name}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => toggleFeatured(item)}
                                                    className={`p-1.5 rounded-md border transition-colors ${item.is_featured ? 'border-yellow-200 bg-yellow-50 text-yellow-600' : 'border-[color:var(--mk-line)] text-[color:var(--mk-muted)] hover:text-black hover:border-black'}`}
                                                    title={item.is_featured ? "Gỡ nổi bật" : "Đánh dấu nổi bật"}
                                                >
                                                    <Star className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 rounded-md border border-[color:var(--mk-line)] text-[color:var(--mk-muted)] hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                                                    title="Xoá"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-[color:var(--mk-line)] bg-[color:var(--mk-paper)] flex justify-center gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => loadGallery(page - 1)}
                            className="px-3 py-1 bg-white border border-[color:var(--mk-line)] rounded text-xs font-bold uppercase disabled:opacity-50"
                        >
                            Trang trước
                        </button>
                        <span className="px-3 py-1 text-sm font-medium text-[color:var(--mk-text-soft)]">Trang {page} / {totalPages}</span>
                        <button 
                            disabled={page === totalPages}
                            onClick={() => loadGallery(page + 1)}
                            className="px-3 py-1 bg-white border border-[color:var(--mk-line)] rounded text-xs font-bold uppercase disabled:opacity-50"
                        >
                            Trang sau
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
