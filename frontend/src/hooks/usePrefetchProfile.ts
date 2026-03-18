import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';

export function usePrefetchProfile() {
    const queryClient = useQueryClient();

    const prefetchCoach = useCallback((identifier: string) => {
        if (!identifier) return;
        queryClient.prefetchQuery({
            queryKey: ['coachDetail', identifier],
            queryFn: () => apiClient.get(`/users/trainers/${identifier}`).then(res => res.data.data),
            staleTime: 5 * 60 * 1000 // 5 minutes cache
        });
    }, [queryClient]);

    const prefetchAthlete = useCallback((identifier: string) => {
        if (!identifier) return;
        // Athlete profile uses Redux thunk which fetches from '/users/trainers/profile/'
        // By using queryClient to cache it here, we at least warm up the browser/network 
        // if API supports caching, though Redux will duplicate the call.
        // For actual client-side cache, CoachDetailPage uses queryClient directly.
        apiClient.get(`/users/trainers/profile/${identifier}`).catch(() => {});
    }, []);

    return { prefetchCoach, prefetchAthlete };
}
