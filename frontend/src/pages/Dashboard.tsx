import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import apiClient from '../services/api';
import AdminGymApproval from '../components/AdminGymApproval';
import AdminReviewManagement from '../components/AdminReviewManagement';
import { gymService } from '../services/gymService';
import type { GymTrainerLink } from '../types';
import { useToast } from '../components/Toast';

interface OverviewData {
    active_clients?: number;
    monthly_revenue?: number;
    unread_messages?: number;
    total_programs?: number;
    published_programs?: number;
}

// Cards for Coach role
const CoachDashboard = ({ overview }: { overview: OverviewData }) => {
    const { toast, ToastComponent } = useToast();
    const [invitations, setInvitations] = useState<GymTrainerLink[]>([]);
    const [loadingInvs, setLoadingInvs] = useState(true);

    useEffect(() => {
        gymService.getTrainerInvitations()
            .then(res => {
                if (res.success) setInvitations(res.invitations || []);
            })
            .finally(() => setLoadingInvs(false));
    }, []);

    const handleAccept = async (id: string) => {
        try {
            const res = await gymService.acceptInvitation(id);
            if (res.success) {
                toast.success('Đã chấp nhận lời mời hợp tác!');
                setInvitations(prev => prev.filter(i => i.id !== id));
            }
        } catch (error) { toast.error('Lỗi khi thực hiện'); }
    };

    const handleDecline = async (id: string) => {
        try {
            const res = await gymService.declineInvitation(id);
            if (res.success) {
                toast.success('Đã từ chối lời mời');
                setInvitations(prev => prev.filter(i => i.id !== id));
            }
        } catch (error) { toast.error('Lỗi khi thực hiện'); }
    };

    return (
        <div className="space-y-8">
            {ToastComponent}
            {/* Invitations Alert */}
            {!loadingInvs && invitations.length > 0 && (
                <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-6 animate-pulse-subtle">
                    <h3 className="font-black uppercase tracking-tight text-amber-800 mb-4 flex items-center gap-2">
                        <span>🔔</span> Bạn có {invitations.length} lời mời hợp tác mới
                    </h3>
                    <div className="grid gap-4">
                        {invitations.map(inv => (
                            <div key={inv.id} className="bg-white border border-amber-200 p-4 rounded-lg flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-bold text-sm">{inv.gym_center?.name}</p>
                                    <p className="text-xs text-gray-500">Vị trí: {inv.role_at_gym || 'Coach'} • Chi nhánh: {inv.branch?.branch_name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAccept(inv.id)} className="bg-black text-white px-3 py-1.5 rounded-xs text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">Chấp nhận</button>
                                    <button onClick={() => handleDecline(inv.id)} className="text-gray-400 px-3 py-1.5 rounded-xs text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors">Từ chối</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                        { to: '/profile', icon: '👤', title: 'Hồ sơ Coach', desc: 'Cập nhật thông tin chuyên môn' },
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
};

// Cards for Normal User role
const UserDashboard = () => (
    <div className="space-y-8">
        <section className="page-header mb-0">
            <p className="page-kicker">Lối tắt</p>
            <h2 className="section-title">Bắt đầu từ những thao tác quan trọng nhất</h2>
            <p className="page-description">
                Khám phá coach, theo dõi tin nhắn và cập nhật hồ sơ cá nhân trong cùng một nơi.
            </p>
        </section>

        <div className="grid md:grid-cols-3 gap-4">
            {[
                { to: '/coaches', icon: '🔍', title: 'Tìm Coach', desc: 'Khám phá Coach phù hợp với mục tiêu tập luyện của bạn' },
                { to: '/messages', icon: '💬', title: 'Tin nhắn', desc: 'Nhắn tin với Coach hoặc phòng gym bạn đang quan tâm' },
                { to: '/profile', icon: '👤', title: 'Hồ sơ', desc: 'Cập nhật thông tin cá nhân và trạng thái public profile' },
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
);

// Cards for Pro Athlete role
const AthleteDashboard = () => (
    <div className="space-y-8">
        <section className="page-header mb-0">
            <p className="page-kicker">Athlete Workspace</p>
            <h2 className="section-title">Theo dõi lịch tập và xây dựng hồ sơ thi đấu</h2>
            <p className="page-description">
                Tập trung vào lịch tập, hồ sơ vận động viên và kết nối với coach thay vì các công cụ quản trị chương trình.
            </p>
        </section>

        <div className="grid md:grid-cols-3 gap-4">
            {[
                { to: '/workouts', icon: '🏋️', title: 'Lịch tập của tôi', desc: 'Xem lịch tập theo tuần và đánh dấu hoàn thành từng buổi' },
                { to: '/profile', icon: '🌟', title: 'Hồ sơ Portfolio', desc: 'Cập nhật profile vận động viên, gallery và thành tích' },
                { to: '/coaches', icon: '🔍', title: 'Tìm Coach', desc: 'Khám phá coach phù hợp để đồng hành dài hạn' },
                { to: '/messages', icon: '💬', title: 'Tin nhắn', desc: 'Trao đổi với coach về lộ trình tập luyện và tiến độ' },
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
);

// Cards for Admin role
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'gyms' | 'reviews'>('overview');

    return (
        <div className="space-y-8">
            <div className="flex gap-4 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2 px-1 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                >
                    Tổng quan
                </button>
                <button
                    onClick={() => setActiveTab('gyms')}
                    className={`pb-2 px-1 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'gyms' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                >
                    Phê duyệt Gym
                </button>
                <button
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2 px-1 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'reviews' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                >
                    Đánh giá
                </button>
            </div>

            {activeTab === 'overview' && (
                <div>
                    <h3 className="text-h3 border-b border-gray-200 pb-2 mb-4">Quản trị Hệ thống</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { onClick: () => setActiveTab('gyms'), icon: '🏢', title: 'Phê duyệt Gym Center', desc: 'Duyệt hồ sơ Gym Owner mới' },
                            { onClick: () => setActiveTab('reviews'), icon: '⭐', title: 'Quản lý Đánh giá Gym', desc: 'Kiểm duyệt review vi phạm' },
                            { to: '#', icon: '👤', title: 'Quản trị Người dùng', desc: 'Xử lý báo cáo vi phạm' },
                        ].map(card => (
                            card.onClick ? (
                                <button key={card.title} onClick={card.onClick} className="card text-left flex flex-col group border-black hover:bg-black hover:text-white transition-colors">
                                    <div className="text-2xl mb-3 text-gray-700 group-hover:text-white">{card.icon}</div>
                                    <h4 className="text-sm font-semibold text-black group-hover:text-white">{card.title}</h4>
                                    <p className="text-xs text-gray-600 group-hover:text-gray-300 mt-1 flex-1">{card.desc}</p>
                                </button>
                            ) : (
                                <Link key={card.title} to={card.to || '#'} className="card flex flex-col group border-black hover:bg-black hover:text-white transition-colors">
                                    <div className="text-2xl mb-3 text-gray-700 group-hover:text-white">{card.icon}</div>
                                    <h4 className="text-sm font-semibold text-black group-hover:text-white">{card.title}</h4>
                                    <p className="text-xs text-gray-600 group-hover:text-gray-300 mt-1 flex-1">{card.desc}</p>
                                </Link>
                            )
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'gyms' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Hồ sơ chờ phê duyệt</h3>
                        <button onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black">Quay lại</button>
                    </div>
                    <AdminGymApproval />
                </div>
            )}

            {activeTab === 'reviews' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Quản lý Đánh giá</h3>
                        <button onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black">Quay lại</button>
                    </div>
                    <AdminReviewManagement />
                </div>
            )}
        </div>
    );
};

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

    const roleLabel: Record<string, string> = {
        trainer: 'Coach', athlete: 'Athlete', gym_owner: 'Chủ Gym', admin: 'Admin', user: 'Người dùng',
    };

    return (
        <div className="page-shell-muted">
            <div className="bg-white border-b border-gray-200">
                <div className="page-container py-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="page-kicker mb-2">
                                {roleLabel[user.user_type] ?? 'Dashboard'} Workspace
                            </p>
                            <h1 className="page-title">
                                Xin chào, {user.full_name.split(' ').pop()} 👋
                            </h1>
                            <p className="page-description">
                                Tổng hợp các thao tác quan trọng nhất cho tài khoản {roleLabel[user.user_type]?.toLowerCase() ?? 'người dùng'} của bạn.
                            </p>
                        </div>
                        <Link
                            to="/profile"
                            className="btn-secondary self-start sm:self-auto"
                        >
                            Cập nhật hồ sơ →
                        </Link>
                    </div>
                </div>
            </div>

            <div className="page-container">
                {user.user_type === 'trainer' && <CoachDashboard overview={overview} />}
                {user.user_type === 'athlete' && <AthleteDashboard />}
                {user.user_type === 'user' && <UserDashboard />}
                {user.user_type === 'admin' && <AdminDashboard />}
            </div>
        </div>
    );
}
