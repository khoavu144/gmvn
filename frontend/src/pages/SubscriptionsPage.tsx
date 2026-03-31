import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Users, Calendar, CheckCircle2, XCircle, AlertCircle, MessageSquare } from 'lucide-react';
import apiClient from '../services/api';
import { useToast } from '../components/Toast';

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast, ToastComponent } = useToast();

    const fetchSubscriptions = useCallback(async () => {
        try {
            const res = await apiClient.get('/subscriptions/me');
            if (res.data.success) {
                setSubscriptions(res.data.subscriptions);
            }
        } catch {
            toast.error('Không thể tải dữ liệu huấn luyện');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        void fetchSubscriptions();
    }, [fetchSubscriptions]);

    const handleCancel = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn kết thúc quan hệ huấn luyện này?')) return;
        try {
            const res = await apiClient.post(`/subscriptions/${id}/cancel`);
            if (res.data.success) {
                toast.success('Đã cập nhật trạng thái');
                fetchSubscriptions();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Không thể cập nhật trạng thái');
        }
    };

    const buildConversationLink = (sub: any) => {
        const profilePath = sub.trainer?.slug ? `/coach/${sub.trainer.slug}` : `/coaches/${sub.trainer_id}`;
        const params = new URLSearchParams({
            to: sub.trainer_id,
            name: sub.trainer?.full_name || 'Huấn luyện viên',
            context_type: 'program',
            context_id: sub.program_id,
            context_label: sub.program?.name || 'Chương trình',
            profile_path: profilePath,
        });

        return `/messages?${params.toString()}`;
    };

    return (
        <div className="page-shell-muted">
            <Helmet>
                <title>Quan hệ huấn luyện — GYMERVIET</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            {ToastComponent}
            <div className="page-container gv-pad-y-lg max-w-4xl">
                <div className="page-header">
                    <p className="page-kicker">Tài khoản</p>
                    <h1 className="page-title">Quan hệ huấn luyện</h1>
                    <p className="page-description">Xem các chương trình bạn đang tham gia và trạng thái kết nối với huấn luyện viên.</p>
                </div>

                {loading ? (
                    <div className="page-section py-12">
                        <div className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black" /></div>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="empty-state py-12">
                        <Users className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <h3 className="mb-2 text-xl font-bold tracking-tight text-black">Bạn chưa tham gia chương trình nào</h3>
                        <p className="mx-auto mb-6 max-w-md text-sm text-gray-500">Khám phá các huấn luyện viên phù hợp và nhắn tin trực tiếp để bắt đầu lộ trình.</p>
                        <Link to="/coaches" className="btn-primary inline-flex text-xs uppercase tracking-[0.14em]">Tìm huấn luyện viên</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {subscriptions.map((sub: any) => (
                            <div key={sub.id} className="page-section flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-lg font-black tracking-tight text-black">{sub.program?.name || 'Chương trình'}</h3>
                                        {sub.status === 'active' ? (
                                            <span className="page-status-chip page-status-chip-success">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Đang tham gia
                                            </span>
                                        ) : sub.status === 'cancelled' ? (
                                            <span className="page-status-chip page-status-chip-danger">
                                                <XCircle className="h-3.5 w-3.5" /> Đã kết thúc
                                            </span>
                                        ) : (
                                            <span className="page-status-chip page-status-chip-muted">
                                                <AlertCircle className="h-3.5 w-3.5" /> Tạm dừng
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600">Huấn luyện viên: <span className="font-semibold text-black">{sub.trainer?.full_name}</span></p>

                                    <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500">
                                        <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Tham gia: {sub.started_at ? new Date(sub.started_at).toLocaleDateString('vi-VN') : '—'}</span>
                                        <span className="inline-flex items-center gap-1.5"><MessageSquare className="h-3.5 w-3.5" /> Nguồn: {sub.source === 'message' ? 'Qua tin nhắn' : sub.source === 'direct' ? 'Trực tiếp' : 'Hệ thống cũ'}</span>
                                    </div>
                                </div>

                                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[11rem]">
                                    <Link to={`/programs/${sub.program_id}`} className="btn-secondary justify-center whitespace-nowrap text-xs uppercase tracking-[0.14em]">
                                        Xem chương trình
                                    </Link>
                                    {sub.status === 'active' && (
                                        <Link to={buildConversationLink(sub)} className="btn-secondary justify-center whitespace-nowrap text-xs uppercase tracking-[0.14em]">
                                            Nhắn tin huấn luyện viên
                                        </Link>
                                    )}
                                    {sub.status === 'active' && (
                                        <button onClick={() => handleCancel(sub.id)} className="btn-tertiary justify-center whitespace-nowrap text-xs uppercase tracking-[0.14em] text-red-600 hover:bg-red-50 hover:text-red-700">
                                            Kết thúc
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
