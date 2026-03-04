import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface Props {
    children: React.ReactNode;
    requiredRole?: string | string[];
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
    const { isAuthenticated, user, accessToken } = useSelector(
        (state: RootState) => state.auth
    );
    const location = useLocation();

    // Đang restore auth (có token nhưng user chưa load)
    if (accessToken && !user) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!roles.includes(user.user_type)) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    if (user && user.user_type === 'gym_owner') {
        const isGymOwnerRoute = location.pathname.startsWith('/gym-owner');
        const isRegisteringRoute = location.pathname === '/gym-owner/register';

        if (location.pathname === '/dashboard') {
            return <Navigate to="/gym-owner" replace />;
        }

        if (isGymOwnerRoute && !isRegisteringRoute) {
            if (user.gym_owner_status === 'pending_review') {
                return <Navigate to="/gym-owner/register?step=3" replace />; // or a dedicated pending page
            }
            if (user.gym_owner_status !== 'approved') {
                return <Navigate to="/gym-owner/register" replace />;
            }
        }

        if (isRegisteringRoute && user.gym_owner_status === 'approved') {
            return <Navigate to="/gym-owner" replace />;
        }
    }

    return <>{children}</>;
}
