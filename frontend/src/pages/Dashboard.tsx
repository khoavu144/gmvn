import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import apiClient from '../services/api';

interface OverviewData {
    active_clients?: number;
    monthly_revenue?: number;
    unread_messages?: number;
    total_programs?: number;
    published_programs?: number;
}

// Cards for Trainer role
const TrainerDashboard = ({ overview }: { overview: OverviewData }) => (
    <div className="space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Học viên đang học', value: overview.active_clients ?? '—', icon: '👥' },
                { label: 'Doanh thu/tháng', value: overview.monthly_revenue ? `${Number(overview.monthly_revenue).toLocaleString('vi-VN')} đ` : '—', icon: '💰' },
                { label: 'Tin nhắn chưa đọc', value: overview.unread_messages ?? 0, icon: '💬' },
                { label: 'Chương trình', value: `${overview.published_programs ?? 0}/${overview.total_programs ?? 0}`, icon: '📋' },
            ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-xs p-4 flex flex-col hover:border-gray-300 transition-colors">
                    <div className="text-2xl mb-2 text-gray-500">{stat.icon}</div>
                    <div className="text-xl font-bold text-black">{stat.value}</div>
                    <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                </div>
            ))}
        </div>

        {/* Quick actions */}
        <div>
            <h3 className="text-h3 border-b border-gray-200 pb-2 mb-4">Lối tắt</h3>
            <div className="grid md:grid-cols-3 gap-4">
                {[
                    { to: '/programs', icon: '📋', title: 'Quản lý Gói tập', desc: 'Tạo & publish chương trình' },
                    { to: '/messages', icon: '💬', title: 'Tin nhắn', desc: 'Chat với học viên' },
                    { to: '/profile', icon: '👤', title: 'Hồ sơ của tôi', desc: 'Cập nhật thông tin' },
                ].map(card => (
                    <Link key={card.to} to={card.to} className="card flex flex-col group">
                        <div className="text-2xl mb-3 text-gray-700">{card.icon}</div>
                        <h4 className="text-sm font-semibold text-black">{card.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 flex-1">{card.desc}</p>
                        <span className="text-black text-sm font-medium group-hover:translate-x-1 transition-transform inline-block mt-3 border-t border-gray-100 pt-3">
                            Mở →
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    </div>
);

// Cards for Normal User role
const UserDashboard = () => (
    <div className="space-y-8">
        <div>
            <h3 className="text-h3 border-b border-gray-200 pb-2 mb-4">Lối tắt</h3>
            <div className="grid md:grid-cols-3 gap-4">
                {[
                    { to: '/workouts', icon: '🏋️', title: 'Lịch tập của tôi', desc: 'Xem & hoàn thành bài tập' },
                    { to: '/trainers', icon: '🔍', title: 'Tìm HLV', desc: 'Khám phá huấn luyện viên' },
                    { to: '/messages', icon: '💬', title: 'Tin nhắn', desc: 'Nhắn tin với HLV' },
                    { to: '/profile', icon: '👤', title: 'Hồ sơ', desc: 'Cập nhật thông tin cá nhân' },
                ].map(card => (
                    <Link key={card.to} to={card.to} className="card flex flex-col group">
                        <div className="text-2xl mb-3 text-gray-700">{card.icon}</div>
                        <h4 className="text-sm font-semibold text-black">{card.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 flex-1">{card.desc}</p>
                        <span className="text-black text-sm font-medium group-hover:translate-x-1 transition-transform inline-block mt-3 border-t border-gray-100 pt-3">
                            Mở →
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    </div>
);

// Cards for Pro Athlete role
const AthleteDashboard = () => (
    <div className="space-y-8">
        <div>
            <h3 className="text-h3 border-b border-gray-200 pb-2 mb-4">Lối tắt chuyên nghiệp (Athlete)</h3>
            <div className="grid md:grid-cols-3 gap-4">
                {[
                    { to: '/programs', icon: '📋', title: 'Quản lý Gói tập', desc: 'Tạo & publish chương trình' },
                    { to: '/workouts', icon: '🏋️', title: 'Lịch tập của tôi', desc: 'Xem & hoàn thành bài tập' },
                    { to: '/profile', icon: '🌟', title: 'Hồ sơ Portfolio', desc: 'Cập nhật Profile Vận động viên' },
                    { to: '/trainers', icon: '🔍', title: 'Tìm HLV', desc: 'Khám phá huấn luyện viên' },
                    { to: '/messages', icon: '💬', title: 'Tin nhắn', desc: 'Nhắn tin với HLV/Học viên' },
                ].map(card => (
                    <Link key={card.to} to={card.to} className="card flex flex-col group">
                        <div className="text-2xl mb-3 text-gray-700">{card.icon}</div>
                        <h4 className="text-sm font-semibold text-black">{card.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 flex-1">{card.desc}</p>
                        <span className="text-black text-sm font-medium group-hover:translate-x-1 transition-transform inline-block mt-3 border-t border-gray-100 pt-3">
                            Mở →
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const user = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();
    const [overview, setOverview] = useState<OverviewData>({});

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.user_type === 'trainer') {
            apiClient.get('/dashboard/overview')
                .then(res => setOverview(res.data.overview || {}))
                .catch(() => { });
        }
    }, [user, navigate]);

    if (!user) return null;

    return (
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
            <div className="mb-8">
                <h2 className="text-h2">
                    Dashboard
                </h2>
                <p className="text-muted mt-1">Xin chào, {user.full_name}. Chúc bạn một ngày hiệu quả.</p>
            </div>

            {user.user_type === 'trainer' && <TrainerDashboard overview={overview} />}
            {user.user_type === 'athlete' && <AthleteDashboard />}
            {user.user_type === 'user' && <UserDashboard />}
        </main>
    );
}
