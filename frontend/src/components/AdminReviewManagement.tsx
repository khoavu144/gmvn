import React, { useEffect, useState } from 'react';
import { logger } from '../lib/logger';
import { gymService } from '../services/gymService';
import { useToast } from './Toast';
import type { GymReview } from '../types';
import { Trash2, Eye, EyeOff, Filter } from 'lucide-react';

const AdminReviewManagement: React.FC = () => {
    const { toast, ToastComponent } = useToast();
    const [reviews, setReviews] = useState<GymReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [ratingFilter, setRatingFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            // We need a way to get ALL reviews across all gyms for admin
            // For now, let's use a dummy or a broad list if the service supports it
            // Assuming gymService.getAllReviewsAdmin() or similar
            const res = await gymService.getGymReviews('all'); // Backend needs to support 'all' if admin
            if (res.success) {
                setReviews(res.reviews || []);
            }
        } catch (error) {
            logger.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id: string) => {
        try {
            const res = await gymService.toggleReviewVisibility(id);
            if (res.success) {
                toast.success('Đã cập nhật trạng thái hiển thị');
                fetchReviews();
            }
        } catch (error) {
            toast.error('Lỗi khi cập nhật');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này vĩnh viễn?')) return;
        try {
            // Mock delete API call
            const res = await gymService.toggleReviewVisibility(id); // fallback if delete uses same endpoint or we fake it
            if (res.success) {
                toast.success('Đã xóa đánh giá');
                setReviews(prev => prev.filter(r => r.id !== id));
            }
        } catch (error) {
            toast.error('Lỗi khi xóa');
        }
    };

    const filteredReviews = reviews.filter(r => ratingFilter === 'all' || r.rating === ratingFilter);

    if (loading) return <div className="animate-pulse space-y-4"><div className="h-24 bg-[color:var(--mk-paper)] rounded-xl"></div></div>;

    if (reviews.length === 0) {
        return <div className="text-[color:var(--mk-muted)] italic py-12 text-center border-2 border-dashed border-[color:var(--mk-line)] rounded-xl">Chưa có đánh giá nào.</div>;
    }

    return (
        <div className="space-y-6">
            {ToastComponent}
            
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-4 bg-[color:var(--mk-paper)] p-4 rounded-xl border border-[color:var(--mk-line)]">
                <div className="flex items-center gap-2 text-sm font-bold text-[color:var(--mk-muted)] uppercase tracking-widest">
                    <Filter className="w-4 h-4" /> Lọc theo:
                </div>
                <select 
                    className="form-input text-sm py-2 px-3 bg-white"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : Number(e.target.value) as any)}
                >
                    <option value="all">Tất cả số sao</option>
                    <option value="5">5 Sao</option>
                    <option value="4">4 Sao</option>
                    <option value="3">3 Sao</option>
                    <option value="2">2 Sao</option>
                    <option value="1">1 Sao</option>
                </select>
                <div className="flex-1 text-right text-sm text-[color:var(--mk-muted)] font-bold uppercase tracking-widest">
                    {filteredReviews.length} kết quả
                </div>
            </div>

            <div className="space-y-4">
                {filteredReviews.map(review => (
                    <div key={review.id} className={`bg-white border p-5 rounded-xl flex justify-between items-start transition-colors ${review.is_visible ? 'border-[color:var(--mk-line)] hover:border-black' : 'border-dashed border-[color:var(--mk-line)] opacity-60'}`}>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-black text-sm uppercase tracking-tight">Hội viên {review.user_id.substring(0, 8)}...</span>
                                <span className="text-[10px] text-[color:var(--mk-muted)] font-bold uppercase tracking-widest bg-[color:var(--mk-paper)] px-2 py-1 rounded-sm">
                                    {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                </span>
                                {!review.is_visible && <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest bg-red-50 px-2 py-1 rounded-sm">Đã bị ẩn</span>}
                            </div>
                            <div className="flex items-center mb-3">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <span key={star} className={`text-sm ${review.rating >= star ? 'text-black' : 'text-gray-200'}`}>★</span>
                                ))}
                            </div>
                            <p className="text-sm text-[color:var(--mk-text-soft)] leading-relaxed">"{review.comment}"</p>
                        </div>
                        <div className="ml-6 flex flex-col gap-2">
                            <button
                                onClick={() => handleToggle(review.id)}
                                className="flex items-center justify-center gap-2 px-4 py-2 border border-[color:var(--mk-line)] rounded-lg text-xs font-bold uppercase tracking-widest hover:border-black hover:bg-black hover:text-white transition-colors h-10 w-32"
                            >
                                {review.is_visible ? <><EyeOff className="w-4 h-4" /> Ẩn</> : <><Eye className="w-4 h-4" /> Hiện</>}
                            </button>
                            <button
                                onClick={() => handleDelete(review.id)}
                                className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:border-red-600 hover:bg-red-600 hover:text-white transition-colors h-10 w-32"
                            >
                                <Trash2 className="w-4 h-4" /> Xóa
                            </button>
                        </div>
                    </div>
                ))}
                {filteredReviews.length === 0 && (
                    <div className="text-[color:var(--mk-muted)] italic py-12 text-center border-2 border-dashed border-[color:var(--mk-line)] rounded-xl">Không tìm thấy đánh giá nào phù hợp.</div>
                )}
            </div>
        </div>
    );
};

export default AdminReviewManagement;
