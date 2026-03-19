import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Users, DollarSign, MessageSquare, ClipboardList, User, Search, Calendar, Star, Building2, ShieldAlert } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import apiClient from '../services/api';
import AdminGymApproval from '../components/AdminGymApproval';
import AdminReviewManagement from '../components/AdminReviewManagement';
import AdminGalleryManagement from '../components/AdminGalleryManagement';
import { gymService } from '../services/gymService';
import type { GymTrainerLink } from '../types';
import { useToast } from '../components/Toast';
import QuickActionCard from '../components/dashboard/QuickActionCard';
import StatCard from '../components/dashboard/StatCard';

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
                    { label: 'Học viên', value: String(overview.active_clients ?? '—'), icon: <Users className="w-5 h-5" /> },
                    { label: 'Doanh thu', value: overview.monthly_revenue ? `${Number(overview.monthly_revenue).toLocaleString('vi-VN')} đ` : '—', icon: <DollarSign className="w-5 h-5" /> },
                    { label: 'Tin nhắn', value: String(overview.unread_messages ?? 0), icon: <MessageSquare className="w-5 h-5" /> },
                    { label: 'Chương trình', value: `${overview.published_programs ?? 0}/${overview.total_programs ?? 0}`, icon: <ClipboardList className="w-5 h-5" /> },
                ].map(stat => (
                    <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
                ))}
            </div>

            {/* Quick actions */}
            <div>
                <h3 className="text-h3 border-b border-gray-200 pb-2 mb-4">Lối tắt</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { to: '/programs', icon: <ClipboardList className="w-5 h-5" />, title: 'QUẢN LÝ GÓI TẬP', desc: 'Tạo & publish chương trình' },
                        { to: '/messages', icon: <MessageSquare className="w-5 h-5" />, title: 'TIN NHẮN', desc: 'Chat với học viên' },
                        { to: '/profile', icon: <User className="w-5 h-5" />, title: 'HỒ SƠ COACH', desc: 'Cập nhật thông tin chuyên môn' },
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
        </div>
    );
};

const UserDashboard = () => {
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
    const isComplete = completeness === 100;

    return (
        <div className="space-y-8">
            {!isComplete && (
                <div className="bg-gray-50 border border-gray-200 p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-black uppercase tracking-tight">Hoàn thiện hồ sơ</h3>
                            <span className="bg-black text-white text-xs font-bold px-2 py-0.5 rounded-full">{completeness}%</span>
                        </div>
                        <p className="text-sm text-gray-500">Cập nhật thêm chiều cao, cân nặng và ảnh đại diện để nhận báo cáo BMI & gợi ý lộ trình.</p>

                        <div className="w-full bg-gray-200 h-1.5 mt-4 rounded-full overflow-hidden max-w-sm">
                            <div className="bg-black h-full transition-all duration-1000" style={{ width: `${completeness}%` }}></div>
                        </div>
                    </div>
                    <Link to="/profile" className="bg-black text-white px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors whitespace-nowrap mt-2 sm:mt-0">
                        Cập nhật thông tin
                    </Link>
                </div>
            )}

            {/* Role Upgrade Prompt */}
            <div className="bg-black text-white p-6 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div>
                    <h3 className="text-lg font-black uppercase tracking-tight mb-1">Mục tiêu của bạn là gì?</h3>
                    <p className="text-sm text-gray-400">Bạn đang sử dụng tài khoản cơ bản. Hãy chọn vai trò (Người tập luyện / Coach) để mở khóa toàn bộ tính năng theo dõi.</p>
                </div>
                <Link to="/profile" className="bg-white text-black px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors whitespace-nowrap">
                    Trở thành Athlete
                </Link>
            </div>

            <section className="page-header mb-0">
                <p className="page-kicker">Bảng điều khiển</p>
                <h2 className="section-title">Bắt đầu từ những thao tác quan trọng nhất</h2>
                <p className="page-description">
                    Khám phá coach, theo dõi tin nhắn và cập nhật hồ sơ cá nhân trong cùng một nơi.
                </p>
            </section>

            <div className="grid md:grid-cols-3 gap-4">
                {[
                    { to: '/coaches', icon: <Search className="w-5 h-5" />, title: 'TÌM COACH', desc: 'Khám phá Coach phù hợp với mục tiêu tập luyện' },
                    { to: '/messages', icon: <MessageSquare className="w-5 h-5" />, title: 'TIN NHẮN', desc: 'Nhắn tin với Coach hoặc phòng gym' },
                    { to: '/profile', icon: <User className="w-5 h-5" />, title: 'HỒ SƠ', desc: 'Cập nhật thông tin cá nhân và tài khoản' },
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

            {/* Discovery Feed Mock */}
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-h3 border-b border-gray-200 pb-2 flex-1">Khám phá GYMERVIET</h3>
                    <Link to="/coaches" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black pb-2 ml-4">Xem tất cả</Link>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        {
                            to: '/coaches',
                            icon: <Search className="w-5 h-5" />,
                            title: 'PRIVATE COACH',
                            desc: 'Huấn luyện viên cho lộ trình cá nhân hóa',
                        },
                        {
                            to: '/coaches?type=athlete',
                            icon: <User className="w-5 h-5" />,
                            title: 'ATHLETE PROFILE',
                            desc: 'Khám phá cộng đồng vận động viên theo mục tiêu',
                        },
                        {
                            to: '/gyms',
                            icon: <Building2 className="w-5 h-5" />,
                            title: 'GYM CENTER',
                            desc: 'Tra cứu cơ sở vật chất và chi nhánh gần bạn',
                        },
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
        </div>
    );
};

// Cards for Pro Athlete role
const AthleteDashboard = ({ overview }: { overview: OverviewData }) => (
    <div className="space-y-8">
        {/* Next Workout Hero Card */}
        <div className="bg-black text-white p-8 md:p-10 rounded-xl relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
            <div className="relative z-20 max-w-2xl">
                <span className="inline-block px-3 py-1 bg-white text-black text-[10px] font-black uppercase tracking-widest mb-4">Buổi tập tiếp theo</span>
                <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-3">Chưa có lịch tập</h3>
                <p className="text-gray-400 mb-8 max-w-md">Khám phá các Coach chuyên nghiệp trên GYMERVIET để thiết kế lộ trình tập luyện cá nhân hoá cho riêng bạn.</p>
                <div className="flex gap-4">
                    <Link to="/coaches" className="bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-gray-200 transition-colors inline-block rounded-sm">
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
                { label: 'Số buổi tập', value: String(overview.active_clients ?? '0'), icon: <ClipboardList className="w-5 h-5" /> },
                { label: 'Chuỗi ngày liên tục', value: '0', icon: <Star className="w-5 h-5" /> },
                { label: 'Coach', value: overview.unread_messages ? '1' : '0', icon: <User className="w-5 h-5" /> },
                { label: 'Gói tập active', value: String(overview.published_programs ?? '0'), icon: <Calendar className="w-5 h-5" /> },
            ].map(stat => (
                <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
            ))}
        </div>

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
                { to: '/profile', icon: <Star className="w-5 h-5" />, title: 'PORTFOLIO', desc: 'Cập nhật thành tích thi đấu' },
                { to: '/coaches', icon: <Search className="w-5 h-5" />, title: 'TÌM COACH', desc: 'Khám phá huấn luyện viên phù hợp' },
                { to: '/messages', icon: <MessageSquare className="w-5 h-5" />, title: 'TIN NHẮN', desc: 'Trao đổi về lịch và giáo án' },
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

