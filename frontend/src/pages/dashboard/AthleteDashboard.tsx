import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ClipboardList, Star, Calendar, Search, Eye, Store, Bell, MessageSquare } from 'lucide-react';
import type { RootState } from '../../store/store';
import StatCard from '../../components/dashboard/StatCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import UpgradeToCoachBanner from '../../components/dashboard/UpgradeToCoachBanner';
import DashboardPublicProfileBanner from '../../components/dashboard/DashboardPublicProfileBanner';

export interface OverviewData {
    active_clients?: number;
    new_clients_30d?: number;
    unread_messages?: number;
    total_programs?: number;
    published_programs?: number;
    week_sessions?: number;
    active_relationships?: number;
    unread_notifications?: number;
    new_connections_30d?: number;
}

const AthleteDashboard: React.FC<{ overview: OverviewData }> = ({ overview }) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const publicProfileUrl = user ? `/athletes/${user.id}` : '/coaches?type=athlete';

    const weekSessions = Number(overview.week_sessions ?? 0);
    const hasWeekSessions = weekSessions > 0;

    const hero = useMemo(() => {
        if (hasWeekSessions) {
            return {
                kicker: 'Lịch tuần này',
                title: `${weekSessions} buổi tập trong tuần`,
                body: 'Tiếp tục theo dõi lịch và tiến độ trên GYMERVIET.',
                primary: { to: '/workouts', label: 'Mở lịch tập' },
                secondary: { to: '/coaches', label: 'Tìm thêm huấn luyện viên' },
            };
        }
        return {
            kicker: 'Bắt đầu',
            title: 'Chưa có buổi tập tuần này',
            body: 'Xem huấn luyện viên trên GYMERVIET và chọn người phù hợp để lên lịch cùng bạn.',
            primary: { to: '/coaches', label: 'Tìm huấn luyện viên' },
            secondary: { to: '/workouts', label: 'Lịch tập của tôi' },
        };
    }, [hasWeekSessions, weekSessions]);

    const unreadMsg = overview.unread_messages ?? 0;

    return (
        <div className="space-y-8">
            <div className="group relative overflow-hidden rounded-lg bg-gray-900 p-8 text-white shadow-md md:p-10">
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/40" />
                <div className="relative z-20 max-w-2xl">
                    <span className="mb-4 inline-block rounded-sm bg-white px-3 py-1 text-xs font-bold tracking-wide text-gray-900">
                        {hero.kicker}
                    </span>
                    <h2 className="mb-3 text-3xl font-black tracking-tight md:text-4xl">{hero.title}</h2>
                    <p className="mb-8 max-w-md text-sm leading-relaxed text-gray-400">{hero.body}</p>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            to={hero.primary.to}
                            className="inline-block rounded-sm bg-white px-6 py-3 text-sm font-bold text-gray-900 hover:bg-gray-100"
                        >
                            {hero.primary.label}
                        </Link>
                        <Link
                            to={hero.secondary.to}
                            className="inline-block rounded-sm border border-gray-600 px-6 py-3 text-sm font-bold text-white hover:border-white"
                        >
                            {hero.secondary.label}
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                    {
                        label: 'Buổi trong tuần',
                        value: String(weekSessions),
                        icon: <ClipboardList className="h-5 w-5" />,
                    },
                    {
                        label: 'Chương trình tham gia',
                        value: String(overview.active_relationships ?? '0'),
                        icon: <Star className="h-5 w-5" />,
                    },
                    {
                        label: 'Thông báo',
                        value: String(overview.unread_notifications ?? '0'),
                        icon: <Bell className="h-5 w-5" />,
                    },
                    {
                        label: 'Tin nhắn chưa đọc',
                        value: String(unreadMsg),
                        icon: <MessageSquare className="h-5 w-5" />,
                    },
                ].map((stat) => (
                    <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
                ))}
            </div>

            <DashboardPublicProfileBanner label="Hồ sơ vận động viên công khai" path={publicProfileUrl} />

            <UpgradeToCoachBanner />

            <section className="page-header mb-0">
                <p className="page-kicker">Không gian luyện tập</p>
                <h2 className="section-title">Lịch tập và hồ sơ vận động viên</h2>
                <p className="page-description">
                    Theo dõi lịch, hồ sơ và liên hệ huấn luyện viên — gọn gàng, không rối mắt.
                </p>
            </section>

            <div>
                <h3 className="text-h3 mb-4 border-b border-gray-200 pb-2">Lối tắt</h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {[
                        {
                            to: '/workouts',
                            icon: <Calendar className="h-5 w-5" />,
                            title: 'Lịch tập',
                            desc: 'Theo dõi lịch và tiến độ',
                        },
                        {
                            to: '/profile',
                            icon: <Star className="h-5 w-5" />,
                            title: 'Cập nhật hồ sơ',
                            desc: 'Thành tích và thông tin thi đấu',
                        },
                        {
                            to: '/coaches',
                            icon: <Search className="h-5 w-5" />,
                            title: 'Tìm huấn luyện viên',
                            desc: 'Huấn luyện viên phù hợp',
                        },
                        {
                            to: publicProfileUrl,
                            icon: <Eye className="h-5 w-5" />,
                            title: 'Xem hồ sơ công khai',
                            desc: 'Kiểm tra cách người khác nhìn thấy bạn',
                        },
                        {
                            to: '/dashboard/marketplace',
                            icon: <Store className="h-5 w-5" />,
                            title: 'Gian hàng',
                            desc: 'Quản lý bài đăng bán hàng',
                        },
                    ].map((card) => (
                        <QuickActionCard
                            key={card.to}
                            to={card.to}
                            icon={card.icon}
                            title={card.title}
                            description={card.desc}
                            uppercaseTitle={false}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AthleteDashboard;
