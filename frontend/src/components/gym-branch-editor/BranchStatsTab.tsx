import React from 'react';
import type { GymBranch } from '../../types';

interface BranchStatsTabProps {
    branch: GymBranch;
}

export const BranchStatsTab: React.FC<BranchStatsTabProps> = ({ branch }) => {
    return (
        <div className="animate-fade-in space-y-8">
            <h3 className="text-sm font-black uppercase tracking-widest mb-6">Chỉ số hiệu năng chi nhánh</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tổng lượt xem</p>
                    <p className="text-3xl font-black">{branch.view_count || 0}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Đánh giá trung bình</p>
                    <p className="text-3xl font-black">
                        {(branch.reviews && branch.reviews.length > 0)
                            ? (branch.reviews.reduce((acc, r) => acc + r.rating, 0) / branch.reviews.length).toFixed(1)
                            : '0.0'}
                    </p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Coach cơ hữu</p>
                    <p className="text-3xl font-black">{branch.trainer_links?.length || 0}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Tiện ích tích hợp</p>
                    <p className="text-3xl font-black">{branch.amenities?.length || 0}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Thiết bị & Máy tập</p>
                    <p className="text-3xl font-black">{branch.equipment?.length || 0}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Gói phí tập</p>
                    <p className="text-3xl font-black">{branch.pricing?.length || 0}</p>
                </div>
            </div>

            <div className="bg-black text-white p-8 rounded-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h4 className="text-lg font-black uppercase tracking-tight mb-2">Tăng trưởng tương tác</h4>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Chi nhánh đang thu hút sự quan tâm của cộng đồng Gymers.</p>
                </div>
                <div className="absolute right-[-10%] top-[-20%] text-[120px] font-black text-white/5 pointer-events-none select-none">
                    GYM
                </div>
            </div>
        </div>
    );
};
