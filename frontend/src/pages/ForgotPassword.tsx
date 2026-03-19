import { useState } from 'react';
import apiClient from '../services/api';

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
      setError(err.response?.data?.error || 'Không thể gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Quên mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập email của bạn để nhận mã khôi phục mật khẩu.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email" className="sr-only">Địa chỉ email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-md border-0 py-3 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6"
                placeholder="Địa chỉ email"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-md">{success}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-black px-3 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:bg-gray-400"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã khôi phục'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <a href="/reset-password" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Bạn đã có mã khôi phục? Đặt lại mật khẩu
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
