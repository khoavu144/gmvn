import React, { useState } from 'react';
import { gymService } from '../services/gymService';
import { useToast } from './Toast';

interface GymReviewFormProps {
    gymId: string;
    branchId: string;
    onSuccess?: () => void;
}

const GymReviewForm: React.FC<GymReviewFormProps> = ({ gymId, branchId, onSuccess }) => {
    const { toast } = useToast();
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await gymService.createReview(gymId, branchId, { rating, comment });
            if (res.success) {
                toast.success('Đánh giá của bạn đã được gửi!');
                setComment('');
                setRating(5);
                onSuccess?.();
            } else {
                toast.error(res.error || 'Có lỗi xảy ra');
            }
        } catch (err: any) {
            toast.error(err.message || 'Lỗi kết nối server');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8">
            <h3 className="text-xl font-black mb-1 text-white tracking-tight">Trải nghiệm của bạn</h3>
            <p className="text-gray-400 text-sm mb-6">Chia sẻ chân thực để giúp cộng đồng đưa ra quyết định tốt hơn.</p>
            
            <div className="mb-5">
                <label className="block text-[10px] font-bold text-gray-400 mb-2.5 uppercase tracking-widest">Đánh giá chung</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`w-11 h-11 rounded-xl font-bold transition-all ${rating >= star ? 'bg-yellow-400 text-black scale-105 shadow-lg shadow-yellow-400/20 border border-yellow-400' : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/30 hover:text-white'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-6">
                <label className="block text-[10px] font-bold text-gray-400 mb-2.5 uppercase tracking-widest">Chi tiết trải nghiệm</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Không gian phòng tập, thái độ nhân viên, chất lượng máy móc..."
                    className="w-full h-28 resize-none bg-black/50 text-white border border-white/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-white focus:border-white placeholder-gray-600 transition-all font-medium text-sm shadow-inner"
                ></textarea>
            </div>
            <button type="submit" disabled={submitting} className="w-full sm:w-auto px-8 py-3.5 bg-white text-black font-black uppercase tracking-wider text-xs rounded-xl hover:bg-gray-200 disabled:opacity-50 transition-colors">
                {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
        </form>
    );
};

export default GymReviewForm;
