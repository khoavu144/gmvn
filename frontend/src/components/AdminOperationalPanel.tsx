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

type BillingOpsSummary = {
    health_status: 'OK' | 'DEGRADED' | 'ERROR';
    health_checks: Record<string, DependencyCheck>;
    outbox: {
        pending_ready: number;
        failed_total: number;
        processing: number;
    };
    billing: {
        window_minutes: number;
        checkout: {
            pending: number;
            stale_pending: number;
            paid_without_subscription: number;
        };
        webhooks: {
            received_last_window: number;
            failed_last_window: number;
            processed_last_window: number;
        };
    };
};

type CheckoutIntent = {
    id: string;
    plan: string;
    transfer_content: string;
    amount: number;
    status: string;
    provider_transaction_id: string | null;
    created_at: string;
    expires_at: string;
    user: { full_name?: string; email?: string } | null;
};

type WebhookEvent = {
    id: string;
    status: string;
    provider_transaction_id: string | null;
    transfer_content: string | null;
    error_message: string | null;
    received_at: string;
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
    if (normalized === 'ignored') {
        return 'text-slate-700 bg-slate-50 border-slate-200';
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
    const [opsSummary, setOpsSummary] = useState<BillingOpsSummary | null>(null);
    const [checkoutIntents, setCheckoutIntents] = useState<CheckoutIntent[]>([]);
    const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>([]);
    const [emailOutbox, setEmailOutbox] = useState<EmailOutboxRecord[]>([]);
    const [checkoutStatus, setCheckoutStatus] = useState('');
    const [webhookStatus, setWebhookStatus] = useState('');
    const [billingSearch, setBillingSearch] = useState('');
    const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const [h, p, ops, intents, events, outbox] = await Promise.all([
                apiClient.get('/admin/health'),
                apiClient.get('/admin/pending-approvals'),
                apiClient.get('/admin/billing-ops/overview', { params: { window_minutes: 60 } }),
                apiClient.get('/platform/admin/checkout-intents', {
                    params: {
                        page: 1,
                        limit: 20,
                        status: checkoutStatus || undefined,
                        q: billingSearch || undefined,
                    },
                }),
                apiClient.get('/platform/admin/webhook-events', {
                    params: {
                        page: 1,
                        limit: 20,
                        status: webhookStatus || undefined,
                        q: billingSearch || undefined,
                    },
                }),
                apiClient.get('/admin/email-outbox', {
                    params: {
                        page: 1,
                        limit: 20,
                    },
                }),
            ]);

            setHealth(h.data as HealthResponse);
            setPending((p.data.requests || []) as AuditRow[]);
            setOpsSummary((ops.data.summary ?? null) as BillingOpsSummary | null);
            setCheckoutIntents((intents.data.intents ?? []) as CheckoutIntent[]);
            setWebhookEvents((events.data.events ?? []) as WebhookEvent[]);
            setEmailOutbox((outbox.data.items ?? []) as EmailOutboxRecord[]);
        } catch (error) {
            setErr(apiErrorMessage(error, 'Không tải được dữ liệu'));
        } finally {
            setLoading(false);
        }
    }, [checkoutStatus, webhookStatus, billingSearch]);

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

    const reconcileBilling = useCallback(async () => {
        setBusyId('billing-reconcile');
        setErr(null);
        try {
            await apiClient.post('/platform/admin/reconcile');
            await load();
        } catch (error) {
            setErr(apiErrorMessage(error, 'Reconcile billing thất bại.'));
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
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
                    Sức khỏe hệ thống
                </h3>
                {health ? (
                    <div className="space-y-4">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
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
                                <div className="mt-1 font-bold text-xs">{fmtDate(health.timestamp)}</div>
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
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
                    Billing ops overview
                </h3>
                {opsSummary ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 text-sm">
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="text-xs uppercase font-bold text-gray-500">Webhook failed ({opsSummary.billing.window_minutes}m)</div>
                            <div className="mt-1 text-lg font-black">{opsSummary.billing.webhooks.failed_last_window}</div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="text-xs uppercase font-bold text-gray-500">Checkout pending</div>
                            <div className="mt-1 text-lg font-black">{opsSummary.billing.checkout.pending}</div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="text-xs uppercase font-bold text-gray-500">Checkout stale pending</div>
                            <div className="mt-1 text-lg font-black">{opsSummary.billing.checkout.stale_pending}</div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="text-xs uppercase font-bold text-gray-500">Email outbox pending</div>
                            <div className="mt-1 text-lg font-black">{opsSummary.outbox.pending_ready}</div>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500">Chưa có dữ liệu billing ops.</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        className="btn-primary text-xs py-2 px-3"
                        disabled={busyId === 'billing-reconcile'}
                        onClick={() => void reconcileBilling()}
                    >
                        {busyId === 'billing-reconcile' ? 'Đang reconcile...' : 'Reconcile checkout intents'}
                    </button>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
                    Billing queues & events
                </h3>
                <div className="mb-3 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto_auto]">
                    <input
                        type="text"
                        className="form-input text-sm"
                        placeholder="Tìm theo transfer content / tx id / email"
                        value={billingSearch}
                        onChange={(event) => setBillingSearch(event.target.value)}
                    />
                    <select
                        className="form-input text-sm min-w-[11rem]"
                        value={checkoutStatus}
                        onChange={(event) => setCheckoutStatus(event.target.value)}
                    >
                        <option value="">Checkout: tất cả</option>
                        <option value="pending">pending</option>
                        <option value="paid">paid</option>
                        <option value="failed">failed</option>
                        <option value="expired">expired</option>
                        <option value="cancelled">cancelled</option>
                    </select>
                    <select
                        className="form-input text-sm min-w-[11rem]"
                        value={webhookStatus}
                        onChange={(event) => setWebhookStatus(event.target.value)}
                    >
                        <option value="">Webhook: tất cả</option>
                        <option value="received">received</option>
                        <option value="processed">processed</option>
                        <option value="ignored">ignored</option>
                        <option value="failed">failed</option>
                    </select>
                </div>

                <div className="space-y-5">
                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-500 mb-2">Checkout intents (latest)</h4>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 uppercase text-gray-500">
                                    <tr>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Plan</th>
                                        <th className="p-2">User</th>
                                        <th className="p-2">Amount</th>
                                        <th className="p-2">Transfer content</th>
                                        <th className="p-2">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {checkoutIntents.map((intent) => (
                                    <tr key={intent.id} className="border-t border-gray-200">
                                            <td className="p-2">
                                                <span className={`rounded border px-2 py-1 text-[11px] font-semibold ${statusTone(intent.status)}`}>
                                                    {intent.status}
                                                </span>
                                            </td>
                                            <td className="p-2">{intent.plan}</td>
                                            <td className="p-2">{intent.user?.email || intent.user?.full_name || intent.user?.email || '—'}</td>
                                            <td className="p-2">{Number(intent.amount).toLocaleString('vi-VN')}</td>
                                            <td className="p-2 max-w-[260px] truncate">{intent.transfer_content}</td>
                                            <td className="p-2 whitespace-nowrap">{fmtDate(intent.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-500 mb-2">Webhook events (latest)</h4>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 uppercase text-gray-500">
                                    <tr>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Transaction</th>
                                        <th className="p-2">Transfer content</th>
                                        <th className="p-2">Error</th>
                                        <th className="p-2">Received</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {webhookEvents.map((event) => (
                                        <tr key={event.id} className="border-t border-gray-200">
                                            <td className="p-2">
                                                <span className={`rounded border px-2 py-1 text-[11px] font-semibold ${statusTone(event.status)}`}>
                                                    {event.status}
                                                </span>
                                            </td>
                                            <td className="p-2">{event.provider_transaction_id || '—'}</td>
                                            <td className="p-2 max-w-[220px] truncate">{event.transfer_content || '—'}</td>
                                            <td className="p-2 max-w-[220px] truncate text-red-700">{event.error_message || '—'}</td>
                                            <td className="p-2 whitespace-nowrap">{fmtDate(event.received_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold uppercase tracking-[0.1em] text-gray-500 mb-2">Email outbox</h4>
                        <div className="overflow-x-auto rounded-lg border border-gray-200">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-50 uppercase text-gray-500">
                                    <tr>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Recipient</th>
                                        <th className="p-2">Attempts</th>
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
                                            <td className="p-2 max-w-[220px] truncate text-red-700">{item.last_error || '—'}</td>
                                            <td className="p-2">
                                                <button
                                                    type="button"
                                                    className="btn-secondary text-[11px] py-1 px-2"
                                                    disabled={busyId === item.id}
                                                    onClick={() => void retryOutbox(item.id)}
                                                >
                                                    Retry
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
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
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <button
                                        type="button"
                                        disabled={busyId === row.id}
                                        onClick={() => void approve(row.id)}
                                        className="btn-primary text-xs py-2 px-3"
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
                                        className="form-input text-sm flex-1 min-w-[160px]"
                                    />
                                    <button
                                        type="button"
                                        disabled={busyId === row.id}
                                        onClick={() => void reject(row.id)}
                                        className="btn-secondary text-xs py-2 px-3"
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
