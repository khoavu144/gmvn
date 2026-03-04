import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useToast } from '../components/Toast';

interface Program {
    id: string;
    name: string;
    description: string | null;
    duration_weeks: number | null;
    difficulty: string | null;
    price_monthly: number | null;
    price_one_time: number | null;
    current_clients: number;
    max_clients: number;
}

interface Trainer {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    specialties: string[] | null;
    base_price_monthly: number | null;
    is_verified: boolean;
    created_at: string;
}

export default function TrainerDetailPage() {
    const { toast, ToastComponent } = useToast();
    const { trainerId } = useParams<{ trainerId: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);
    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState<string | null>(null);
    const [pendingPayment, setPendingPayment] = useState<{
        amount: number;
        transfer_content: string;
        program_id: string;
    } | null>(null);
    const [checkingStatus, setCheckingStatus] = useState(false);

    useEffect(() => {
        if (!trainerId) return;
        const load = async () => {
            try {
                const [trainerRes, programsRes] = await Promise.all([
                    apiClient.get(`/users/trainers/${trainerId}`),
                    apiClient.get(`/programs/trainers/${trainerId}/programs`),
                ]);
                setTrainer(trainerRes.data.data);
                setPrograms(programsRes.data.programs || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [trainerId]);

    const handleSubscribe = async (programId: string) => {
        if (!user) { navigate('/login'); return; }
        setSubscribing(programId);
        try {
            const res = await apiClient.post('/subscriptions', { program_id: programId });
            if (res.data.success) {
                setPendingPayment({
                    amount: res.data.amount,
                    transfer_content: res.data.transfer_content,
                    program_id: programId
                });
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Đã có lỗi xảy ra');
        } finally {
            setSubscribing(null);
        }
    };

    const handleCheckPayment = async () => {
        if (!pendingPayment) return;
        setCheckingStatus(true);
        try {
            const res = await apiClient.get(`/subscriptions/status?program_id=${pendingPayment.program_id}`);
            if (res.data.isActive) {
                toast.success('Thanh toán thành công! Gói tập đã được kích hoạt.');
                setPendingPayment(null);
                // Optionally refresh program slots
            } else {
                toast.error('Chưa nhận được thanh toán. Vui lòng đợi vài phút hoặc thử lại.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Không thể kiểm tra trạng thái.');
        } finally {
            setCheckingStatus(false);
        }
    };

    const handleMessage = () => {
        if (!user) { navigate('/login'); return; }
        navigate(`/messages?to=${trainerId}`);
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-gray-500 text-sm">Đang tải...</div>
        </div>
    );

    if (!trainer) return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
            <div className="text-gray-800 font-medium">Không tìm thấy huấn luyện viên</div>
            <Link to="/trainers" className="text-black underline text-sm">← Về danh sách</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-16">
            {ToastComponent}
            {/* Header Navigation */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
                    <button onClick={() => navigate(-1)} className="text-sm font-medium text-gray-600 hover:text-black">
                        ← Quay lại
                    </button>
                    <span className="mx-4 text-gray-300">|</span>
                    <Link to={`/trainer/${trainerId}`} className="text-sm font-medium text-gray-600 hover:text-black">
                        Xem Profile Public
                    </Link>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
                {/* Trainer Quick Context */}
                <div className="card flex flex-col sm:flex-row gap-6 p-6 items-start sm:items-center">
                    <div className="shrink-0 mx-auto sm:mx-0">
                        {trainer.avatar_url ? (
                            <img src={trainer.avatar_url} alt={trainer.full_name} className="w-24 h-24 rounded-xs border border-gray-200 object-cover grayscale" />
                        ) : (
                            <div className="w-24 h-24 rounded-xs border border-gray-200 bg-gray-100 flex items-center justify-center text-2xl font-bold uppercase">
                                {trainer.full_name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center sm:text-left space-y-2">
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <h1 className="text-h2 m-0">{trainer.full_name}</h1>
                            {trainer.is_verified && (
                                <span className="text-[10px] font-bold uppercase tracking-wider border border-black bg-black text-white px-2 py-0.5 rounded-xs">
                                    Verified
                                </span>
                            )}
                        </div>
                        {trainer.bio && <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{trainer.bio}</p>}
                        {trainer.specialties && trainer.specialties.length > 0 && (
                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                                {trainer.specialties.map(s => (
                                    <span key={s} className="bg-gray-100 border border-gray-200 text-gray-800 text-xs px-2 py-0.5 font-medium rounded-xs">{s}</span>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="w-full sm:w-auto flex flex-col gap-3 shrink-0 pt-4 sm:pt-0 border-t border-gray-200 sm:border-0">
                        {trainer.base_price_monthly && (
                            <div className="text-center sm:text-right">
                                <div className="text-xs text-gray-500 uppercase tracking-wide">Giá tham khảo</div>
                                <div className="font-bold text-black">{Number(trainer.base_price_monthly).toLocaleString('vi-VN')}₫<span className="text-xs font-normal">/th</span></div>
                            </div>
                        )}
                        <button
                            onClick={handleMessage}
                            className="btn-secondary w-full"
                        >
                            Nhắn tin
                        </button>
                    </div>
                </div>

                {/* Programs List */}
                <div>
                    <div className="flex items-baseline justify-between mb-4 border-b border-gray-200 pb-2">
                        <h2 className="text-h3">Danh sách Gói tập ({programs.length})</h2>
                    </div>

                    {programs.length === 0 ? (
                        <div className="card text-center text-gray-500 py-12 text-sm border-dashed">
                            Huấn luyện viên chưa có gói tập nào khả dụng.
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {programs.map(prog => (
                                <div key={prog.id} className="card flex flex-col hover:border-black transition-colors">
                                    <div className="mb-3">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="text-base font-bold text-black">{prog.name}</h3>
                                            <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-xs shrink-0">
                                                {prog.current_clients}/{prog.max_clients} slot
                                            </span>
                                        </div>
                                        {prog.description && (
                                            <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">{prog.description}</p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-4">
                                        {prog.duration_weeks && (
                                            <span className="border border-gray-200 px-2 py-1 rounded-xs">{prog.duration_weeks} tuần</span>
                                        )}
                                        {prog.difficulty && (
                                            <span className="border border-gray-200 px-2 py-1 rounded-xs">{prog.difficulty}</span>
                                        )}
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div>
                                            {prog.price_monthly ? (
                                                <div className="text-lg font-bold text-black">
                                                    {Number(prog.price_monthly).toLocaleString('vi-VN')}₫
                                                    <span className="text-xs font-normal text-gray-500">/tháng</span>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 font-medium">Báo giá theo nhu cầu</div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleSubscribe(prog.id)}
                                            disabled={subscribing === prog.id}
                                            className="btn-primary px-5"
                                        >
                                            {subscribing === prog.id ? '...' : 'Đăng ký'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Modal */}
            {pendingPayment && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full space-y-6">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold">Thanh Toán Gói Tập</h3>
                            <button onClick={() => setPendingPayment(null)} className="text-gray-400 hover:text-black">✕</button>
                        </div>
                        <div className="text-center space-y-4">
                            <p className="text-sm text-gray-600">Vui lòng chuyển khoản với nội dung chính xác dưới đây để hệ thống duyệt tự động.</p>

                            <img src={`https://img.vietqr.io/image/970436-0987654321-compact2.png?amount=${pendingPayment.amount}&addInfo=${encodeURIComponent(pendingPayment.transfer_content)}&accountName=GYMERVIET`} alt="QR Code" className="mx-auto border border-gray-200 rounded-md w-48 h-48 object-contain" />

                            <div className="bg-gray-50 p-4 rounded-md text-left text-sm space-y-2 font-mono">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Số tiền:</span>
                                    <span className="font-bold text-black">{pendingPayment.amount.toLocaleString('vi-VN')} VND</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Nội dung:</span>
                                    <span className="font-bold text-black border-b border-black">{pendingPayment.transfer_content}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleCheckPayment}
                            disabled={checkingStatus}
                            className="btn-primary w-full"
                        >
                            {checkingStatus ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
