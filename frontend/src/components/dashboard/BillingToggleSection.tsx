import { useState } from 'react';
import apiClient from '../../services/api';

interface BillingToggleSectionProps {
    initialEnabled?: boolean;
}

export default function BillingToggleSection({ initialEnabled = false }: BillingToggleSectionProps) {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [isLoading, setIsLoading] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const toggle = async (newValue: boolean) => {
        if (newValue && !showConfirm) {
            setShowConfirm(true);
            return;
        }
        setShowConfirm(false);
        setIsLoading(true);
        setFeedback(null);
        try {
            const res = await apiClient.patch('/platform/admin/billing', { enabled: newValue });
            setEnabled(res.data.billing_enabled);
            setFeedback(res.data.billing_enabled ? '✅ Thu phí đã được BẬT — giới hạn Free tier đang được enforce' : '✅ Thu phí đã TẮT — mọi user dùng full tính năng');
        } catch (err: any) {
            setFeedback('⚠ ' + (err?.response?.data?.error ?? 'Lỗi khi thay đổi'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', margin: '0 0 4px' }}>Thu phí nền tảng</p>
                    <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0 }}>
                        {enabled
                            ? 'ĐANG BẬT — Giới hạn Free tier đang được enforce'
                            : 'ĐANG TẮT — Mọi user dùng full tính năng miễn phí'}
                    </p>
                </div>
                {/* Toggle switch */}
                <button
                    onClick={() => toggle(!enabled)}
                    disabled={isLoading}
                    style={{
                        width: 56, height: 30, borderRadius: 8, border: 'none',
                        background: enabled ? '#16a34a' : '#d1d5db',
                        position: 'relative', cursor: 'pointer',
                        transition: 'background 0.2s ease',
                        flexShrink: 0,
                        opacity: isLoading ? 0.6 : 1,
                    }}
                >
                    <span style={{
                        position: 'absolute', top: 3, left: enabled ? 28 : 4,
                        width: 24, height: 24, borderRadius: '50%', background: '#fff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s ease',
                    }} />
                </button>
            </div>

            {/* Confirm dialog for enabling */}
            {showConfirm && (
                <div style={{ marginTop: 16, background: '#fef3c7', borderRadius: 8, padding: '14px 18px' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#92400e', margin: '0 0 10px' }}>
                        ⚠ Xác nhận BẬT thu phí?
                    </p>
                    <p style={{ fontSize: '0.78rem', color: '#78350f', margin: '0 0 14px', lineHeight: 1.5 }}>
                        Sau khi bật, user đang ở gói Free sẽ bị giới hạn (tối đa 3 chương trình, 10 học viên, 1 chi nhánh...).
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => toggle(true)} style={{ padding: '7px 18px', borderRadius: 8, border: 'none', background: '#92400e', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
                            Xác nhận bật
                        </button>
                        <button onClick={() => setShowConfirm(false)} style={{ padding: '7px 18px', borderRadius: 8, border: '1.5px solid #d97706', background: 'transparent', color: '#92400e', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {feedback && (
                <p style={{ marginTop: 12, fontSize: '0.8rem', color: feedback.startsWith('✅') ? '#166534' : '#991b1b', fontWeight: 600 }}>
                    {feedback}
                </p>
            )}
        </div>
    );
}
