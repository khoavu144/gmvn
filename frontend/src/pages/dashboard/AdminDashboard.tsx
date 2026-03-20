import React, { useState, useEffect } from 'react';
import { Users, User, Building2, ShieldAlert, Star } from 'lucide-react';
import apiClient from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import AdminGymApproval from '../../components/AdminGymApproval';
import AdminReviewManagement from '../../components/AdminReviewManagement';
import AdminGalleryManagement from '../../components/AdminGalleryManagement';
import AdminCoachApplications from '../../components/AdminCoachApplications';
import BillingToggleSection from '../../components/dashboard/BillingToggleSection';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'gyms' | 'reviews' | 'gallery' | 'coach-apps'>('overview');
    const [adminStats, setAdminStats] = useState<{
        total_users: number; total_trainers: number; total_gyms: number; monthly_revenue: number;
    } | null>(null);

    useEffect(() => {
        apiClient.get('/dashboard/admin/stats')
            .then(r => setAdminStats(r.data.stats))
            .catch(() => {/* silently ignore — shows — if failed */});
    }, []);

    const fmt = (n: number | undefined) => n !== undefined ? n.toLocaleString('vi') : '—';

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-4 border-b border-[color:var(--mk-line)]" role="tablist" aria-label="Admin Dashboard Tabs">
                <button
                    role="tab"
                    id="tab-overview"
                    aria-selected={activeTab === 'overview'}
                    aria-controls="panel-overview"
                    onClick={() => setActiveTab('overview')}
                    className={`pb-2 px-1 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg ${activeTab === 'overview' ? 'border-black text-black' : 'border-transparent text-[color:var(--mk-muted)]'}`}
                >
                    Tổng quan
                </button>
                <button
                    role="tab"
                    id="tab-gyms"
                    aria-selected={activeTab === 'gyms'}
                    aria-controls="panel-gyms"
                    onClick={() => setActiveTab('gyms')}
                    className={`pb-2 px-1 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg ${activeTab === 'gyms' ? 'border-black text-black' : 'border-transparent text-[color:var(--mk-muted)]'}`}
                >
                    Phê duyệt Gym
                </button>
                <button
                    role="tab"
                    id="tab-reviews"
                    aria-selected={activeTab === 'reviews'}
                    aria-controls="panel-reviews"
                    onClick={() => setActiveTab('reviews')}
                    className={`pb-2 px-1 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg ${activeTab === 'reviews' ? 'border-black text-black' : 'border-transparent text-[color:var(--mk-muted)]'}`}
                >
                    Đánh giá
                </button>
                <button
                    role="tab"
                    id="tab-gallery"
                    aria-selected={activeTab === 'gallery'}
                    aria-controls="panel-gallery"
                    onClick={() => setActiveTab('gallery')}
                    className={`pb-2 px-1 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg ${activeTab === 'gallery' ? 'border-black text-black' : 'border-transparent text-[color:var(--mk-muted)]'}`}
                >
                    Gallery
                </button>
                <button
                    role="tab"
                    id="tab-coach-apps"
                    aria-selected={activeTab === 'coach-apps'}
                    aria-controls="panel-coach-apps"
                    onClick={() => setActiveTab('coach-apps')}
                    className={`pb-2 px-1 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg ${activeTab === 'coach-apps' ? 'border-black text-black' : 'border-transparent text-[color:var(--mk-muted)]'}`}
                >
                    Đơn Coach
                </button>
            </div>

            {activeTab === 'overview' && (
                <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="animate-fade-in focus:outline-none" tabIndex={0}>
                    <h3 className="text-h3 border-b border-[color:var(--mk-line)] pb-2 mb-4">Tổng quan Hệ thống</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Người dùng', value: fmt(adminStats?.total_users), icon: <Users className="w-5 h-5 text-blue-600" /> },
                            { label: 'Huấn luyện viên', value: fmt(adminStats?.total_trainers), icon: <User className="w-5 h-5 text-amber-600" /> },
                            { label: 'Gym Center', value: fmt(adminStats?.total_gyms), icon: <Building2 className="w-5 h-5 text-green-600" /> },
                            { label: 'Doanh thu/tháng', value: adminStats ? `${fmt(adminStats.monthly_revenue)}đ` : '—', icon: <ShieldAlert className="w-5 h-5 text-red-600" /> },
                        ].map(stat => (
                            <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} tone="subtle" />
                        ))}
                    </div>

                    <h3 className="text-h3 border-b border-[color:var(--mk-line)] pb-2 mb-4">Truy cập nhanh</h3>
                    <div className="grid md:grid-cols-3 gap-4 mb-8">
                        {[
                            { onClick: () => setActiveTab('gyms'), icon: <Building2 className="w-5 h-5" />, title: 'PHÊ DUYỆT GYM', desc: 'Duyệt hồ sơ Gym Owner mới' },
                            { onClick: () => setActiveTab('reviews'), icon: <Star className="w-5 h-5" />, title: 'ĐÁNH GIÁ GYM', desc: 'Kiểm duyệt review vi phạm' },
                            { onClick: () => setActiveTab('gallery'), icon: <Star className="w-5 h-5" />, title: 'GALLERY MẠNG LƯỚI', desc: 'Quản lý khoảnh khắc đẹp' },
                        ].map(card => (
                            <QuickActionCard
                                key={card.title}
                                to={undefined as any}
                                onClick={card.onClick}
                                icon={card.icon}
                                title={card.title}
                                description={card.desc}
                            />
                        ))}
                    </div>

                    <h3 className="text-h3 border-b border-[color:var(--mk-line)] pb-2 mb-4">Thu phí nền tảng</h3>
                    <BillingToggleSection />
                </div>
            )}

            {activeTab === 'gyms' && (
                <div id="panel-gyms" role="tabpanel" aria-labelledby="tab-gyms" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Hồ sơ chờ phê duyệt</h3>
                        <button onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-[color:var(--mk-muted)] hover:text-black">Quay lại</button>
                    </div>
                    <AdminGymApproval />
                </div>
            )}

            {activeTab === 'reviews' && (
                <div id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Quản lý Đánh giá</h3>
                        <button onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-[color:var(--mk-muted)] hover:text-black">Quay lại</button>
                    </div>
                    <AdminReviewManagement />
                </div>
            )}

            {activeTab === 'gallery' && (
                <div id="panel-gallery" role="tabpanel" aria-labelledby="tab-gallery" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Quản lý Community Gallery</h3>
                        <button onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-[color:var(--mk-muted)] hover:text-black">Quay lại</button>
                    </div>
                    <AdminGalleryManagement />
                </div>
            )}

            {activeTab === 'coach-apps' && (
                <div id="panel-coach-apps" role="tabpanel" aria-labelledby="tab-coach-apps" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-black uppercase">Đơn đăng ký làm Coach</h3>
                            <p className="text-xs text-[color:var(--mk-muted)] mt-1">Duyệt hoặc từ chối đơn của Athlete muốn nâng cấp thành Coach</p>
                        </div>
                        <button onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-[color:var(--mk-muted)] hover:text-black">Quay lại</button>
                    </div>
                    <AdminCoachApplications />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
