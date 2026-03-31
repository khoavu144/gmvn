import { useCallback, useEffect, useMemo, useState } from 'react';
import apiClient from '../services/api';
import { AdminLoadingBlock } from './admin/adminPanelPrimitives';

type DependencyCheck = {
    status: 'up' | 'down' | 'degraded' | 'skipped';
    details?: Record<string, unknown>;
};

type HealthResponse = {
    success: boolean;
    status: 'OK' | 'DEGRADED' | 'ERROR';
    timestamp: string;
    checks: Record<string, DependencyCheck>;
    db?: {
        users?: number;
        gyms?: number;
    };
};

type AuditRow = {
    id: string;
    admin_id: string;
    action: string;
    action_category: string;
    target_user_id: string | null;
    reason: string;
    result: string;
    timestamp: string;
};

type EmailOutboxRecord = {
    id: string;
    status: string;
    email_type: string;
    recipient_email: string;
    attempt_count: number;
    last_error: string | null;
    next_attempt_at: string;
    created_at: string;
};

type PlatformBillingStatus = {
    success: boolean;
    billing_enabled: boolean;
    deprecated?: boolean;
    mode?: string;
    message?: string;
};

function apiErrorMessage(error: unknown, fallback: string) {
    if (!error || typeof error !== 'object' || !('response' in error)) {
        return fallback;
    }
    const response = (error as { response?: { data?: { error?: { message?: string } | string } } }).response;
    const payloadError = response?.data?.error;
    if (typeof payloadError === 'string') {
        return payloadError;
    }
    if (payloadError?.message) {
        return payloadError.message;
    }
    return fallback;
}

