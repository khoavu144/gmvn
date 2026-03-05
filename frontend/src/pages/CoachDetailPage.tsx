import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { useToast } from '../components/Toast';
import CoachGymBadge from '../components/CoachGymBadge';
import ShareButton from '../components/ShareButton';

interface Program {
    id: string;
    name: string;
    description: string | null;
    duration_weeks: number | null;
    difficulty: string | null;
    price_monthly: number | null;
    price_one_time: number | null;
    price_per_session: number | null;
    pricing_type: 'monthly' | 'lump_sum' | 'per_session';
    training_format: string;
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

export default function CoachDetailPage() {
    const { toast, ToastComponent } = useToast();
    const { trainerId } = useParams<{ trainerId: string }>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const [trainer, setTrainer] = useState<Trainer | null>(null);
    const [programs, setPrograms] = useState<Program[]>([]);
    const [gymLinks, setGymLinks] = useState<any[]>([]);
    const [testimonials, setTestimonials] = useState<any[]>([]);
    const [beforeAfterPhotos, setBeforeAfterPhotos] = useState<any[]>([]);
    const [similarCoaches, setSimilarCoaches] = useState<any[]>([]);
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
                const [trainerRes, programsRes, gymsRes, testimonialsRes, beforeAfterRes, similarRes] = await Promise.all([
                    apiClient.get(`/users/trainers/${trainerId}`),
                    apiClient.get(`/programs/trainers/${trainerId}/programs`),
                    apiClient.get(`/gyms/trainer/${trainerId}`).catch(() => ({ data: { gyms: [] } })),
                    apiClient.get(`/users/trainers/${trainerId}/testimonials?limit=6`).catch(() => ({ data: { testimonials: [] } })),
                    apiClient.get(`/users/trainers/${trainerId}/before-after`).catch(() => ({ data: [] })),
                    apiClient.get(`/users/trainers/${trainerId}/similar?limit=3`).catch(() => ({ data: [] }))
                ]);
                setTrainer(trainerRes.data.data);
                setPrograms(programsRes.data.programs || []);
                setGymLinks(gymsRes.data.gyms || []);
                setTestimonials(testimonialsRes.data.testimonials || []);
                setBeforeAfterPhotos(Array.isArray(beforeAfterRes.data) ? beforeAfterRes.data : []);
                setSimilarCoaches(Array.isArray(similarRes.data) ? similarRes.data : []);
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
            <div className="text-gray-800 font-medium">Không tìm thấy Coach</div>
            <Link to="/trainers" className="text-black underline text-sm">← Về danh sách</Link>
        </div>
    );

