import { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';

export interface CoachApplication {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    specialties: string[] | null;
    headline: string;
    base_price_monthly: number | null;
    motivation: string;
    certifications_note: string | null;
    rejection_reason: string | null;
    created_at: string;
}

export interface CoachApplicationInput {
    specialties: string[];
    headline: string;
    base_price_monthly?: number | null;
    motivation: string;
    certifications_note?: string | null;
}

interface UseCoachApplicationReturn {
    application: CoachApplication | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string | null;
    submit: (input: CoachApplicationInput) => Promise<boolean>;
    refresh: () => void;
}

export function useCoachApplication(): UseCoachApplicationReturn {
    const [application, setApplication] = useState<CoachApplication | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchApplication = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiClient.get('/coach-applications/mine');
            setApplication(res.data.application ?? null);
        } catch {
            // 404 = no application yet, not an error
            setApplication(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { fetchApplication(); }, [fetchApplication]);

    const submit = useCallback(async (input: CoachApplicationInput): Promise<boolean> => {
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await apiClient.post('/coach-applications', input);
            setApplication(res.data.application);
            return true;
        } catch (err: any) {
            const msg = err?.response?.data?.error ?? 'Lỗi khi nộp đơn. Vui lòng thử lại.';
            setError(msg);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, []);

    return { application, isLoading, isSubmitting, error, submit, refresh: fetchApplication };
}
