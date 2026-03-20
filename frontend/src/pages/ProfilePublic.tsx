import { useParams, Navigate } from 'react-router-dom';

/**
 * Legacy route: /profile/public/:trainerId
 * Redirect to the canonical coach profile page: /coaches/:trainerId
 */
export default function ProfilePublic() {
    const { trainerId } = useParams<{ trainerId: string }>();
    if (!trainerId) return <Navigate to="/coaches" replace />;
    return <Navigate to={`/coaches/${trainerId}`} replace />;
}
