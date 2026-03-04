import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '../store/slices/authSlice';
import { authApi } from '../services/auth';

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoadingState] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoadingState(true);
        dispatch(setLoading(true));

        try {
            const result = await authApi.login({ email, password });
            dispatch(setCredentials(result));
            navigate('/dashboard');
        } catch (err: any) {
            setError(
                err.response?.data?.error || 'Login failed. Please try again.'
            );
            dispatch(setLoading(false));
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="py-20 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                {/* Heading */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-black text-center">Đăng nhập</h2>
                    <p className="text-body mt-2 text-center">Truy cập vào tài khoản GYMERVIET của bạn</p>
                </div>

                {/* Card */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-gray-800 px-4 py-3 rounded-xs text-sm">
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
                    <Link to="/" className="text-sm text-gray-500 hover:text-black hover:underline">
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
