import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

export default function VerifyEmail() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Mã xác thực phải gồm 6 chữ số');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      await apiClient.post('/auth/verify-email', { token: code });
      setSuccess('Xác thực thành công. Đang chuyển hướng...');
      setTimeout(() => navigate('/onboarding'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await apiClient.post('/auth/send-verification');
      setSuccess('Đã gửi lại mã xác thực vào email của bạn.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Không thể gửi lại email');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Xác thực Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Mã xác thực 6 chữ số đã được gửi tới email của bạn.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="code" className="sr-only">Mã xác thực</label>
              <input
                id="code"
                name="code"
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="relative block w-full rounded-md border-0 py-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-500 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-black sm:text-sm sm:leading-6 text-center text-2xl tracking-[0.5em] font-mono"
                placeholder="000000"
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-md">{error}</div>}
          {success && <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-md">{success}</div>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md bg-black px-3 py-3 text-sm font-semibold text-white hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:bg-gray-400"
            >
              {loading ? 'Đang xử lý...' : 'Xác thực'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <button type="button" onClick={handleResend} className="font-semibold text-indigo-600 hover:text-indigo-500">
              Gửi lại mã xác thực
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
