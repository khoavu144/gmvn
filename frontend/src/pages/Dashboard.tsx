import { lazy, Suspense, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import apiClient from '../services/api';
import type { OverviewData } from './dashboard/AthleteDashboard';

const CoachDashboard = lazy(() => import('./dashboard/CoachDashboard'));
const AthleteDashboard = lazy(() => import('./dashboard/AthleteDashboard'));
const UserDashboard = lazy(() => import('./dashboard/UserDashboard'));
const AdminDashboard = lazy(() => import('./dashboard/AdminDashboard'));

function DashboardRoleFallback() {
    return (
        <div
            className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50/80"
            aria-busy="true"
            aria-live="polite"
        >
            <div
                className="h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900"
                aria-hidden
            />
        </div>
    );
}

export default function Dashboard() {
    const user = useSelector((state: RootState) => state.auth.user);
    const navigate = useNavigate();
    const [overview, setOverview] = useState<OverviewData>({});

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        if (user.user_type === 'trainer') {
            apiClient.get('/dashboard/overview')
                .then(res => setOverview(res.data.overview || {}))
                .catch(() => { });
        } else if (user.user_type === 'athlete') {
            apiClient.get('/dashboard/athlete/overview')
                .then(res => setOverview(res.data.overview || {}))
                .catch(() => { });
        }
    }, [user, navigate]);

    if (!user) return null;

    const roleLabel: Record<string, string> = {
        trainer: 'Huấn luyện viên', athlete: 'Vận động viên', gym_owner: 'Chủ phòng tập', admin: 'Quản trị viên', user: 'Người dùng',
    };

    return (
        <div className="page-shell-muted">
            <Helmet>
                <title>Bảng điều khiển — GYMERVIET</title>
                <meta name="description" content="Quản lý hồ sơ, tin nhắn, và các tính năng nâng cao trên GYMERVIET." />
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <div className="bg-white border-b border-gray-200">
                <div className="page-container gv-pad-y-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="page-kicker mb-2">
                                Không gian làm việc {roleLabel[user.user_type] ?? 'của bạn'}
                            </p>
                            <h1 className="page-title">
                                Xin chào, {user.full_name.split(' ').pop()}
                            </h1>
                            <p className="page-description">
                                Tổng hợp các thao tác quan trọng nhất cho tài khoản {roleLabel[user.user_type]?.toLowerCase() ?? 'người dùng'} của bạn.
                            </p>
                        </div>
                        <Link
                            to="/profile"
                            className="btn-secondary self-start sm:self-auto"
                        >
                            Cập nhật hồ sơ →
                        </Link>
                    </div>
                </div>
            </div>

            <div className="page-container gv-pad-y">
                <Suspense fallback={<DashboardRoleFallback />}>
                    {user.user_type === 'trainer' && <CoachDashboard overview={overview} />}
                    {user.user_type === 'athlete' && <AthleteDashboard overview={overview} />}
                    {user.user_type === 'user' && <UserDashboard />}
                    {user.user_type === 'admin' && <AdminDashboard />}
                </Suspense>
                {user.user_type === 'gym_owner' && <Navigate to="/gym-owner" replace />}
            </div>
        </div>
    );
}
