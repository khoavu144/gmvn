import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import type { PlanLimits } from './usePlatformPlan.types';

export type PlatformPlan = 'free';

interface PlatformPlanState {
    plan: PlatformPlan;
    expires_at: string | null;
    limits: PlanLimits;
    billing_enabled: boolean;
    isLoading: boolean;
    error: string | null;
}

const DEFAULT_LIMITS: PlanLimits = {
    maxPrograms: 999999,
    maxClients: 999999,
    maxBranches: 999999,
    maxGymTrainers: 999999,
    prioritySearch: true,
    badge: true,
    customShareCard: true,
    unlimitedProgressPhotos: true,
    fullRelationshipHistory: true,
    coachComparison: true,
};

export function usePlatformPlan(): PlatformPlanState {
    const [state, setState] = useState<PlatformPlanState>({
        plan: 'free',
        expires_at: null,
        limits: DEFAULT_LIMITS,
        billing_enabled: false,
        isLoading: true,
        error: null,
    });

    const loadPlan = useCallback(async () => {
        try {
            const res = await apiClient.get('/platform/plan/me');
            setState({
                plan: 'free',
                expires_at: res.data.expires_at,
                limits: res.data.limits ?? DEFAULT_LIMITS,
                billing_enabled: false,
                isLoading: false,
                error: null,
            });
        } catch {
            setState((prev) => ({
                ...prev,
                plan: 'free',
                billing_enabled: false,
                isLoading: false,
            }));
        }
    }, []);

    /* eslint-disable react-hooks/set-state-in-effect -- plan fetch kicks async loadPlan; state updates occur after await */
    useEffect(() => {
        void loadPlan();
    }, [loadPlan]);
    /* eslint-enable react-hooks/set-state-in-effect */

    return state;
}

export type { PlatformPlanState, PlanLimits };
