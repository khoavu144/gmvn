import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import type { RootState } from '../store/store';
import apiClient from '../services/api';

import CoachDashboard from './dashboard/CoachDashboard';
import AthleteDashboard from './dashboard/AthleteDashboard';
import type { OverviewData } from './dashboard/AthleteDashboard';
import UserDashboard from './dashboard/UserDashboard';
import AdminDashboard from './dashboard/AdminDashboard';

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
        trainer: 'Coach', athlete: 'Athlete', gym_owner: 'Chủ Gym', admin: 'Admin', user: 'Người dùng',
    };

    return (
        <div className="page-shell-muted">
            <Helmet>
                <title>Bảng điều khiển — GymViet</title>
                <meta name="description" content="Quản lý hồ sơ, tin nhắn, và các tính năng nâng cao trên GYMERVIET." />
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>
            <div className="bg-white border-b border-[color:var(--mk-line)]">
                <div className="page-container py-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="page-kicker mb-2">
                                Không gian làm việc {roleLabel[user.user_type] ?? 'của bạn'}
                            </p>
                            <h1 className="page-title">
                                Xin chào, {user.full_name.split(' ').pop()} 👋
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

            <div className="page-container py-8">
                {user.user_type === 'trainer' && <CoachDashboard overview={overview} />}
                {user.user_type === 'athlete' && <AthleteDashboard overview={overview} />}
                {user.user_type === 'user' && <UserDashboard />}
                {user.user_type === 'admin' && <AdminDashboard />}
                {user.user_type === 'gym_owner' && <Navigate to="/gym-owner" replace />}
            </div>
        </div>
    );
}
