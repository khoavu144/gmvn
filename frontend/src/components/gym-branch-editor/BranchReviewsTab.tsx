import React from 'react';
import type { GymBranch } from '../../types';

interface BranchReviewsTabProps {
    branch: GymBranch;
}

export const BranchReviewsTab: React.FC<BranchReviewsTabProps> = ({ branch }) => {
    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black uppercase tracking-widest">Phản hồi khách hàng</h3>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black">
                        {(branch.reviews && branch.reviews.length > 0)
                            ? (branch.reviews.reduce((acc, r) => acc + r.rating, 0) / branch.reviews.length).toFixed(1)
                            : '0.0'}
                    </span>
                    <span className="text-yellow-400 text-xl">★</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">({branch.reviews?.length || 0} đánh giá)</span>
                </div>
            </div>

            <div className="divide-y divide-gray-100">
                {branch.reviews?.map((rev) => (
                    <div key={rev.id} className="py-6 first:pt-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center font-black text-[10px] uppercase">
                                    {(rev.user?.full_name || 'U')[0]}
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-tight">{rev.user?.full_name || 'Người dùng ẩn danh'}</h4>
                                    <div className="flex text-yellow-400 text-[10px]">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">
                                {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium">
                            {rev.comment || <span className="italic text-gray-500 uppercase text-[10px]">Không có nội dung bình luận</span>}
                        </p>
                    </div>
                ))}
                {(!branch.reviews || branch.reviews.length === 0) && (
                    <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-lg text-gray-500 text-xs font-bold uppercase">
                        Chưa có lượt đánh giá nào cho chi nhánh này
                    </div>
                )}
            </div>
        </div>
    );
};
