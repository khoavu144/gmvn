import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials, setLoading } from '../store/slices/authSlice';
import { authApi } from '../services/auth';

export default function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form, setForm] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        user_type: 'athlete' as 'athlete' | 'trainer',
    });
    const [error, setError] = useState('');
    const [loading, setLoadingState] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setLoadingState(true);
        dispatch(setLoading(true));

        try {
            const result = await authApi.register({
                email: form.email,
                password: form.password,
                full_name: form.full_name,
                user_type: form.user_type,
            });
            dispatch(setCredentials(result));
            navigate('/dashboard');
        } catch (err: any) {
            setError(
                err.response?.data?.error || 'Registration failed. Please try again.'
            );
            dispatch(setLoading(false));
        } finally {
            setLoadingState(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-h1">GYMERVIET</h1>
                    <p className="text-body mt-2">Tạo tài khoản mới</p>
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
                            <label htmlFor="full_name" className="form-label">
                                Họ và tên
                            </label>
                            <input
                                id="full_name"
                                name="full_name"
                                type="text"
                                value={form.full_name}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="form-label">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                required
                                className="form-input"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="user_type" className="form-label">
                                Loại tài khoản
                            </label>
                            <select
                                id="user_type"
                                name="user_type"
                                value={form.user_type}
                                onChange={handleChange}
                                className="form-input"
                            >
                                <option value="athlete">Người tập (Athlete)</option>
                                <option value="trainer">Huấn luyện viên (Trainer)</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                className="form-input"
                                placeholder="Tối thiểu 8 ký tự"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="form-label">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
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
                            className="btn-primary w-full mt-4"
                        >
                            {loading ? 'Đang tạo...' : 'Đăng ký'}
                        </button>
                    </form>

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
                    <Link to="/" className="text-sm text-gray-500 hover:text-black hover:underline">
                        ← Quay lại trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}