// Cards for Admin role
const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'gyms' | 'reviews' | 'gallery'>('overview');

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
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`pb-2 px-1 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 ${activeTab === 'gallery' ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                >
                    Gallery
                </button>
            </div>

            {activeTab === 'overview' && (
                <div className="animate-fade-in">
                    <h3 className="text-h3 border-b border-gray-200 pb-2 mb-4">Tổng quan Hệ thống</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Người dùng', value: '—', icon: <Users className="w-5 h-5 text-blue-600" /> },
                            { label: 'Huấn luyện viên', value: '—', icon: <User className="w-5 h-5 text-amber-600" /> },
                            { label: 'Gym Center', value: '—', icon: <Building2 className="w-5 h-5 text-green-600" /> },
                            { label: 'Hồ sơ chờ duyệt', value: '—', icon: <ShieldAlert className="w-5 h-5 text-red-600" /> },
                        ].map(stat => (
                            <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} tone="subtle" />
                        ))}
                    </div>

                    <h3 className="text-h3 border-b border-gray-200 pb-2 mb-4">Truy cập nhanh</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { onClick: () => setActiveTab('gyms'), icon: <Building2 className="w-5 h-5" />, title: 'PHÊ DUYỆT GYM', desc: 'Duyệt hồ sơ Gym Owner mới' },
                            { onClick: () => setActiveTab('reviews'), icon: <Star className="w-5 h-5" />, title: 'ĐÁNH GIÁ GYM', desc: 'Kiểm duyệt review vi phạm' },
                            { onClick: () => setActiveTab('gallery'), icon: <Star className="w-5 h-5" />, title: 'GALLERY MẠNG LƯỚI', desc: 'Quản lý khoảnh khắc đẹp' },
                            { to: '/profile', icon: <ShieldAlert className="w-5 h-5" />, title: 'NGƯỜI DÙNG', desc: 'Tính năng đang được phát triển' },
                        ].map(card => (
                            <QuickActionCard
                                key={card.title}
                                to={card.to}
                                onClick={card.onClick}
                                icon={card.icon}
                                title={card.title}
                                description={card.desc}
                            />
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

            {activeTab === 'gallery' && (
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Quản lý Community Gallery</h3>
                        <button onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black">Quay lại</button>
                    </div>
                    <AdminGalleryManagement />
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
        if (user.user_type === 'trainer' || user.user_type === 'athlete') {
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
            <Helmet>
                <title>Bảng điều khiển — GymViet</title>
                <meta name="description" content="Quản lý hồ sơ, tin nhắn, và các tính năng nâng cao trên GYMERVIET." />
            </Helmet>
            <div className="bg-white border-b border-gray-200">
                <div className="page-container py-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="page-kicker mb-2">
                                Không gian làm việc {roleLabel[user.user_type] ?? 'của bạn'}
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
                {user.user_type === 'athlete' && <AthleteDashboard overview={overview} />}
                {user.user_type === 'user' && <UserDashboard />}
                {user.user_type === 'admin' && <AdminDashboard />}
                {user.user_type === 'gym_owner' && <Navigate to="/gym-owner" replace />}
            </div>
        </div>
    );
}
