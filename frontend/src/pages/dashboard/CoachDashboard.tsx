import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Users, DollarSign, MessageSquare, ClipboardList, Eye, User } from 'lucide-react';
import type { RootState } from '../../store/store';
import { gymService } from '../../services/gymService';
import type { GymTrainerLink } from '../../types';
import { useToast } from '../../components/Toast';
import StatCard from '../../components/dashboard/StatCard';
import QuickActionCard from '../../components/dashboard/QuickActionCard';
import type { OverviewData } from './AthleteDashboard';

const CoachDashboard: React.FC<{ overview: OverviewData }> = ({ overview }) => {
    const { toast, ToastComponent } = useToast();
    const user = useSelector((state: RootState) => state.auth.user);
    const [invitations, setInvitations] = useState<GymTrainerLink[]>([]);
    const [loadingInvs, setLoadingInvs] = useState(true);

    // Public profile URL: /coaches/:id or /profile/public/:id
    const publicProfileUrl = user ? `/coaches/${user.id}` : '/coaches';

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
                <div className="bg-amber-50 border-2 border-amber-500 rounded-lg p-6">
                    <h3 className="font-black uppercase tracking-tight text-amber-800 mb-4 flex items-center gap-2">
                        <span>🔔</span> Bạn có {invitations.length} lời mời hợp tác mới
                    </h3>
                    <div className="grid gap-4">
                        {invitations.map(inv => (
                            <div key={inv.id} className="bg-white border border-amber-200 p-4 rounded-lg flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="font-bold text-sm">{inv.gym_center?.name}</p>
                                    <p className="text-xs text-[color:var(--mk-muted)]">Vị trí: {inv.role_at_gym || 'Coach'} • Chi nhánh: {inv.branch?.branch_name}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAccept(inv.id)} className="bg-black text-white px-3 py-1.5 rounded-xs text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors">Chấp nhận</button>
                                    <button onClick={() => handleDecline(inv.id)} className="text-[color:var(--mk-muted)] px-3 py-1.5 rounded-xs text-[10px] font-bold uppercase tracking-widest hover:text-red-500 transition-colors">Từ chối</button>
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

            {/* Coach public profile preview banner */}
            <div className="flex items-center justify-between gap-4 bg-gray-900 text-white rounded-lg px-5 py-4">
                <div>
                    <p className="text-[10px] uppercase tracking-widest text-[color:var(--mk-muted)] mb-1">Hồ sơ public của bạn</p>
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

            {/* Quick actions */}
            <div>
                <h3 className="text-h3 border-b border-[color:var(--mk-line)] pb-2 mb-4">Lối tắt</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {[
                        { to: '/programs', icon: <ClipboardList className="w-5 h-5" />, title: 'QUẢN LÝ GÓI TẬP', desc: 'Tạo & publish chương trình' },
                        { to: '/messages', icon: <MessageSquare className="w-5 h-5" />, title: 'TIN NHẮN', desc: 'Chat với học viên' },
                        { to: '/profile', icon: <User className="w-5 h-5" />, title: 'CẬP NHẬT HỒ SƠ', desc: 'Chỉnh sửa thông tin chuyên môn' },
                        { to: publicProfileUrl, icon: <Eye className="w-5 h-5" />, title: 'XEM PROFILE PUBLIC', desc: 'Kiểm tra giao diện học viên nhìn thấy' },
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

export default CoachDashboard;
