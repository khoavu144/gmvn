import { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CreditCard, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
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
            toast.error('Không thể tải dữ liệu gói tập');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        void fetchSubscriptions();
    }, [fetchSubscriptions]);

    const handleCancel = async (id: string) => {
        if (!window.confirm('Bạn có chắc chắn muốn hủy gói tập này không? Bạn vẫn có quyền truy cập cho đến hết chu kỳ hiện tại.')) return;
        try {
            const res = await apiClient.post(`/subscriptions/${id}/cancel`);
            if (res.data.success) {
                toast.success('Hủy gia hạn gói tập thành công');
                fetchSubscriptions();
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Lỗi khi hủy gói tập');
        }
    };

    return (
        <div className="page-shell-muted">
            <Helmet>
                <title>Quản lý Gói tập — GymViet</title>
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            {ToastComponent}
            <div className="page-container max-w-4xl py-12">
                <div className="page-header">
                    <p className="page-kicker">Tài khoản</p>
                    <h1 className="page-title">Quản lý Gói tập</h1>
                    <p className="page-description">Theo dõi, rà soát chu kỳ thanh toán và giữ quyền truy cập của bạn trong cùng một bề mặt quản trị thống nhất.</p>
                </div>

                {loading ? (
                    <div className="page-section py-12">
                        <div className="flex justify-center"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black" /></div>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="empty-state py-12">
                        <CreditCard className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                        <h3 className="mb-2 text-xl font-bold tracking-tight text-black">Bạn chưa đăng ký gói tập nào</h3>
                        <p className="mx-auto mb-6 max-w-md text-sm text-gray-500">Khám phá các Coach chuyên nghiệp và tham gia chuyên đề để bắt đầu lộ trình.</p>
                        <Link to="/coaches" className="btn-primary inline-flex text-xs uppercase tracking-[0.14em]">Tìm Coach ngay</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {subscriptions.map((sub: any) => (
                            <div key={sub.id} className="page-section flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-lg font-black tracking-tight text-black">{sub.program?.name || 'Gói tập'}</h3>
                                        {sub.status === 'active' ? (
                                            <span className="page-status-chip page-status-chip-success">
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Hoạt động
                                            </span>
                                        ) : sub.status === 'cancelled' ? (
                                            <span className="page-status-chip page-status-chip-danger">
                                                <XCircle className="h-3.5 w-3.5" /> Đã hủy
                                            </span>
                                        ) : (
                                            <span className="page-status-chip page-status-chip-muted">
                                                <AlertCircle className="h-3.5 w-3.5" /> Tạm dừng
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-sm text-gray-600">Huấn luyện viên: <span className="font-semibold text-black">{sub.trainer?.full_name}</span></p>

                                    <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-500">
                                        <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Chu kỳ: {sub.subscription_type === 'monthly' ? 'Hàng tháng' : 'Mua đứt (Vĩnh viễn)'}</span>
                                        <span className="inline-flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> {Number(sub.price_paid || 0).toLocaleString('vi-VN')} đ</span>
                                    </div>

                                    {sub.next_billing_date && sub.status === 'active' && (
                                        <p className="page-pill bg-gray-50 text-gray-500">Gia hạn tiếp theo: {new Date(sub.next_billing_date).toLocaleDateString('vi-VN')}</p>
                                    )}
                                </div>

                                <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[11rem]">
                                    <Link to={`/programs/${sub.program_id}`} className="btn-secondary justify-center whitespace-nowrap text-xs uppercase tracking-[0.14em]">
                                        Xem lớp học
                                    </Link>
                                    {sub.status === 'active' && sub.subscription_type === 'monthly' && (
                                        <button onClick={() => handleCancel(sub.id)} className="btn-tertiary justify-center whitespace-nowrap text-xs uppercase tracking-[0.14em] text-red-600 hover:bg-red-50 hover:text-red-700">
                                            Hủy gia hạn
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
