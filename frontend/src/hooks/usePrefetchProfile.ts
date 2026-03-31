import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function usePrefetchProfile() {
    const queryClient = useQueryClient();

    const prefetchCoach = useCallback((identifier: string) => {
        if (!identifier) return;
        queryClient.prefetchQuery({
            queryKey: ['coachDetail', identifier],
            queryFn: async () => {
                const isUuid = UUID_PATTERN.test(identifier);
                const trainerRes = isUuid
                    ? await apiClient.get(`/users/trainers/${identifier}`)
                    : await apiClient.get(`/users/trainers/slug/${identifier}`);

                const trainer = trainerRes.data.data;
                const trainerId = trainer?.id;

                if (trainerId) {
                    void apiClient.get(`/profiles/trainer/${trainerId}/full`).catch(() => undefined);
                }

                return trainer;
            },
            staleTime: 5 * 60 * 1000 // 5 minutes cache
        });
    }, [queryClient]);

    const prefetchAthlete = useCallback((identifier: string) => {
        if (!identifier) return;
        void apiClient
            .get(`/profiles/slug/${identifier}`)
            .catch(async () => {
                if (!UUID_PATTERN.test(identifier)) return undefined;
                return apiClient.get(`/profiles/trainer/${identifier}/full`).catch(() => undefined);
            });
    }, []);

    return { prefetchCoach, prefetchAthlete };
}
