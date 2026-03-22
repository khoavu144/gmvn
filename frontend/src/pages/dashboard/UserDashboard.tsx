import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle2, Circle, ArrowRight, Store } from 'lucide-react';
import type { RootState } from '../../store/store';

const UserDashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.auth.user);

    const getCompleteness = () => {
        let score = 20; // base (name, email)
        if (user?.avatar_url) score += 20;
        if (user?.height_cm) score += 20;
        if (user?.current_weight_kg) score += 20;
        if (user?.bio) score += 20;
        return score;
    };

    const completeness = getCompleteness();
    const isProfileComplete = completeness === 100;

    return (
        <div className="space-y-8 max-w-3xl">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 shadow-sm">
                <div className="mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Bắt đầu hành trình</h2>
                    <p className="text-gray-500">Làm vài bước sau để dùng GYMERVIET thuận tiện hơn.</p>
                    
                    <div className="w-full bg-gray-50 h-2 mt-6 rounded-full overflow-hidden">
                        <div className="bg-black h-full transition-all duration-1000" style={{ width: `${completeness / 100 * 25 + 25}%` }}></div>
                    </div>
                    <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest text-right">Tiến độ</p>
                </div>

                <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-200 opacity-70 cursor-default">
                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-gray-500 line-through">Tạo tài khoản</h3>
                            <p className="text-sm text-gray-500">Chào mừng bạn gia nhập cộng đồng.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${isProfileComplete ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white border-black shadow-sm'}`}>
                        {isProfileComplete ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                            <Circle className="w-6 h-6 text-gray-300 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <h3 className={`font-bold text-gray-900 ${isProfileComplete ? 'line-through text-gray-500' : ''}`}>
                                Hoàn thiện hồ sơ ({completeness}%)
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Thêm chiều cao, cân nặng và ảnh đại diện để xem gợi ý BMI và lộ trình.</p>
                            {!isProfileComplete && (
                                <Link to="/profile" className="inline-flex items-center gap-2 mt-3 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
                                    Cập nhật ngay <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-white border-gray-200 hover:border-gray-200 transition-colors group">
                        <Circle className="w-6 h-6 text-gray-300 shrink-0 mt-0.5 group-hover:text-gray-500 transition-colors" />
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">Khám phá không gian tập luyện</h3>
                            <p className="text-sm text-gray-500 mt-1">Tìm kiếm phòng gym, yoga, pilates phù hợp quanh bạn.</p>
                            <Link to="/gyms" className="inline-flex items-center gap-2 mt-3 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
                                Xem danh sách <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-white border-gray-200 hover:border-gray-200 transition-colors group">
                        <Circle className="w-6 h-6 text-gray-300 shrink-0 mt-0.5 group-hover:text-gray-500 transition-colors" />
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">Nâng cấp thành Athlete hoặc Coach</h3>
                            <p className="text-sm text-gray-500 mt-1">Nâng cấp Athlete để theo dõi tiến độ, hoặc đăng ký Coach để nhận học viên.</p>
                            <Link to="/profile" className="inline-flex items-center gap-2 mt-3 text-sm font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
                                Tìm hiểu thêm <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <Store className="w-5 h-5" /> Bán hàng trên Marketplace
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Đăng sản phẩm vật lý; listing đầu tiên miễn phí.
                        </p>
                    </div>
                    <Link
                        to="/dashboard/marketplace"
                        className="inline-flex items-center gap-2 self-start sm:self-auto text-sm font-bold uppercase tracking-widest bg-black text-white px-5 py-3 rounded-sm hover:bg-gray-800 transition-colors"
                    >
                        Quản lý cửa hàng <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
