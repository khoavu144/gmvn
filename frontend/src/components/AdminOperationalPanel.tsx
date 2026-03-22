import { useCallback, useEffect, useState } from 'react';
import apiClient from '../services/api';
import { AdminLoadingBlock } from './admin/adminPanelPrimitives';

type Health = {
    success: boolean;
    status: string;
    timestamp: string;
    db: { users: number; gyms: number };
    redis: { connected: boolean };
};

type AuditRow = {
    id: string;
    admin_id: string;
    action: string;
    action_category: string;
    target_user_id: string | null;
    target_resource_id: string | null;
    reason: string;
    result: string;
    timestamp: string;
};

export default function AdminOperationalPanel() {
    const [health, setHealth] = useState<Health | null>(null);
    const [pending, setPending] = useState<AuditRow[]>([]);
    const [logs, setLogs] = useState<AuditRow[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [platformSubs, setPlatformSubs] = useState<any[]>([]);
    const [platformSubsTotal, setPlatformSubsTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
    const [busyId, setBusyId] = useState<string | null>(null);
    const [formImports, setFormImports] = useState<any[]>([]);

    const load = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const [h, p, l, r, t, s, f] = await Promise.all([
                apiClient.get('/admin/health'),
                apiClient.get('/admin/pending-approvals'),
                apiClient.get('/admin/audit-logs'),
                apiClient.get('/admin/reports'),
                apiClient.get('/admin/transactions'),
                apiClient.get('/platform/admin/subscriptions', { params: { page: 1, limit: 50 } }),
                apiClient.get('/admin/form-imports', { params: { limit: 40 } }),
            ]);
            setHealth(h.data);
            setPending(p.data.requests || []);
            setLogs(l.data.logs || []);
            setReports(r.data.reports || []);
            setTransactions(t.data.transactions || []);
            setPlatformSubs(s.data.subscriptions || []);
            setPlatformSubsTotal(s.data.total ?? 0);
            setFormImports(f.data.logs || []);
        } catch (e: unknown) {
            const msg = e && typeof e === 'object' && 'response' in e
                ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Lỗi tải dữ liệu')
                : 'Lỗi tải dữ liệu';
            setErr(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const approve = async (logId: string) => {
        setBusyId(logId);
        try {
            await apiClient.post(`/admin/approvals/${logId}/approve`);
            await load();
        } catch (e: unknown) {
            const m = e && typeof e === 'object' && 'response' in e
                ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Thất bại')
                : 'Thất bại';
            alert(m);
        } finally {
            setBusyId(null);
        }
    };

    const reject = async (logId: string) => {
        setBusyId(logId);
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
        } catch (e: unknown) {
            const m = e && typeof e === 'object' && 'response' in e
                ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Thất bại')
                : 'Thất bại';
            alert(m);
        } finally {
            setBusyId(null);
        }
    };

    if (loading && !health) {
        return <AdminLoadingBlock />;
    }

    return (
        <div className="space-y-10">
            {err && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3">{err}</div>
            )}

            <section>
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
                    Sức khỏe hệ thống
                </h3>
                {health ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="text-gray-500 text-xs uppercase font-bold">Trạng thái</div>
                            <div className="font-bold mt-1">{health.status}</div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="text-gray-500 text-xs uppercase font-bold">Users (DB)</div>
                            <div className="font-bold mt-1">{health.db?.users ?? '—'}</div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="text-gray-500 text-xs uppercase font-bold">Gyms (DB)</div>
                            <div className="font-bold mt-1">{health.db?.gyms ?? '—'}</div>
                        </div>
                        <div className="rounded-lg border border-gray-200 p-4">
                            <div className="text-gray-500 text-xs uppercase font-bold">Redis</div>
                            <div className="font-bold mt-1">{health.redis?.connected ? 'OK' : 'Lỗi / degraded'}</div>
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
                    Import Google Form
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                    Webhook: <code className="font-mono bg-gray-50 px-1">POST /api/v1/integrations/google-form/ingest</code>
                    — xem <code className="font-mono">backend/docs/GOOGLE_FORM_APPS_SCRIPT.md</code>. Export slug:{' '}
                    <code className="font-mono">GET /api/v1/admin/catalog-export</code>
                </p>
                <div className="overflow-x-auto max-h-[280px] overflow-y-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs text-left">
                        <thead className="sticky top-0 bg-gray-50 uppercase text-gray-500">
                            <tr>
                                <th className="p-2">Thời gian</th>
                                <th className="p-2">Trạng thái</th>
                                <th className="p-2">Email</th>
                                <th className="p-2">Flow</th>
                                <th className="p-2">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formImports.map((row) => (
                                <tr key={row.id} className="border-t border-gray-200">
                                    <td className="p-2 whitespace-nowrap">{row.created_at ? new Date(row.created_at).toLocaleString('vi') : '—'}</td>
                                    <td className="p-2">{row.status}</td>
                                    <td className="p-2">{row.email}</td>
                                    <td className="p-2">{row.flow}</td>
                                    <td className="p-2 max-w-[200px] truncate" title={row.error_message || row.outcome_detail || ''}>
                                        {row.error_message || row.outcome_detail || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
                    Duyệt hành động rủi ro cao
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                    Admin khác với người tạo yêu cầu mới được phê duyệt.
                </p>
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
                                {row.target_user_id && (
                                    <div className="text-xs">Target user: {row.target_user_id}</div>
                                )}
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
                                        onChange={(e) => setRejectReason((p) => ({ ...p, [row.id]: e.target.value }))}
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

            <section>
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
                    Gói nền tảng (đang active)
                </h3>
                <p className="text-xs text-gray-500 mb-2">Tổng: {platformSubsTotal}</p>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="p-3">Gói</th>
                                <th className="p-3">User</th>
                                <th className="p-3">Email</th>
                                <th className="p-3">Bắt đầu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {platformSubs.map((s) => (
                                <tr key={s.id} className="border-t border-gray-200">
                                    <td className="p-3 font-medium">{s.plan}</td>
                                    <td className="p-3">{s.user?.full_name ?? '—'}</td>
                                    <td className="p-3 text-gray-500">{s.user?.email ?? '—'}</td>
                                    <td className="p-3 text-xs">{s.started_at ? new Date(s.started_at).toLocaleString('vi') : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
                    Nhật ký audit (gần nhất)
                </h3>
                <div className="overflow-x-auto max-h-[360px] overflow-y-auto rounded-lg border border-gray-200">
                    <table className="w-full text-xs text-left">
                        <thead className="sticky top-0 bg-gray-50 uppercase text-gray-500">
                            <tr>
                                <th className="p-2">Thời gian</th>
                                <th className="p-2">Hành động</th>
                                <th className="p-2">Kết quả</th>
                                <th className="p-2">Lý do</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.slice(0, 80).map((row) => (
                                <tr key={row.id} className="border-t border-gray-200">
                                    <td className="p-2 whitespace-nowrap">{new Date(row.timestamp).toLocaleString('vi')}</td>
                                    <td className="p-2">{row.action}</td>
                                    <td className="p-2">{row.result}</td>
                                    <td className="p-2 max-w-[240px] truncate" title={row.reason}>{row.reason}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
                    Báo cáo chương trình
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="p-3">Lý do</th>
                                <th className="p-3">Trạng thái</th>
                                <th className="p-3">Chương trình</th>
                                <th className="p-3">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((rep) => (
                                <tr key={rep.id} className="border-t border-gray-200">
                                    <td className="p-3">{rep.reason}</td>
                                    <td className="p-3">{rep.status}</td>
                                    <td className="p-3">{rep.program?.name ?? rep.program_id}</td>
                                    <td className="p-3 text-xs">{rep.reported_at ? new Date(rep.reported_at).toLocaleString('vi') : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section>
                <h3 className="text-lg font-black uppercase tracking-tight border-b border-gray-200 pb-2 mb-4">
                    Giao dịch tài chính
                </h3>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="p-3">Trạng thái</th>
                                <th className="p-3">Tổng</th>
                                <th className="p-3">Creator</th>
                                <th className="p-3">Người mua</th>
                                <th className="p-3">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="border-t border-gray-200">
                                    <td className="p-3">{tx.status}</td>
                                    <td className="p-3">{String(tx.gross_amount)}</td>
                                    <td className="p-3 text-xs">{tx.creator?.full_name ?? tx.creator_id}</td>
                                    <td className="p-3 text-xs">{tx.buyer?.full_name ?? tx.buyer_id}</td>
                                    <td className="p-3 text-xs">{tx.transaction_date ? new Date(tx.transaction_date).toLocaleString('vi') : '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
