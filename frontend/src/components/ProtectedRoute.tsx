import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

interface Props {
    children: React.ReactNode;
    requiredRole?: 'trainer' | 'athlete' | 'admin';
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

    if (requiredRole && user?.user_type !== requiredRole) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
