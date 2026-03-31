import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { extractApiErrorMessage } from '../lib/apiErrors';
import { Button } from '../components/ui/Button';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6 || newPassword.length < 8) {
      setError('Mã xác thực gồm 6 ký tự và mật khẩu mới từ 8 ký tự.');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      await apiClient.post('/auth/reset-password', { 
        email, 
        token: code, 
        new_password: newPassword 
      });
      setSuccess('Đặt lại mật khẩu thành công. Vui lòng đăng nhập.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(extractApiErrorMessage(err, 'Đặt lại mật khẩu thất bại'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Helmet>
        <title>Tạo mật khẩu mới — GYMERVIET</title>
        <meta name="description" content="Đặt lại mật khẩu tài khoản GYMERVIET." />
      </Helmet>
      <div className="page-container max-w-md gv-pad-y">
        <div className="text-center page-header">
          <p className="page-kicker">Khôi phục tài khoản</p>
          <h1 className="page-title text-center">Tạo mật khẩu mới</h1>
          <p className="page-description mx-auto text-center">Nhập email, mã khôi phục và mật khẩu mới của bạn.</p>
        </div>

        <div className="card">
          <form onSubmit={handleReset} className="space-y-4" aria-label="Biểu mẫu đặt lại mật khẩu">
            {error && (
              <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-gray-900 px-4 py-3 rounded-xs text-sm">
                {error}
              </div>
            )}
            {success && (
              <div role="status" aria-live="polite" className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xs text-sm">
                {success}
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                aria-required="true"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="code" className="form-label">Mã xác thực</label>
              <input
                id="code"
                type="text"
                aria-required="true"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="form-input text-center text-xl tracking-[0.3em] font-mono"
                placeholder="000000"
              />
            </div>

            <div>
              <label htmlFor="new-password" className="form-label">Mật khẩu mới</label>
              <input
                id="new-password"
                type="password"
                aria-required="true"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Tối thiểu 8 ký tự"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="full"
              loading={loading}
              aria-busy={loading}
              className="mt-2"
            >
              {loading ? 'Đang xử lý...' : 'Lưu mật khẩu mới'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
            Đã nhớ mật khẩu?{' '}
            <Link to="/login" className="text-black font-medium hover:underline">
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
