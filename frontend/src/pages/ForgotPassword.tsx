import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../services/api';
import { Button } from '../components/ui/Button';
import { extractApiErrorMessage } from '../lib/apiErrors';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSuccess('Nếu email có trong hệ thống, chúng tôi đã gửi mã khôi phục cho bạn. Vui lòng kiểm tra hộp thư (và thư mục rác).');
    } catch (err: any) {
      setError(extractApiErrorMessage(err, 'Không thể gửi yêu cầu'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <Helmet>
        <title>Quên mật khẩu — GYMERVIET</title>
      </Helmet>
      <div className="page-container max-w-md gv-pad-y">
        <div className="text-center page-header">
          <h1 className="page-title text-center">Quên mật khẩu</h1>
          <p className="page-description mx-auto text-center">
            Nhập email của bạn để nhận mã khôi phục mật khẩu.
          </p>
        </div>

        <div className="card">
          <form className="space-y-4" onSubmit={handleSubmit} aria-label="Biểu mẫu quên mật khẩu">
            <div>
              <label htmlFor="email" className="form-label">
                Địa chỉ email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="your@email.com"
                autoComplete="email"
              />
            </div>

            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-gray-900 px-4 py-3 rounded-xs text-sm">
                {error}
              </div>
            )}
            {success && (
              <div role="status" className="text-green-800 text-sm bg-green-50 border border-green-200 px-4 py-3 rounded-xs">
                {success}
              </div>
            )}

            <Button type="submit" variant="primary" size="full" loading={loading}>
              {loading ? 'Đang gửi...' : 'Gửi mã khôi phục'}
            </Button>

            <div className="text-center text-sm pt-2">
              <Link to="/reset-password" className="font-semibold text-black hover:underline">
                Bạn đã có mã khôi phục? Đặt lại mật khẩu
              </Link>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <Link to="/login" className="back-link justify-center">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
