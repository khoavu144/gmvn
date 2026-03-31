import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setLoading } from '../store/slices/authSlice';
import { authApi } from '../services/auth';
import type { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { trackEvent } from '../lib/analytics';
import { extractApiErrorMessage } from '../lib/apiErrors';

export default function Register() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { isAuthenticated, user: authUser, isLoading: authLoading } = useSelector((state: RootState) => state.auth);

    const requestedRole = useMemo(() => {
        const value = searchParams.get('role');
        if (value === 'user' || value === 'athlete' || value === 'trainer' || value === 'gym_owner') {
            return value;
        }
        return null;
    }, [searchParams]);

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
    const [hasTrackedStart, setHasTrackedStart] = useState(false);

    const [step, setStep] = useState<1 | 2>(1);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        if (!hasTrackedStart) {
            trackEvent('register_start', { source: 'register_form' });
            setHasTrackedStart(true);
        }
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (requestedRole) {
            void handleSelectRoleAndSubmit(requestedRole);
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
            trackEvent('register_complete', {
                user_type: role,
                source: 'register_form',
            });
            if (result.user.user_type === 'gym_owner') {
                navigate('/gym-owner/register');
            } else {
                navigate('/verify-email', { state: { registered: true, name: form.full_name } });
            }
        } catch (err: any) {
            setError(extractApiErrorMessage(err, 'Registration failed. Please try again.'));
            dispatch(setLoading(false));
            setStep(1);
            // Clear sensitive fields when going back to step 1 after error
            setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="auth-shell">
            <Helmet>
                <title>Đăng ký — GYMERVIET</title>
                <meta name="description" content="Tạo tài khoản GYMERVIET miễn phí. Bắt đầu hành trình tập luyện với huấn luyện viên và phòng tập hàng đầu Việt Nam." />
            </Helmet>
            <div className="page-container max-w-md gv-pad-y">
                <div className="text-center page-header mb-8">
                    <p className="page-kicker">Gia nhập Gymerviet</p>
                    <h1 className="page-title text-center">{step === 1 ? 'Tạo tài khoản' : 'Mục tiêu của bạn là gì?'}</h1>
                    <p className="page-description mx-auto text-center">
                        {step === 1
                            ? requestedRole === 'gym_owner'
                                ? 'Tạo tài khoản đối tác để bắt đầu hồ sơ gym và gửi thông tin xác minh.'
                                : 'Bắt đầu hành trình tập luyện cùng cộng đồng GYMERVIET.'
                            : 'Chọn vai trò để cá nhân hoá trải nghiệm của bạn.'}
                    </p>
                </div>

                {/* Card */}
                <div className="card border border-gray-200 shadow-sm">
                    {error && (
                        <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm mb-4 font-medium">
                            {error}
                        </div>
                    )}

                    {requestedRole === 'gym_owner' && step === 1 && (
                        <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                            Bạn đang bắt đầu với vai trò <span className="font-semibold text-gray-900">Chủ phòng tập</span>. Sau khi tạo tài khoản, bạn sẽ được chuyển tới bước gửi hồ sơ gym đầu tiên.
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

                            <Button type="submit" variant="primary" size="lg" className="w-full mt-6" disabled={loading}>
                                {requestedRole === 'gym_owner' ? 'Tạo tài khoản đối tác →' : 'Tiếp tục →'}
                            </Button>
                        </form>
                    ) : (
                        <div className="space-y-3">
                            <button
                                onClick={() => handleSelectRoleAndSubmit('user')}
                                disabled={loading}
                                className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-black transition-colors focus:ring-2 focus:ring-black flex items-center gap-4 group"
                            >
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all" aria-hidden="true">🏋️</div>
                                <div>
                                    <div className="font-bold text-gray-900">Tôi muốn tập luyện</div>
                                    <div className="text-xs text-gray-500 font-medium">Tìm huấn luyện viên, phòng tập và kết nối cộng đồng</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectRoleAndSubmit('trainer')}
                                disabled={loading}
                                className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-black transition-colors focus:ring-2 focus:ring-black flex items-center gap-4 group"
                            >
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all" aria-hidden="true">🎯</div>
                                <div>
                                    <div className="font-bold text-gray-900">Tôi là huấn luyện viên</div>
                                    <div className="text-xs text-gray-500 font-medium">Tạo hồ sơ chuyên nghiệp và quản lý học viên</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleSelectRoleAndSubmit('gym_owner')}
                                disabled={loading}
                                className="w-full text-left p-4 rounded-lg border-2 border-gray-200 hover:border-black transition-colors focus:ring-2 focus:ring-black flex items-center gap-4 group"
                            >
                                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all" aria-hidden="true">🏢</div>
                                <div>
                                    <div className="font-bold text-gray-900">Tôi quản lý phòng tập</div>
                                    <div className="text-xs text-gray-500 font-medium">Đưa phòng tập lên bản đồ và quản lý nhân sự</div>
                                </div>
                            </button>

                            {loading && <div className="text-center text-sm font-medium text-gray-500 mt-4 animate-pulse">Đang xử lý...</div>}

                            <button 
                                onClick={() => {
                                    setStep(1);
                                    setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
                                }} 
                                disabled={loading}
                                className="mt-6 text-sm text-gray-500 font-medium hover:text-black w-full text-center flex items-center justify-center gap-1"
                            >
                                ← Quay lại
                            </button>
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
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
