import React, { useCallback, useEffect, useState } from 'react';
import apiClient from '../services/api';
import { AdminLoadingBlock, adminEmptyStateClassName } from './admin/adminPanelPrimitives';

type Row = {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
};

export default function AdminUsersPanel() {
    const [users, setUsers] = useState<Row[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [appliedSearch, setAppliedSearch] = useState('');
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setErr(null);
        try {
            const res = await apiClient.get('/dashboard/admin/users', {
                params: {
                    page,
                    search: appliedSearch.trim() || undefined,
                    role: role || undefined,
                },
            });
            setUsers(res.data.users || []);
            setTotalPages(res.data.pagination?.pages ?? 1);
        } catch (e: unknown) {
            const msg = e && typeof e === 'object' && 'response' in e
                ? String((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Lỗi tải')
                : 'Lỗi tải';
            setErr(msg);
        } finally {
            setLoading(false);
        }
    }, [page, appliedSearch, role]);

    useEffect(() => {
        void load();
    }, [load]);

    const submitSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setAppliedSearch(searchInput);
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <form onSubmit={submitSearch} className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="form-label text-xs">Tìm theo tên / email</label>
                    <input
                        className="form-input"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Nguyễn Văn…"
                    />
                </div>
                <div className="w-40">
                    <label className="form-label text-xs">Vai trò</label>
                    <select
                        className="form-input"
                        value={role}
                        onChange={(e) => {
                            setRole(e.target.value);
                            setPage(1);
                        }}
                    >
                        <option value="">Tất cả</option>
                        <option value="user">user</option>
                        <option value="athlete">athlete</option>
                        <option value="trainer">trainer</option>
                        <option value="gym_owner">gym_owner</option>
                        <option value="admin">admin</option>
                    </select>
                </div>
                <button type="submit" className="btn-primary">Tìm</button>
            </form>

            {err && <div className="text-sm text-red-600">{err}</div>}
            {loading ? (
                <AdminLoadingBlock />
            ) : err ? null : users.length === 0 ? (
                <div className={adminEmptyStateClassName}>
                    <p className="font-medium text-gray-800">Không có người dùng khớp bộ lọc</p>
                    <p className="mt-1 text-xs text-gray-500">Thử bỏ tìm kiếm hoặc chọn vai trò khác.</p>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 text-xs font-bold uppercase tracking-wide text-gray-500">
                                <tr>
                                    <th className="p-3">Tên</th>
                                    <th className="p-3">Email</th>
                                    <th className="p-3">Vai trò</th>
                                    <th className="p-3">Tạo lúc</th>
                                    <th className="p-3">ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-t border-gray-200">
                                        <td className="p-3 font-medium">{u.full_name}</td>
                                        <td className="p-3">{u.email}</td>
                                        <td className="p-3">{u.role}</td>
                                        <td className="p-3 text-xs">{new Date(u.created_at).toLocaleString('vi')}</td>
                                        <td className="p-3 font-mono text-xs text-gray-500">{u.id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            className="btn-secondary text-xs"
                        >
                            Trước
                        </button>
                        <span className="text-gray-500">Trang {page} / {totalPages}</span>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((p) => p + 1)}
                            className="btn-secondary text-xs"
                        >
                            Sau
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
