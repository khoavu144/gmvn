import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { CreditCard, Calendar, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import apiClient from '../services/api';
import { useToast } from '../components/Toast';

export default function SubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { toast, ToastComponent } = useToast();

    const fetchSubscriptions = async () => {
        try {
            const res = await apiClient.get('/subscriptions/me');
            if (res.data.success) {
                setSubscriptions(res.data.subscriptions);
            }
        } catch (err) {
            toast.error('Không thể tải dữ liệu gói tập');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

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
        <div className="page-shell">
            <Helmet>
                <title>Quản lý Gói tập — GymViet</title>
            </Helmet>
            {ToastComponent}
            <div className="page-container max-w-4xl py-12">
                <div className="page-header">
                    <p className="page-kicker">Tài khoản</p>
                    <h1 className="page-title">Quản lý Gói tập</h1>
                    <p className="page-description">Theo dõi và quản lý các lượt đăng ký chương trình của bạn.</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-b-2 border-black" /></div>
                ) : subscriptions.length === 0 ? (
                    <div className="card text-center py-12 bg-white border border-[color:var(--mk-line)] shadow-sm rounded-2xl">
                        <CreditCard className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold mb-2 tracking-tight">Bạn chưa đăng ký gói tập nào</h3>
                        <p className="text-[color:var(--mk-muted)] mb-6 text-sm">Khám phá các Coach chuyên nghiệp và tham gia chuyên đề để bắt đầu lộ trình.</p>
                        <Link to="/coaches" className="btn-primary inline-block uppercase tracking-widest text-xs">Tìm Coach ngay</Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {subscriptions.map((sub: any) => (
                            <div key={sub.id} className="card bg-white p-6 rounded-2xl shadow-sm border border-[color:var(--mk-line)] flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center transition hover:shadow-md">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-black tracking-tight uppercase">{sub.program?.name || 'Gói tập'}</h3>
                                        {sub.status === 'active' ? (
                                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-green-50 border border-green-200 text-green-700 rounded-md uppercase tracking-wider">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                                            </span>
                                        ) : sub.status === 'cancelled' ? (
                                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-red-50 border border-red-200 text-red-700 rounded-md uppercase tracking-wider">
                                                <XCircle className="w-3.5 h-3.5" /> Đã hủy
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-[color:var(--mk-paper)] border border-[color:var(--mk-line)] text-[color:var(--mk-text-soft)] rounded-md uppercase tracking-wider">
                                                <AlertCircle className="w-3.5 h-3.5" /> Tạm dừng
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-[color:var(--mk-text-soft)]">Huấn luyện viên: <span className="font-semibold text-black">{sub.trainer?.full_name}</span></p>
                                    <div className="flex items-center gap-4 text-xs font-medium text-[color:var(--mk-muted)] mt-2">
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Chu kỳ: {sub.subscription_type === 'monthly' ? 'Hàng tháng' : 'Mua đứt (Vĩnh viễn)'}</span>
                                        <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5" /> {Number(sub.price_paid || 0).toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    {sub.next_billing_date && sub.status === 'active' && (
                                        <p className="text-xs text-[color:var(--mk-muted)] mt-1 font-mono bg-[color:var(--mk-paper)] p-1.5 rounded inline-block">Gia hạn tiếp theo: {new Date(sub.next_billing_date).toLocaleDateString('vi-VN')}</p>
                                    )}
                                </div>
                                <div className="w-full sm:w-auto flex sm:flex-col gap-3">
                                    <Link to={`/programs/${sub.program_id}`} className="flex-1 text-center py-2 px-6 shadow-sm border border-[color:var(--mk-line)] rounded-md font-bold text-xs uppercase tracking-widest text-black hover:bg-[color:var(--mk-paper)] transition-colors whitespace-nowrap">
                                        Xem lớp học
                                    </Link>
                                    {sub.status === 'active' && sub.subscription_type === 'monthly' && (
                                        <button onClick={() => handleCancel(sub.id)} className="flex-1 py-2 px-6 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-md transition-colors whitespace-nowrap">
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
