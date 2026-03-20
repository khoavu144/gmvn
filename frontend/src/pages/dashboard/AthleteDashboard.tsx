import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ClipboardList, Star, User, Calendar, Search, Eye } from 'lucide-react';
import type { RootState } from '../../store/store';
import StatCard from '../../components/dashboard/StatCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import UpgradeToCoachBanner from '../../components/dashboard/UpgradeToCoachBanner';

export interface OverviewData {
    active_clients?: number;
    monthly_revenue?: number;
    unread_messages?: number;
    total_programs?: number;
    published_programs?: number;
    week_sessions?: number;
    active_subscriptions?: number;
    unread_notifications?: number;
}

const AthleteDashboard: React.FC<{ overview: OverviewData }> = ({ overview }) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const publicProfileUrl = user ? `/athletes/${user.id}` : '/coaches?type=athlete';

    return (
        <div className="space-y-8">
            {/* Next Workout Hero Card */}
            <div className="bg-black text-white p-8 md:p-10 rounded-xl relative overflow-hidden group shadow-md">
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
                <div className="relative z-20 max-w-2xl">
                    <span className="inline-block px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest mb-4">Buổi tập tiếp theo</span>
                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">Chưa có lịch tập</h3>
                    <p className="text-[color:var(--mk-muted)] mb-8 max-w-md">Khám phá các Coach chuyên nghiệp trên GYMERVIET để thiết kế lộ trình tập luyện cá nhân hoá cho riêng bạn.</p>
                    <div className="flex gap-4">
                        <Link to="/coaches" className="bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-[color:var(--mk-paper-strong)] transition-colors inline-block rounded-sm">
                            Tìm Coach ngay
                        </Link>
                        <Link to="/workouts" className="border border-gray-600 text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:border-white transition-colors inline-block rounded-sm hidden md:inline-block">
                            Lịch tập của tôi
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Số buổi tuần', value: String(overview.week_sessions ?? '0'), icon: <ClipboardList className="w-5 h-5" /> },
                    { label: 'Đăng ký đang chạy', value: String(overview.active_subscriptions ?? '0'), icon: <Star className="w-5 h-5" /> },
                    { label: 'Thông báo', value: String(overview.unread_notifications ?? '0'), icon: <User className="w-5 h-5" /> },
                    { label: 'Gói tập active', value: String(overview.active_subscriptions ?? '0'), icon: <Calendar className="w-5 h-5" /> },
                ].map(stat => (
                    <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
                ))}
            </div>

            {/* Athlete public profile preview banner */}
            <div className="flex items-center justify-between gap-4 bg-gray-900 text-white rounded-xl px-5 py-4">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-[color:var(--mk-muted)] mb-1">Hồ sơ Athlete public của bạn</p>
                    <p className="text-sm font-bold truncate max-w-xs">{window.location.origin}{publicProfileUrl}</p>
                </div>
                <Link
                    to={publicProfileUrl}
                    target="_blank"
                    className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-wider hover:bg-[color:var(--mk-paper)] transition-colors whitespace-nowrap shrink-0"
                >
                    <Eye className="w-3.5 h-3.5" />
                    Xem ngay
                </Link>
            </div>

            <UpgradeToCoachBanner />

            <section className="page-header mb-0">
                <p className="page-kicker">Không gian Luyện tập</p>
                <h2 className="section-title">Theo dõi lịch tập và xây dựng hồ sơ thi đấu</h2>
                <p className="page-description">
                    Tập trung vào lịch tập, hồ sơ vận động viên và kết nối với coach thay vì các công cụ quản trị chương trình.
                </p>
            </section>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { to: '/workouts', icon: <Calendar className="w-5 h-5" />, title: 'LỊCH TẬP', desc: 'Theo dõi lịch tập và điểm số tiến độ' },
                    { to: '/profile', icon: <Star className="w-5 h-5" />, title: 'CẬP NHẬT HỒ SƠ', desc: 'Cập nhật thành tích thi đấu' },
                    { to: '/coaches', icon: <Search className="w-5 h-5" />, title: 'TÌM COACH', desc: 'Khám phá huấn luyện viên phù hợp' },
                    { to: publicProfileUrl, icon: <Eye className="w-5 h-5" />, title: 'XEM PROFILE PUBLIC', desc: 'Kiểm tra giao diện người dùng nhìn thấy' },
                ].map(card => (
                    <QuickActionCard
                        key={card.to}
                        to={card.to}
                        icon={card.icon}
                        title={card.title}
                        description={card.desc}
                    />
                ))}
            </div>
        </div>
    );
};

export default AthleteDashboard;