    return (
        <div className="bg-gray-50 pb-16">
            {/* Sprint 2: Dynamic SEO title & meta */}
            <Helmet>
                <title>{trainer.full_name} — GYMERVIET Coach</title>
                <meta name="description" content={trainer.bio?.slice(0, 155) ?? `${trainer.full_name} là huấn luyện viên được xác thực trên GYMERVIET.`} />
                <meta property="og:title" content={`${trainer.full_name} — GYMERVIET Coach`} />
                <meta property="og:description" content={trainer.bio?.slice(0, 155) ?? ''} />
                {trainer.avatar_url && <meta property="og:image" content={trainer.avatar_url} />}
            </Helmet>

            {ToastComponent}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 h-12 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="text-sm font-medium text-gray-600 hover:text-black">
                        ← Quay lại
                    </button>
                    {/* Sprint 2: ShareButton replaces broken "Xem Profile Public" link */}
                    <ShareButton
                        title={`${trainer.full_name} — GYMERVIET Coach`}
                        text={trainer.bio ?? undefined}
                        label="Chia sẻ"
                    />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
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
                        <button onClick={handleMessage} className="btn-secondary w-full">Nhắn tin</button>
                    </div>
                </div>

                {/* Gym Affiliations */}
                {gymLinks.length > 0 && (
                    <div>
                        <h2 className="text-h3 mb-4 border-b border-gray-200 pb-2">Hoạt động tại Gym</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {gymLinks.map(link => (
                                <CoachGymBadge
                                    key={link.id}
                                    gymId={link.gym_center?.id}
                                    gymName={link.gym_center?.name}
                                    branchName={link.branch?.branch_name}
                                    role={link.role_at_gym}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Programs List */}
                <div>
                    <div className="flex items-baseline justify-between mb-4 border-b border-gray-200 pb-2">
                        <h2 className="text-h3">Danh sách Gói tập ({programs.length})</h2>
                    </div>

                    {programs.length === 0 ? (
                        <div className="card text-center text-gray-500 py-12 text-sm border-dashed">
                            Coach chưa có gói tập nào khả dụng.
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
                                            {prog.pricing_type === 'monthly' && prog.price_monthly ? (
                                                <div className="text-lg font-bold text-black">
                                                    {Number(prog.price_monthly).toLocaleString('vi-VN')}₫
                                                    <span className="text-xs font-normal text-gray-500">/tháng</span>
                                                </div>
                                            ) : prog.pricing_type === 'lump_sum' && prog.price_one_time ? (
                                                <div className="text-lg font-bold text-black">
                                                    {Number(prog.price_one_time).toLocaleString('vi-VN')}₫
                                                    <span className="text-xs font-normal text-gray-500"> 1 lần</span>
                                                </div>
                                            ) : prog.pricing_type === 'per_session' && prog.price_per_session ? (
                                                <div className="text-lg font-bold text-black">
                                                    {Number(prog.price_per_session).toLocaleString('vi-VN')}₫
                                                    <span className="text-xs font-normal text-gray-500">/buổi</span>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 font-medium">Liên hệ báo giá</div>
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

                    {/* Before/After Gallery */}
                    {beforeAfterPhotos.length > 0 && (
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h2 className="text-h3 mb-4">Kết quả đạt được</h2>
                            <div className="grid gap-6 md:grid-cols-2">
                                {beforeAfterPhotos.map(photo => (
                                    <div key={photo.id} className="card">
                                        <div className="grid grid-cols-2 gap-2 mb-3">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1 uppercase font-medium">Trước</div>
                                                <img src={photo.before_url} alt="Before" className="w-full h-48 object-cover rounded border border-gray-200" />
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1 uppercase font-medium">Sau</div>
                                                <img src={photo.after_url} alt="After" className="w-full h-48 object-cover rounded border border-gray-200" />
                                            </div>
                                        </div>
                                        {photo.client_name && (
                                            <div className="text-sm font-medium text-gray-800 mb-1">{photo.client_name}</div>
                                        )}
                                        {photo.duration_weeks && (
                                            <div className="text-xs text-gray-500 mb-2">Thời gian: {photo.duration_weeks} tuần</div>
                                        )}
                                        {photo.story && (
                                            <p className="text-sm text-gray-600 leading-relaxed">{photo.story}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Testimonials Section */}
                    {testimonials.length > 0 && (
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h2 className="text-h3 mb-4">Đánh giá từ học viên</h2>
                            <div className="grid gap-4 md:grid-cols-2">
                                {testimonials.map(testimonial => (
                                    <div key={testimonial.id} className="card">
                                        <div className="flex items-start gap-3 mb-3">
                                            {testimonial.client_avatar ? (
                                                <img src={testimonial.client_avatar} alt={testimonial.client_name} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                                                    {testimonial.client_name.charAt(0)}
                                                </div>
                                            )}
                                            <div className="flex-1">
                                                <div className="font-bold text-sm">{testimonial.client_name}</div>
                                                <div className="text-yellow-500 text-sm">{'⭐'.repeat(testimonial.rating)}</div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{testimonial.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Similar Profiles */}
                    {similarCoaches.length > 0 && (
                        <div className="border-t border-gray-200 pt-6 mt-6">
                            <h2 className="text-h3 mb-4">Huấn luyện viên tương tự</h2>
                            <div className="grid gap-4 md:grid-cols-3">
                                {similarCoaches.map(coach => (
                                    <Link to={`/coaches/${coach.id}`} key={coach.id} className="card hover:border-black transition-colors">
                                        <div className="flex flex-col items-center text-center">
                                            {coach.avatar_url ? (
                                                <img src={coach.avatar_url} alt={coach.full_name} className="w-20 h-20 rounded-full object-cover border border-gray-200 mb-3" />
                                            ) : (
                                                <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xl font-bold mb-3">
                                                    {coach.full_name.charAt(0)}
                                                </div>
                                            )}
                                            <h3 className="font-bold text-base mb-1">{coach.full_name}</h3>
                                            {coach.specialties && coach.specialties.length > 0 && (
                                                <div className="flex flex-wrap justify-center gap-1 mb-2">
                                                    {coach.specialties.slice(0, 2).map((s: string) => (
                                                        <span key={s} className="text-xs bg-gray-100 px-2 py-0.5 rounded-xs border border-gray-200">{s}</span>
                                                    ))}
                                                </div>
                                            )}
                                            {coach.base_price_monthly && (
                                                <div className="text-sm font-bold text-black mt-2">
                                                    {Number(coach.base_price_monthly).toLocaleString('vi-VN')}₫<span className="text-xs font-normal">/tháng</span>
                                                </div>
                                            )}
                                            <div className="btn-secondary w-full mt-3 text-sm text-center">Xem chi tiết</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
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
                        <button onClick={handleCheckPayment} disabled={checkingStatus} className="btn-primary w-full">
                            {checkingStatus ? 'Đang kiểm tra...' : 'Tôi đã chuyển khoản'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
