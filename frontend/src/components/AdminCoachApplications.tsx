import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import { AdminLoadingBlock, adminEmptyStateClassName } from './admin/adminPanelPrimitives';

interface Applicant {
    id: string;
    created_at: string;
    specialties: string[] | null;
    headline: string;
    base_price_monthly: number | null;
    motivation: string;
    certifications_note: string | null;
    user: {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string | null;
        user_type: string;
    };
}

export default function AdminCoachApplications() {
    const [applications, setApplications] = useState<Applicant[]>([]);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [rejectId, setRejectId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ id: string; msg: string; ok: boolean } | null>(null);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/coach-applications');
            setApplications(res.data.applications ?? []);
            setTotal(res.data.total ?? 0);
        } catch {
            setApplications([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const approve = async (id: string) => {
        setActionLoading(id);
        try {
            await apiClient.patch(`/coach-applications/${id}/approve`);
            setFeedback({ id, msg: 'Đã duyệt — tài khoản được chuyển thành huấn luyện viên', ok: true });
            setApplications(prev => prev.filter(a => a.id !== id));
        } catch (err: any) {
            setFeedback({ id, msg: err?.response?.data?.error ?? 'Lỗi khi duyệt', ok: false });
        } finally {
            setActionLoading(null);
        }
    };

    const reject = async (id: string) => {
        if (!rejectReason.trim() || rejectReason.trim().length < 10) return;
        setActionLoading(id);
        try {
            await apiClient.patch(`/coach-applications/${id}/reject`, { rejection_reason: rejectReason.trim() });
            setFeedback({ id, msg: 'Đã từ chối và ghi nhận lý do', ok: true });
            setApplications(prev => prev.filter(a => a.id !== id));
            setRejectId(null);
            setRejectReason('');
        } catch (err: any) {
            setFeedback({ id, msg: err?.response?.data?.error ?? 'Lỗi khi từ chối', ok: false });
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading) {
        return <AdminLoadingBlock />;
    }

    if (applications.length === 0) {
        return (
            <div className={adminEmptyStateClassName}>
                <p className="font-semibold text-gray-900">Không có đơn đang chờ duyệt</p>
                <p className="mt-2 text-xs text-gray-500">Tổng đơn đã xử lý: {total}</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>
                {applications.length} đơn chờ duyệt
            </p>

            {feedback && (
                <div style={{
                    padding: '10px 16px', borderRadius: 8,
                    background: feedback.ok ? '#f0fdf4' : '#fef2f2',
                    color: feedback.ok ? '#166534' : '#991b1b',
                    fontSize: '0.82rem', fontWeight: 600,
                }}>
                    {feedback.ok ? '✓' : '⚠'} {feedback.msg}
                    <button onClick={() => setFeedback(null)} style={{ marginLeft: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.6 }}>×</button>
                </div>
            )}

            {applications.map(app => (
                <div key={app.id} style={{ border: '1.5px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                    {/* Header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: '#fafafa' }}>
                        {app.user.avatar_url ? (
                            <img src={app.user.avatar_url} alt={app.user.full_name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                                {app.user.full_name[0]}
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 700, color: '#111', margin: 0, fontSize: '0.95rem' }}>{app.user.full_name}</p>
                            <p style={{ fontSize: '0.72rem', color: '#6b7280', margin: 0 }}>{app.user.email} · {new Date(app.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <button
                            onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.78rem', fontWeight: 600 }}
                        >
                            {expanded === app.id ? '▲ Thu gọn' : '▼ Xem chi tiết'}
                        </button>
                    </div>

                    {/* Expanded details */}
                    {expanded === app.id && (
                        <div style={{ padding: '16px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 14 }}>
                            <Detail label="Tiêu đề" value={app.headline} />
                            <Detail label="Chuyên môn" value={app.specialties?.join(', ') ?? '—'} />
                            {app.base_price_monthly && (
                                <Detail label="Giá đề nghị" value={`${Number(app.base_price_monthly).toLocaleString('vi-VN')} đ/tháng`} />
                            )}
                            <Detail label="Lý do đăng ký" value={app.motivation} />
                            {app.certifications_note && (
                                <Detail label="Chứng chỉ / Giải thưởng" value={app.certifications_note} />
                            )}
                        </div>
                    )}

                    {/* Action row */}
                    <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <button
                            onClick={() => approve(app.id)}
                            disabled={actionLoading === app.id}
                            style={{
                                padding: '8px 20px', borderRadius: 8, border: 'none',
                                background: '#16a34a', color: '#fff',
                                fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                                opacity: actionLoading === app.id ? 0.6 : 1,
                            }}
                        >
                            {actionLoading === app.id ? 'Đang xử lý...' : '✓ Duyệt — Nâng thành huấn luyện viên'}
                        </button>

                        {rejectId === app.id ? (
                            <div style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                                <input
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    placeholder="Lý do từ chối (tối thiểu 10 ký tự)..."
                                    style={{ flex: 1, minWidth: 180, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #fca5a5', fontSize: '0.78rem', outline: 'none' }}
                                />
                                <button
                                    onClick={() => reject(app.id)}
                                    disabled={rejectReason.trim().length < 10 || actionLoading === app.id}
                                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#dc2626', color: '#fff', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', opacity: rejectReason.trim().length < 10 ? 0.5 : 1 }}
                                >Gửi</button>
                                <button onClick={() => { setRejectId(null); setRejectReason(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '0.78rem' }}>Hủy</button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setRejectId(app.id)}
                                style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #fca5a5', background: '#fff', color: '#dc2626', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                            >Từ chối</button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
    <div>
        <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9ca3af', margin: '0 0 3px' }}>{label}</p>
        <p style={{ fontSize: '0.85rem', color: '#111', margin: 0, lineHeight: 1.5 }}>{value}</p>
    </div>
);
