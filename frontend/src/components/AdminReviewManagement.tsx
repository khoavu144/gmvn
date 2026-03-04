import React, { useEffect, useState } from 'react';
import { gymService } from '../services/gymService';
import { useToast } from './Toast';
import type { GymReview } from '../types';

const AdminReviewManagement: React.FC = () => {
    const { toast, ToastComponent } = useToast();
    const [reviews, setReviews] = useState<GymReview[]>([]);
    const [loading, setLoading] = useState(true);

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
            console.error(error);
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

    if (loading) return <div className="animate-pulse space-y-4"><div className="h-24 bg-gray-50 rounded-xl"></div></div>;

    if (reviews.length === 0) {
        return <div className="text-gray-500 italic py-12 text-center border-2 border-dashed border-gray-100 rounded-xl">Chưa có đánh giá nào.</div>;
    }

    return (
        <div className="space-y-4">
            {ToastComponent}
            {reviews.map(review => (
                <div key={review.id} className="bg-white border border-gray-200 p-4 rounded-lg flex justify-between items-center">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-bold text-sm">Hội viên {review.user_id.substring(0, 4)}...</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(review.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className={`text-xs ${review.rating >= star ? 'text-black' : 'text-gray-200'}`}>★</span>
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                    </div>
                    <div className="ml-6">
                        <button
                            onClick={() => handleToggle(review.id)}
                            className={`px-4 py-2 rounded-xs font-bold uppercase tracking-widest text-[10px] transition-colors ${review.is_visible ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                        >
                            {review.is_visible ? 'Ẩn review' : 'Hiện review'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminReviewManagement;
