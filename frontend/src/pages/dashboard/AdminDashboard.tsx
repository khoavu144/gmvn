import React, { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
    Users,
    User,
    Building2,
    Activity,
    Newspaper,
    Star,
    Award,
    Banknote,
    Images,
} from 'lucide-react';
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
import AdminDashboardShell from '../../components/admin/AdminDashboardShell';
import {
    ADMIN_TAB_QUERY_KEY,
    parseAdminTabParam,
    type AdminTab,
} from './adminNavConfig';

type AdminStats = {
    total_users: number;
    total_trainers: number;
    total_gyms: number;
    monthly_revenue: number;
};

const AdminDashboard: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = useMemo(
        () => parseAdminTabParam(searchParams.get(ADMIN_TAB_QUERY_KEY)),
        [searchParams]
    );

    const setTab = useCallback(
        (tab: AdminTab) => {
            if (tab === 'overview') {
                setSearchParams({}, { replace: true });
            } else {
                setSearchParams({ [ADMIN_TAB_QUERY_KEY]: tab }, { replace: true });
            }
        },
        [setSearchParams]
    );

    const {
        data: adminStats,
        isLoading: statsLoading,
        isError: statsError,
        refetch: refetchStats,
    } = useQuery({
        queryKey: ['admin-dashboard-stats'],
        queryFn: async () => {
            const res = await apiClient.get('/dashboard/admin/stats');
            return (res?.data?.stats ?? null) as AdminStats | null;
        },
        staleTime: 60_000,
        retry: 1,
    });

    const statsLoad: 'loading' | 'ok' | 'err' =
        statsLoading ? 'loading' : statsError || !adminStats ? 'err' : 'ok';

    const fmt = useCallback((n: number | undefined) => (n !== undefined ? n.toLocaleString('vi') : '—'), []);

    const statValues = useMemo(() => {
        if (statsLoad !== 'ok' || !adminStats) {
            return [
                { label: 'Người dùng', value: statsLoad === 'loading' ? '…' : '—', icon: <Users className="h-5 w-5 text-blue-600" /> },
                { label: 'Huấn luyện viên', value: statsLoad === 'loading' ? '…' : '—', icon: <User className="h-5 w-5 text-amber-600" /> },
                { label: 'Gym center', value: statsLoad === 'loading' ? '…' : '—', icon: <Building2 className="h-5 w-5 text-green-600" /> },
                {
                    label: 'Doanh thu tháng',
                    value: statsLoad === 'loading' ? '…' : '—',
                    icon: <Banknote className="h-5 w-5 text-emerald-700" />,
                },
            ];
        }
        return [
            { label: 'Người dùng', value: fmt(adminStats.total_users), icon: <Users className="h-5 w-5 text-blue-600" /> },
            { label: 'Huấn luyện viên', value: fmt(adminStats.total_trainers), icon: <User className="h-5 w-5 text-amber-600" /> },
            { label: 'Gym center', value: fmt(adminStats.total_gyms), icon: <Building2 className="h-5 w-5 text-green-600" /> },
            {
                label: 'Doanh thu tháng',
                value: `${fmt(adminStats.monthly_revenue)}đ`,
                icon: <Banknote className="h-5 w-5 text-emerald-700" />,
            },
        ];
    }, [adminStats, statsLoad, fmt]);

    return (
        <AdminDashboardShell activeTab={activeTab} onTabChange={setTab}>
            {activeTab === 'overview' && (
                <div id="panel-overview" className="animate-fade-in focus:outline-none">
                    <h2 className="text-h3 mb-4 border-b border-gray-200 pb-2">Tổng quan hệ thống</h2>

                    {statsLoad === 'err' && (
                        <div
                            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
                            role="alert"
                        >
                            <span>Không tải được số liệu. Kiểm tra mạng hoặc quyền admin, rồi thử lại.</span>
                            <button
                                type="button"
                                onClick={() => {
                                    void refetchStats();
                                }}
                                className="shrink-0 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-gray-800"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
                        {statValues.map((stat) => (
                            <StatCard
                                key={stat.label}
                                label={stat.label}
                                value={stat.value}
                                icon={stat.icon}
                                tone="subtle"
                            />
                        ))}
                    </div>

                    <h3 className="text-h3 mb-4 border-b border-gray-200 pb-2">Truy cập nhanh</h3>
                    <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                tab: 'ops' as const,
                                icon: <Activity className="h-5 w-5" />,
                                title: 'Vận hành',
                                desc: 'Sức khỏe hệ thống, audit, giao dịch, gói platform',
                            },
                            {
                                tab: 'users' as const,
                                icon: <Users className="h-5 w-5" />,
                                title: 'Người dùng',
                                desc: 'Danh sách và tìm kiếm tài khoản',
                            },
                            {
                                tab: 'content' as const,
                                icon: <Newspaper className="h-5 w-5" />,
                                title: 'Tin tức & sản phẩm',
                                desc: 'Bài viết admin và kiểm duyệt sản phẩm marketplace',
                            },
                            {
                                tab: 'gyms' as const,
                                icon: <Building2 className="h-5 w-5" />,
                                title: 'Duyệt gym',
                                desc: 'Phê duyệt hồ sơ gym owner mới',
                            },
                            {
                                tab: 'reviews' as const,
                                icon: <Star className="h-5 w-5" />,
                                title: 'Đánh giá gym',
                                desc: 'Kiểm duyệt review vi phạm',
                            },
                            {
                                tab: 'gallery' as const,
                                icon: <Images className="h-5 w-5" />,
                                title: 'Gallery cộng đồng',
                                desc: 'Quản lý ảnh và nội dung gallery',
                            },
                            {
                                tab: 'coach-apps' as const,
                                icon: <Award className="h-5 w-5" />,
                                title: 'Đơn làm coach',
                                desc: 'Đơn nâng cấp Athlete → Coach',
                            },
                        ].map((card) => (
                            <QuickActionCard
                                key={card.tab}
                                onClick={() => setTab(card.tab)}
                                icon={card.icon}
                                title={card.title}
                                description={card.desc}
                                uppercaseTitle={false}
                            />
                        ))}
                    </div>

                    <h3 className="text-h3 mb-4 border-b border-gray-200 pb-2">Thu phí nền tảng</h3>
                    <BillingToggleSection />
                </div>
            )}

            {activeTab === 'ops' && (
                <div id="panel-ops" className="focus:outline-none">
                    <AdminOperationalPanel />
                </div>
            )}

            {activeTab === 'users' && (
                <div id="panel-users" className="focus:outline-none">
                    <AdminUsersPanel />
                </div>
            )}

            {activeTab === 'content' && (
                <div id="panel-content" className="focus:outline-none">
                    <AdminContentMarketplacePanel />
                </div>
            )}

            {activeTab === 'gyms' && (
                <div id="panel-gyms" className="focus:outline-none">
                    <AdminGymApproval />
                </div>
            )}

            {activeTab === 'reviews' && (
                <div id="panel-reviews" className="focus:outline-none">
                    <AdminReviewManagement />
                </div>
            )}

            {activeTab === 'gallery' && (
                <div id="panel-gallery" className="focus:outline-none">
                    <AdminGalleryManagement />
                </div>
            )}

            {activeTab === 'coach-apps' && (
                <div id="panel-coach-apps" className="focus:outline-none">
                    <AdminCoachApplications />
                </div>
            )}
        </AdminDashboardShell>
    );
};

export default AdminDashboard;
