import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '../store/slices/authSlice';
import { authApi } from '../services/auth';

export default function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user: authUser, isLoading: authLoading } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (isAuthenticated && authUser && !authLoading) {
            if (authUser.user_type === 'gym_owner' && !authUser.onboarding_completed) {
                navigate('/gym-owner/register');
            } else if (!authUser.onboarding_completed) {
                navigate('/onboarding');
            } else {
                navigate('/dashboard');
            }
        }
    }, [isAuthenticated, authUser, authLoading, navigate]);

    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        user_type: 'user' as 'user' | 'athlete' | 'trainer' | 'gym_owner',
    });
    const [error, setError] = useState('');
    const [loading, setLoadingState] = useState(false);

    const [step, setStep] = useState<1 | 2>(1);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        setStep(2);
    };

    const handleSelectRoleAndSubmit = async (role: 'user' | 'athlete' | 'trainer' | 'gym_owner') => {
        setForm(prev => ({ ...prev, user_type: role }));
        setError('');
        setLoadingState(true);
        dispatch(setLoading(true));

        try {
            const result = await authApi.register({
                email: form.email,
                password: form.password,
                full_name: form.full_name,
                user_type: role,
            });
            dispatch(setCredentials({
                user: result.user,
                access_token: result.access_token,
                refresh_token: result.refresh_token,
            }));
            if (result.user.user_type === 'gym_owner') {
                navigate('/gym-owner/register');
            } else {
                navigate('/verify-email');
            }
        } catch (err: any) {
            setError(
                err.response?.data?.error || 'Registration failed. Please try again.'
            );
            dispatch(setLoading(false));
            setStep(1); // Go back to step 1 on error
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="page-shell">
            <Helmet>
                <title>Đăng ký — GymViet</title>
                <meta name="description" content="Tạo tài khoản GYMERVIET miễn phí. Bắt đầu hành trình tập luyện với huấn luyện viên và phòng tập hàng đầu Việt Nam." />
            </Helmet>
            <div className="page-container max-w-md py-16 sm:py-20">
                <div className="text-center page-header mb-8">
                    <p className="page-kicker">Gia nhập Gymerviet</p>
                    <h1 className="page-title text-center text-3xl font-black mb-2">{step === 1 ? 'Tạo tài khoản' : 'Mục tiêu của bạn là gì?'}</h1>
                    <p className="page-description mx-auto text-center">
                        {step === 1 ? 'Bắt đầu hành trình tập luyện cùng cộng đồng GYMERVIET.' : 'Chọn vai trò để cá nhân hoá trải nghiệm của bạn.'}
                    </p>
                </div>

                {/* Card */}
                <div className="card border border-[color:var(--mk-line)] shadow-sm">
                    {error && (
                        <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4 font-medium">
                            {error}
                        </div>
                    )}
                    
                    {step === 1 ? (
                        <form onSubmit={handleNext} className="space-y-4" aria-label="Biểu mẫu đăng ký">
                            <div>
                                <label htmlFor="full_name" className="form-label text-[13px] font-bold">
                                    Họ và tên
                                </label>
                                <input
                                    id="full_name"
                                    name="full_name"
                                    type="text"
                                    aria-required="true"
                                    value={form.full_name}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Nguyễn Văn A"
                                />
                            </div>

                            <div>
                                <label htmlFor="email" className="form-label text-[13px] font-bold">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    aria-required="true"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="your@email.com"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="form-label text-[13px] font-bold">
                                    Mật khẩu
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    aria-required="true"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    minLength={8}
                                    className="form-input"
                                    placeholder="Tối thiểu 8 ký tự"
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="form-label text-[13px] font-bold">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    aria-required="true"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="Nhập lại mật khẩu"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-base btn-lg bg-black text-white hover:bg-gray-800 font-bold w-full mt-6"
                            >
                                Tiếp tục →
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => handleSelectRoleAndSubmit('user')}
                                disabled={loading}
                                className="w-full text-left p-4 rounded-lg border-2 border-[color:var(--mk-line)] hover:border-black transition-colors focus:ring-2 focus:ring-black flex items-center gap-4 group"
                            >
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all" aria-hidden="true">🏋️</div>
                                <div>
                                    <div className="font-bold text-[color:var(--mk-text)]">Tôi muốn tập luyện</div>
                                    <div className="text-xs text-[color:var(--mk-muted)] font-medium">Tìm coach, phòng tập và kết nối cộng đồng</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectRoleAndSubmit('trainer')}
                                disabled={loading}
                                className="w-full text-left p-4 rounded-lg border-2 border-[color:var(--mk-line)] hover:border-black transition-colors focus:ring-2 focus:ring-black flex items-center gap-4 group"
                            >
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all" aria-hidden="true">🎯</div>
                                <div>
                                    <div className="font-bold text-[color:var(--mk-text)]">Tôi là Coach / HLV</div>
                                    <div className="text-xs text-[color:var(--mk-muted)] font-medium">Tạo hồ sơ chuyên nghiệp và quản lý học viên</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectRoleAndSubmit('gym_owner')}
                                disabled={loading}
                                className="w-full text-left p-4 rounded-lg border-2 border-[color:var(--mk-line)] hover:border-black transition-colors focus:ring-2 focus:ring-black flex items-center gap-4 group"
                            >
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all" aria-hidden="true">🏢</div>
                                <div>
                                    <div className="font-bold text-[color:var(--mk-text)]">Tôi quản lý Gym</div>
                                    <div className="text-xs text-[color:var(--mk-muted)] font-medium">Đưa Gym lên bản đồ và quản lý nhân sự</div>
                                </div>
                            </button>

                            {loading && <div className="text-center text-sm font-medium text-[color:var(--mk-muted)] mt-4 animate-pulse">Đang xử lý...</div>}

                            <button 
                                onClick={() => setStep(1)} 
                                disabled={loading}
                                className="mt-6 text-sm text-[color:var(--mk-muted)] font-medium hover:text-black w-full text-center flex items-center justify-center gap-1"
                            >
                                ← Quay lại
                            </button>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-[color:var(--mk-line)] text-center text-sm text-[color:var(--mk-text-soft)]">
                        Đã có tài khoản?{' '}
                        <Link
                            to="/login"
                            className="text-black font-medium hover:underline"
                        >
                            Đăng nhập
                        </Link>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Link to="/" className="back-link justify-center">
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