function statusTone(status: string) {
    const normalized = status.toLowerCase();
    if (normalized === 'ok' || normalized === 'up' || normalized === 'processed' || normalized === 'sent') {
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    }
    if (normalized === 'degraded' || normalized === 'pending' || normalized === 'processing' || normalized === 'received') {
        return 'text-amber-700 bg-amber-50 border-amber-200';
    }
    if (normalized === 'ignored' || normalized === 'disabled') {
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
    return 'text-red-700 bg-red-50 border-red-200';
}

function fmtDate(value?: string | null) {
    if (!value) return '—';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '—';
    return parsed.toLocaleString('vi-VN');
}

export default function AdminOperationalPanel() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [pending, setPending] = useState<AuditRow[]>([]);
    const [emailOutbox, setEmailOutbox] = useState<EmailOutboxRecord[]>([]);
    const [platformBilling, setPlatformBilling] = useState<PlatformBillingStatus | null>(null);
    const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const [h, p, outbox, billing] = await Promise.all([
                apiClient.get('/admin/health'),
                apiClient.get('/admin/pending-approvals'),
                apiClient.get('/admin/email-outbox', {
                    params: {
                        page: 1,
                        limit: 20,
                    },
                }),
                apiClient.get('/platform/admin/billing'),
            ]);

            setHealth(h.data as HealthResponse);
            setPending((p.data.requests || []) as AuditRow[]);
            setEmailOutbox((outbox.data.items ?? []) as EmailOutboxRecord[]);
            setPlatformBilling(billing.data as PlatformBillingStatus);
        } catch (error) {
            setErr(apiErrorMessage(error, 'Không tải được dữ liệu'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const approve = useCallback(async (logId: string) => {
        setBusyId(logId);
        setErr(null);
        try {
            await apiClient.post(`/admin/approvals/${logId}/approve`);
            await load();
        } catch (error) {
            setErr(apiErrorMessage(error, 'Không thể duyệt yêu cầu.'));
        } finally {
            setBusyId(null);
        }
    }, [load]);

    const reject = useCallback(async (logId: string) => {
        setBusyId(logId);
        setErr(null);
        try {
            await apiClient.post(`/admin/approvals/${logId}/reject`, {
                reason: rejectReason[logId] || 'Từ chối',
            });
            setRejectReason((prev) => {
                const next = { ...prev };
                delete next[logId];
                return next;
            });
            await load();
        } catch (error) {
            setErr(apiErrorMessage(error, 'Không thể từ chối yêu cầu.'));
        } finally {
            setBusyId(null);
        }
    }, [load, rejectReason]);

    const retryOutbox = useCallback(async (id: string) => {
        setBusyId(id);
        setErr(null);
        try {
            await apiClient.post(`/admin/email-outbox/${id}/retry`);
            await load();
        } catch (error) {
            setErr(apiErrorMessage(error, 'Retry email thất bại.'));
        } finally {
            setBusyId(null);
        }
    }, [load]);

    const statusEntries = useMemo(
        () => Object.entries(health?.checks || {}),
        [health?.checks],
    );

    if (loading && !health) {
        return <AdminLoadingBlock />;
    }

    return (
        <div className="space-y-10">
            {err && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                    {err}
                </div>
            )}

            <section>
                <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-black uppercase tracking-tight">
                    Sức khỏe hệ thống
                </h3>
                {health ? (
                    <div className="space-y-4">
                        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="text-xs font-bold uppercase text-gray-500">Trạng thái</div>
                                <div className={`mt-1 inline-flex rounded border px-2 py-1 text-xs font-semibold ${statusTone(health.status)}`}>
                                    {health.status}
                                </div>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="text-xs font-bold uppercase text-gray-500">Users (DB)</div>
                                <div className="mt-1 font-bold">{health.db?.users ?? '—'}</div>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="text-xs font-bold uppercase text-gray-500">Gyms (DB)</div>
                                <div className="mt-1 font-bold">{health.db?.gyms ?? '—'}</div>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-4">
                                <div className="text-xs font-bold uppercase text-gray-500">Timestamp</div>
                                <div className="mt-1 text-xs font-bold">{fmtDate(health.timestamp)}</div>
                            </div>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                            {statusEntries.map(([name, check]) => (
                                <div key={name} className="rounded-lg border border-gray-200 p-3 text-xs">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-bold uppercase tracking-[0.08em] text-gray-600">{name}</span>
                                        <span className={`rounded border px-2 py-0.5 font-semibold ${statusTone(check.status)}`}>
                                            {check.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Không có dữ liệu.</p>
                )}
                <button type="button" onClick={() => void load()} className="mt-3 text-xs font-bold uppercase text-gray-500 hover:text-black">
                    Làm mới
                </button>
            </section>

            <section>
                <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-black uppercase tracking-tight">
                    Trạng thái monetization nền tảng
                </h3>
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-5 py-4 text-sm leading-7 text-gray-700">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded border px-2 py-1 text-xs font-semibold ${statusTone(platformBilling?.billing_enabled ? 'up' : 'disabled')}`}>
                            {platformBilling?.billing_enabled ? 'enabled' : 'disabled'}
                        </span>
                        <span className="font-semibold text-gray-900">Free-first mode đang hoạt động</span>
                    </div>
                    <p className="mt-3">
                        Thu phí nền tảng đã bị vô hiệu hóa. Các panel checkout intent, webhook event và reconcile platform billing không còn là bề mặt vận hành chính.
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                        Coach / gym commerce vẫn được giữ ở các flow riêng, không điều khiển từ panel này.
                    </p>
                </div>
            </section>

            <section>
                <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-black uppercase tracking-tight">
                    Email outbox
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 uppercase text-gray-500">
                            <tr>
                                <th className="p-2">Status</th>
                                <th className="p-2">Type</th>
                                <th className="p-2">Recipient</th>
                                <th className="p-2">Attempts</th>
                                <th className="p-2">Next attempt</th>
                                <th className="p-2">Last error</th>
                                <th className="p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emailOutbox.map((item) => (
                                <tr key={item.id} className="border-t border-gray-200">
                                    <td className="p-2">
                                        <span className={`rounded border px-2 py-1 text-[11px] font-semibold ${statusTone(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-2">{item.email_type}</td>
                                    <td className="p-2">{item.recipient_email}</td>
                                    <td className="p-2">{item.attempt_count}</td>
                                    <td className="p-2 whitespace-nowrap">{fmtDate(item.next_attempt_at)}</td>
                                    <td className="max-w-[220px] truncate p-2 text-red-700">{item.last_error || '—'}</td>
                                    <td className="p-2">
                                        <button
                                            type="button"
                                            className="btn-secondary px-2 py-1 text-[11px]"
                                            disabled={busyId === item.id}
                                            onClick={() => void retryOutbox(item.id)}
                                        >
                                            Retry
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {emailOutbox.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="p-4 text-center text-sm text-gray-500">
                                        Không có email outbox record.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h3 className="mb-4 border-b border-gray-200 pb-2 text-lg font-black uppercase tracking-tight">
                    Duyệt hành động rủi ro cao
                </h3>
                {pending.length === 0 ? (
                    <p className="text-sm text-gray-500">Không có yêu cầu chờ duyệt.</p>
                ) : (
                    <div className="space-y-4">
                        {pending.map((row) => (
                            <div key={row.id} className="rounded-lg border border-gray-200 p-4 text-sm">
                                <div className="font-mono text-xs text-gray-500">{row.id}</div>
                                <div className="mt-2">
                                    <span className="font-bold">{row.action}</span>
                                    <span className="text-gray-500"> · {row.action_category}</span>
                                </div>
                                <div className="mt-1 text-gray-500">Lý do: {row.reason}</div>
                                <div className="mt-1 text-xs">Admin yêu cầu: {row.admin_id}</div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        disabled={busyId === row.id}
                                        onClick={() => void approve(row.id)}
                                        className="btn-primary px-3 py-2 text-xs"
                                    >
                                        Duyệt
                                    </button>
                                    <input
                                        type="text"
                                        placeholder="Lý do từ chối"
                                        value={rejectReason[row.id] || ''}
                                        onChange={(event) =>
                                            setRejectReason((prev) => ({ ...prev, [row.id]: event.target.value }))
                                        }
                                        className="form-input min-w-[160px] flex-1 text-sm"
                                    />
                                    <button
                                        type="button"
                                        disabled={busyId === row.id}
                                        onClick={() => void reject(row.id)}
                                        className="btn-secondary px-3 py-2 text-xs"
                                    >
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
