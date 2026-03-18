import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials, setLoading } from '../store/slices/authSlice';
import { authApi } from '../services/auth';
import type { RootState } from '../store/store';

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const loading = useSelector((state: RootState) => state.auth.isLoading);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        dispatch(setLoading(true));

        try {
            const result = await authApi.login({ email, password });
            dispatch(setCredentials({
                user: result.user,
                access_token: result.access_token,
                refresh_token: result.refresh_token,
            }));
            navigate('/dashboard');
        } catch (err: any) {
            const statusCode = err.response?.status;
            const fallbackMessage = statusCode === 429
                ? 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.'
                : 'Đăng nhập thất bại. Vui lòng thử lại.';

            setError(err.response?.data?.error || fallbackMessage);
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="page-shell">
            <Helmet>
                <title>Đăng nhập — GymViet</title>
                <meta name="description" content="Đăng nhập tài khoản GYMERVIET để quản lý hồ sơ, kết nối Coach và theo dõi tiến trình tập luyện." />
            </Helmet>
            <div className="page-container max-w-md py-16 sm:py-20">
                <div className="text-center page-header">
                    <p className="page-kicker">Chào mừng trở lại</p>
                    <h1 className="page-title text-center">Đăng nhập</h1>
                    <p className="page-description mx-auto text-center">Truy cập vào tài khoản GYMERVIET của bạn với giao diện thống nhất theo homepage.</p>
                </div>

                {/* Card */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Biểu mẫu đăng nhập">
                        {error && (
                            <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-gray-800 px-4 py-3 rounded-xs text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                aria-required="true"
                                aria-invalid={!!error}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="form-input"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                type="password"
                                aria-required="true"
                                aria-invalid={!!error}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="form-input"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            aria-busy={loading}
                            className="btn-primary w-full mt-2"
                        >
                            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                        Chưa có tài khoản?{' '}
                        <Link
                            to="/register"
                            className="text-black font-medium hover:underline"
                        >
                            Đăng ký
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
