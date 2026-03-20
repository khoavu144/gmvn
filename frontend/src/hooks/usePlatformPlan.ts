import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

export type PlatformPlan = 'free' | 'coach_pro' | 'coach_elite' | 'athlete_premium' | 'gym_business';

export interface PlanLimits {
    maxPrograms: number;
    maxClients: number;
    maxBranches: number;
    maxGymTrainers: number;
    prioritySearch: boolean;
    badge: boolean;
    customShareCard: boolean;
    unlimitedProgressPhotos: boolean;
    fullSubscriptionHistory: boolean;
    coachComparison: boolean;
}


interface PlatformPlanState {
    plan: PlatformPlan;
    expires_at: string | null;
    limits: PlanLimits;
    billing_enabled: boolean;
    isLoading: boolean;
    error: string | null;
}

const DEFAULT_LIMITS: PlanLimits = {
    maxPrograms: 3,
    maxClients: 10,
    maxBranches: 1,
    maxGymTrainers: 5,
    prioritySearch: false,
    badge: false,
    customShareCard: false,
    unlimitedProgressPhotos: false,
    fullSubscriptionHistory: false,
    coachComparison: false,
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

    const fetch = useCallback(async () => {
        try {
            const res = await apiClient.get('/platform/plan/me');
            setState({
                plan: res.data.plan,
                expires_at: res.data.expires_at,
                limits: res.data.limits,
                billing_enabled: res.data.billing_enabled,
                isLoading: false,
                error: null,
            });
        } catch {
            setState(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    useEffect(() => { fetch(); }, [fetch]);

    return state;
}

export type { PlatformPlanState };
