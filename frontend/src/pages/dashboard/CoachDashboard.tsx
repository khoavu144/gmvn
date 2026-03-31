import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Users, UserPlus, MessageSquare, ClipboardList, Eye, User, Store, Bell } from 'lucide-react';
import type { RootState } from '../../store/store';
import { gymService } from '../../services/gymService';
import type { GymTrainerLink } from '../../types';
import { useToast } from '../../components/Toast';
import StatCard from '../../components/dashboard/StatCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import DashboardPublicProfileBanner from '../../components/dashboard/DashboardPublicProfileBanner';
import type { OverviewData } from './AthleteDashboard';

const CoachDashboard: React.FC<{ overview: OverviewData }> = ({ overview }) => {
    const { toast, ToastComponent } = useToast();
    const user = useSelector((state: RootState) => state.auth.user);
    const [invitations, setInvitations] = useState<GymTrainerLink[]>([]);
    const [loadingInvs, setLoadingInvs] = useState(true);

    const publicProfileUrl = user ? `/coaches/${user.id}` : '/coaches';

    useEffect(() => {
        gymService
            .getTrainerInvitations()
            .then((res) => {
                if (res.success) setInvitations(res.invitations || []);
            })
            .finally(() => setLoadingInvs(false));
    }, []);

    const handleAccept = async (id: string) => {
        try {
            const res = await gymService.acceptInvitation(id);
            if (res.success) {
                toast.success('Đã chấp nhận lời mời hợp tác.');
                setInvitations((prev) => prev.filter((i) => i.id !== id));
            }
        } catch {
            toast.error('Thử lại');
        }
    };

    const handleDecline = async (id: string) => {
        try {
            const res = await gymService.declineInvitation(id);
            if (res.success) {
                toast.success('Đã từ chối lời mời.');
                setInvitations((prev) => prev.filter((i) => i.id !== id));
            }
        } catch {
            toast.error('Thử lại');
        }
    };

    return (
        <div className="space-y-8">
            {ToastComponent}

            {!loadingInvs && invitations.length > 0 && (
                <div className="rounded-lg border-2 border-amber-400/80 bg-amber-50 p-5 sm:p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-amber-950">
                        <Bell className="h-5 w-5 shrink-0" aria-hidden />
                        Bạn có {invitations.length} lời mời hợp tác
                    </h2>
                    <ul className="grid gap-4">
                        {invitations.map((inv) => (
                            <li
                                key={inv.id}
                                className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="font-bold text-gray-900">{inv.gym_center?.name}</p>
                                    <p className="text-xs text-gray-600">
                                        Vị trí: {inv.role_at_gym || 'Huấn luyện viên'} · Chi nhánh:{' '}
                                        {inv.branch?.branch_name ?? '—'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void handleAccept(inv.id)}
                                        className="btn-primary min-w-[100px] px-4 text-sm"
                                    >
                                        Chấp nhận
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleDecline(inv.id)}
                                        className="btn-secondary px-4 text-sm"
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {(() => {
                const checks = [
                    { done: !!user?.avatar_url, label: 'Ảnh đại diện', link: '/profile' },
                    { done: !!(user?.bio && user.bio.trim().length > 10), label: 'Giới thiệu bản thân', link: '/profile' },
                    { done: !!(user?.specialties && user.specialties.length > 0), label: 'Chuyên môn', link: '/profile' },
                    { done: (overview.total_programs ?? 0) > 0, label: 'Tạo chương trình đầu tiên', link: '/programs' },
                    { done: (overview.published_programs ?? 0) > 0, label: 'Xuất bản ít nhất 1 chương trình', link: '/programs' },
                ];
                const done = checks.filter(c => c.done).length;
                if (done === checks.length) return null;
                const pct = Math.round((done / checks.length) * 100);
                const missing = checks.filter(c => !c.done);
                return (
                    <div className="rounded-lg border border-gray-200 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <span className="page-kicker">Hoàn thiện hồ sơ</span>
                                <p className="mt-0.5 text-sm font-semibold text-gray-900">{done}/{checks.length} mục hoàn thành ({pct}%)</p>
                            </div>
                        </div>
                        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {missing.map(item => (
                                <a key={item.label} href={item.link} className="inline-flex items-center gap-1 rounded-sm border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-900 hover:text-black transition-colors">
                                    + {item.label}
                                </a>
                            ))}
                        </div>
                    </div>
                );
            })()}

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                    { label: 'Học viên', value: String(overview.active_clients ?? '—'), icon: <Users className="h-5 w-5" /> },
                    {
                        label: 'Khách mới 30 ngày',
                        value: String(overview.new_clients_30d ?? 0),
                        icon: <UserPlus className="h-5 w-5" />,
                    },
                    { label: 'Tin nhắn', value: String(overview.unread_messages ?? 0), icon: <MessageSquare className="h-5 w-5" /> },
                    {
                        label: 'Chương trình',
                        value: `${overview.published_programs ?? 0}/${overview.total_programs ?? 0}`,
                        icon: <ClipboardList className="h-5 w-5" />,
                    },
                ].map((stat) => (
                    <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} />
                ))}
            </div>

            <DashboardPublicProfileBanner label="Hồ sơ huấn luyện viên công khai" path={publicProfileUrl} />

            <div>
                <h3 className="text-h3 mb-4 border-b border-gray-200 pb-2">Lối tắt</h3>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                    {[
                        {
                            to: '/programs',
                            icon: <ClipboardList className="h-5 w-5" />,
                            title: 'Quản lý chương trình',
                            desc: 'Tạo và xuất bản chương trình',
                        },
                        {
                            to: '/messages',
                            icon: <MessageSquare className="h-5 w-5" />,
                            title: 'Tin nhắn',
                            desc: 'Trao đổi với học viên',
                        },
                        {
                            to: '/profile',
                            icon: <User className="h-5 w-5" />,
                            title: 'Cập nhật hồ sơ',
                            desc: 'Thông tin chuyên môn và CV',
                        },
                        {
                            to: publicProfileUrl,
                            icon: <Eye className="h-5 w-5" />,
                            title: 'Xem hồ sơ công khai',
                            desc: 'Giao diện học viên nhìn thấy',
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

export default CoachDashboard;
