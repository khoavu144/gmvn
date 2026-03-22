import React, { useState, useEffect } from 'react';
import { Users, User, Building2, ShieldAlert, Star, Activity, Newspaper, Award } from 'lucide-react';
import apiClient from '../../services/api';
import StatCard from '../../components/dashboard/StatCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import AdminGymApproval from '../../components/AdminGymApproval';
import AdminReviewManagement from '../../components/AdminReviewManagement';
import AdminGalleryManagement from '../../components/AdminGalleryManagement';
import AdminCoachApplications from '../../components/AdminCoachApplications';
import BillingToggleSection from '../../components/dashboard/BillingToggleSection';
import AdminOperationalPanel from '../../components/AdminOperationalPanel';
import AdminUsersPanel from '../../components/AdminUsersPanel';
import AdminContentMarketplacePanel from '../../components/AdminContentMarketplacePanel';

type AdminTab =
    | 'overview'
    | 'ops'
    | 'users'
    | 'content'
    | 'gyms'
    | 'reviews'
    | 'gallery'
    | 'coach-apps';

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [adminStats, setAdminStats] = useState<{
        total_users: number; total_trainers: number; total_gyms: number; monthly_revenue: number;
    } | null>(null);

    useEffect(() => {
        apiClient.get('/dashboard/admin/stats')
            .then(r => setAdminStats(r.data.stats))
            .catch(() => {/* silently ignore — shows — if failed */});
    }, []);

    const fmt = (n: number | undefined) => n !== undefined ? n.toLocaleString('vi') : '—';

    const tabBtn = (id: AdminTab, label: string, tabId: string, panelId: string) => (
        <button
            role="tab"
            id={tabId}
            aria-selected={activeTab === id}
            aria-controls={panelId}
            onClick={() => setActiveTab(id)}
            className={`pb-2 px-1 font-bold text-sm uppercase tracking-wider transition-colors border-b-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-lg ${activeTab === id ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap gap-x-4 gap-y-2 border-b border-gray-200" role="tablist" aria-label="Admin Dashboard Tabs">
                {tabBtn('overview', 'Tổng quan', 'tab-overview', 'panel-overview')}
                {tabBtn('ops', 'Vận hành', 'tab-ops', 'panel-ops')}
                {tabBtn('users', 'Người dùng', 'tab-users', 'panel-users')}
                {tabBtn('content', 'Tin & TMĐT', 'tab-content', 'panel-content')}
                {tabBtn('gyms', 'Phê duyệt Gym', 'tab-gyms', 'panel-gyms')}
                {tabBtn('reviews', 'Đánh giá', 'tab-reviews', 'panel-reviews')}
                {tabBtn('gallery', 'Gallery', 'tab-gallery', 'panel-gallery')}
                {tabBtn('coach-apps', 'Đơn Coach', 'tab-coach-apps', 'panel-coach-apps')}
            </div>

            {activeTab === 'overview' && (
                <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="animate-fade-in focus:outline-none" tabIndex={0}>
                    <h3 className="text-h3 border-b border-gray-200 pb-2 mb-4">Tổng quan Hệ thống</h3>
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

                    <h3 className="text-h3 border-b border-gray-200 pb-2 mb-4">Truy cập nhanh</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                        {[
                            { onClick: () => setActiveTab('ops'), icon: <Activity className="w-5 h-5" />, title: 'VẬN HÀNH', desc: 'Sức khỏe hệ thống, audit, giao dịch, gói platform' },
                            { onClick: () => setActiveTab('users'), icon: <Users className="w-5 h-5" />, title: 'NGƯỜI DÙNG', desc: 'Danh sách & tìm kiếm tài khoản' },
                            { onClick: () => setActiveTab('content'), icon: <Newspaper className="w-5 h-5" />, title: 'TIN & TMĐT', desc: 'Tin tức admin, kiểm duyệt sản phẩm' },
                            { onClick: () => setActiveTab('gyms'), icon: <Building2 className="w-5 h-5" />, title: 'PHÊ DUYỆT GYM', desc: 'Duyệt hồ sơ Gym Owner mới' },
                            { onClick: () => setActiveTab('reviews'), icon: <Star className="w-5 h-5" />, title: 'ĐÁNH GIÁ GYM', desc: 'Kiểm duyệt review vi phạm' },
                            { onClick: () => setActiveTab('gallery'), icon: <Star className="w-5 h-5" />, title: 'GALLERY MẠNG LƯỚI', desc: 'Quản lý khoảnh khắc đẹp' },
                            { onClick: () => setActiveTab('coach-apps'), icon: <Award className="w-5 h-5" />, title: 'ĐƠN COACH', desc: 'Đơn nâng cấp Athlete → Coach' },
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

                    <h3 className="text-h3 border-b border-gray-200 pb-2 mb-4">Thu phí nền tảng</h3>
                    <BillingToggleSection />
                </div>
            )}

            {activeTab === 'ops' && (
                <div id="panel-ops" role="tabpanel" aria-labelledby="tab-ops" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Vận hành & giám sát</h3>
                        <button type="button" onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">Quay lại</button>
                    </div>
                    <AdminOperationalPanel />
                </div>
            )}

            {activeTab === 'users' && (
                <div id="panel-users" role="tabpanel" aria-labelledby="tab-users" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Người dùng</h3>
                        <button type="button" onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">Quay lại</button>
                    </div>
                    <AdminUsersPanel />
                </div>
            )}

            {activeTab === 'content' && (
                <div id="panel-content" role="tabpanel" aria-labelledby="tab-content" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Tin tức & Marketplace</h3>
                        <button type="button" onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">Quay lại</button>
                    </div>
                    <AdminContentMarketplacePanel />
                </div>
            )}

            {activeTab === 'gyms' && (
                <div id="panel-gyms" role="tabpanel" aria-labelledby="tab-gyms" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Hồ sơ chờ phê duyệt</h3>
                        <button type="button" onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">Quay lại</button>
                    </div>
                    <AdminGymApproval />
                </div>
            )}

            {activeTab === 'reviews' && (
                <div id="panel-reviews" role="tabpanel" aria-labelledby="tab-reviews" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Quản lý Đánh giá</h3>
                        <button type="button" onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">Quay lại</button>
                    </div>
                    <AdminReviewManagement />
                </div>
            )}

            {activeTab === 'gallery' && (
                <div id="panel-gallery" role="tabpanel" aria-labelledby="tab-gallery" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black uppercase">Quản lý Community Gallery</h3>
                        <button type="button" onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">Quay lại</button>
                    </div>
                    <AdminGalleryManagement />
                </div>
            )}

            {activeTab === 'coach-apps' && (
                <div id="panel-coach-apps" role="tabpanel" aria-labelledby="tab-coach-apps" className="focus:outline-none" tabIndex={0}>
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-black uppercase">Đơn đăng ký làm Coach</h3>
                            <p className="text-xs text-gray-500 mt-1">Duyệt hoặc từ chối đơn của Athlete muốn nâng cấp thành Coach</p>
                        </div>
                        <button type="button" onClick={() => setActiveTab('overview')} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black">Quay lại</button>
                    </div>
                    <AdminCoachApplications />
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
