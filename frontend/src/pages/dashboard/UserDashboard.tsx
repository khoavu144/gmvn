import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
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
            <div className="bg-white border border-[color:var(--mk-line)] rounded-lg p-6 sm:p-8 shadow-sm">
                <div className="mb-8">
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Bắt đầu hành trình</h2>
                    <p className="text-[color:var(--mk-muted)]">Hoàn tất các bước dưới đây để tối ưu hóa trải nghiệm của bạn trên GYMERVIET.</p>
                    
                    <div className="w-full bg-[color:var(--mk-paper)] h-2 mt-6 rounded-full overflow-hidden">
                        <div className="bg-black h-full transition-all duration-1000" style={{ width: `${completeness / 100 * 25 + 25}%` }}></div>
                    </div>
                    <p className="text-[10px] font-bold text-[color:var(--mk-muted)] mt-2 uppercase tracking-widest text-right">Tiến độ</p>
                </div>

                <div className="space-y-4">
                    {/* Step 1 */}
                    <div className="flex items-start gap-4 p-4 rounded-lg bg-[color:var(--mk-paper)] border border-[color:var(--mk-line)] opacity-70 cursor-default">
                        <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-[color:var(--mk-muted)] line-through">Tạo tài khoản</h3>
                            <p className="text-sm text-[color:var(--mk-muted)]">Chào mừng bạn gia nhập cộng đồng.</p>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${isProfileComplete ? 'bg-[color:var(--mk-paper)] border-[color:var(--mk-line)] opacity-70' : 'bg-white border-black shadow-sm'}`}>
                        {isProfileComplete ? (
                            <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                            <Circle className="w-6 h-6 text-gray-300 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <h3 className={`font-bold text-[color:var(--mk-text)] ${isProfileComplete ? 'line-through text-[color:var(--mk-muted)]' : ''}`}>
                                Hoàn thiện hồ sơ ({completeness}%)
                            </h3>
                            <p className="text-sm text-[color:var(--mk-muted)] mt-1">Cập nhật chiều cao, cân nặng, ảnh đại diện để nhận báo cáo BMI & gợi ý lộ trình.</p>
                            {!isProfileComplete && (
                                <Link to="/profile" className="inline-flex items-center gap-2 mt-3 text-sm font-bold uppercase tracking-widest hover:text-[color:var(--mk-text-soft)] transition-colors">
                                    Cập nhật ngay <ArrowRight className="w-4 h-4" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-white border-[color:var(--mk-line)] hover:border-[color:var(--mk-line)] transition-colors group">
                        <Circle className="w-6 h-6 text-gray-300 shrink-0 mt-0.5 group-hover:text-[color:var(--mk-muted)] transition-colors" />
                        <div className="flex-1">
                            <h3 className="font-bold text-[color:var(--mk-text)]">Khám phá không gian tập luyện</h3>
                            <p className="text-sm text-[color:var(--mk-muted)] mt-1">Tìm kiếm phòng gym, yoga, pilates phù hợp quanh bạn.</p>
                            <Link to="/gyms" className="inline-flex items-center gap-2 mt-3 text-sm font-bold uppercase tracking-widest hover:text-[color:var(--mk-text-soft)] transition-colors">
                                Xem danh sách <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-start gap-4 p-4 rounded-lg border bg-white border-[color:var(--mk-line)] hover:border-[color:var(--mk-line)] transition-colors group">
                        <Circle className="w-6 h-6 text-gray-300 shrink-0 mt-0.5 group-hover:text-[color:var(--mk-muted)] transition-colors" />
                        <div className="flex-1">
                            <h3 className="font-bold text-[color:var(--mk-text)]">Nâng cấp thành Athlete hoặc Coach</h3>
                            <p className="text-sm text-[color:var(--mk-muted)] mt-1">Trở thành Athlete để mở khóa tính năng theo dõi tiến độ, hoặc Coach để khai thác học viên.</p>
                            <Link to="/profile" className="inline-flex items-center gap-2 mt-3 text-sm font-bold uppercase tracking-widest hover:text-[color:var(--mk-text-soft)] transition-colors">
                                Tìm hiểu thêm <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
