import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import apiClient from '../services/api';
import { trackEvent } from '../lib/analytics';
import { extractApiErrorMessage } from '../lib/apiErrors';

const RESEND_SECONDS = 45;

export default function VerifyEmail() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendIn, setResendIn] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const registeredName = (location.state as { registered?: boolean; name?: string } | null)?.name;

    useEffect(() => {
        if (resendIn <= 0) return;
        const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [resendIn]);

    const helperCopy = useMemo(
        () =>
            resendIn > 0
                ? `Bạn có thể gửi lại mã sau ${resendIn}s.`
                : 'Không thấy email? Kiểm tra spam hoặc gửi lại mã.',
        [resendIn]
    );

    const handleVerify = async (event: React.FormEvent) => {
        event.preventDefault();

        if (code.trim().length !== 6) {
            setError('Mã xác thực phải gồm đúng 6 chữ số.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await apiClient.post('/auth/verify-email', { token: code.trim() });
            trackEvent('verify_complete', { source: 'verify_email_form' });
            setSuccess('Xác thực thành công. Chúng tôi đang đưa bạn sang bước hoàn thiện hồ sơ.');
            window.setTimeout(() => navigate('/onboarding'), 900);
        } catch (err: any) {
            setError(extractApiErrorMessage(err, 'Xác thực thất bại. Vui lòng thử lại.'));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendIn > 0) return;

        setError('');
        setSuccess('');
        try {
            await apiClient.post('/auth/send-verification');
            trackEvent('detail_cta_click', {
                page_id: 'verify_email',
                cta_id: 'resend_code',
                target: 'send_verification',
            });
            setSuccess('Mã xác thực mới đã được gửi. Hãy kiểm tra email của bạn.');
            setResendIn(RESEND_SECONDS);
        } catch (err: any) {
            setError(extractApiErrorMessage(err, 'Không thể gửi lại email ngay lúc này.'));
        }
    };

    return (
        <div className="auth-shell">
            <Helmet>
                <title>Xác thực email — GYMERVIET</title>
                <meta name="description" content="Xác thực email để tiếp tục onboarding và hoàn thiện tài khoản GYMERVIET." />
            </Helmet>

            <div className="auth-shell__grid">
                <section className="auth-shell__intro">
                    {registeredName && (
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                            <span className="font-semibold">Đăng ký thành công!</span> Đăng ký thành công. Hãy nhập mã xác thực từ email.
                        </div>
                    )}
                    <p className="page-kicker">Bước kích hoạt tài khoản</p>
                    <h1 className="page-title max-w-xl">
                        Xác nhận email để mở khóa bước hoàn thiện hồ sơ.
                    </h1>
                    <p className="page-description max-w-xl">
                        Xác thực xong, bạn sẽ được đưa thẳng sang onboarding.
                    </p>

                    <div className="auth-shell__summary surface-panel">
                        <div>
                            <span className="page-kicker">Tiếp theo</span>
                            <h2 className="section-title mt-1">Onboarding ngắn gọn</h2>
                        </div>
                        <ul className="auth-shell__points">
                            <li>Chỉ hỏi dữ liệu thật sự cần dùng.</li>
                            <li>Có thể bỏ qua phần chưa muốn khai báo.</li>
                            <li>Hoàn tất nhanh để vào dashboard.</li>
                        </ul>
                    </div>
                </section>

                <section className="auth-shell__panel surface-panel">
                    <div className="page-header">
                        <p className="page-kicker">Mã gồm 6 chữ số</p>
                        <h2 className="page-title text-2xl sm:text-3xl">Nhập mã xác thực</h2>
                        <p className="page-description">
                            Nhập mã 6 số đã gửi tới email của bạn.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleVerify}>
                        <div>
                            <label htmlFor="code" className="form-label">
                                Mã xác thực
                            </label>
                            <input
                                id="code"
                                name="code"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                required
                                maxLength={6}
                                value={code}
                                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="form-input text-center text-2xl tracking-[0.45em]"
                                placeholder="000000"
                            />
                        </div>

                        {error ? (
                            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        ) : null}

                        {success ? (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                {success}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? 'Đang xác thực…' : 'Xác thực và tiếp tục'}
                        </button>
                    </form>

                    <div className="mt-6 space-y-3 border-t border-gray-200 pt-5">
                        <p className="text-sm leading-6 text-gray-500">{helperCopy}</p>
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendIn > 0}
                            className="text-sm font-semibold text-gray-900 underline underline-offset-4 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                            {resendIn > 0 ? `Gửi lại sau ${resendIn}s` : 'Gửi lại mã xác thực'}
                        </button>
                    </div>

                    <div className="mt-8">
                        <Link to="/register" className="back-link">
                            ← Quay lại đăng ký
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
