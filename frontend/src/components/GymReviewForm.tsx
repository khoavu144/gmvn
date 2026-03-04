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
        <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 uppercase tracking-tight">Đánh giá Gym Center</h3>
            <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Đánh giá chung</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`w-10 h-10 rounded-xs font-bold transition-colors ${rating >= star ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}
                        >
                            {star}
                        </button>
                    ))}
                </div>
            </div>
            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Chia sẻ trải nghiệm</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                    placeholder="Chất lượng dịch vụ thế nào? Thiết bị có đầy đủ không?..."
                    className="form-input w-full h-24 resize-none"
                ></textarea>
            </div>
            <button type="submit" disabled={submitting} className="btn-primary py-3 w-full sm:w-auto px-8 uppercase tracking-widest text-xs">
                {submitting ? 'Đang gửi...' : 'Gửi Đánh Giá'}
            </button>
        </form>
    );
};

export default GymReviewForm;
