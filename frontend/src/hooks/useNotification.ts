import { useState, useCallback } from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

/**
 * Hook for managing toast notifications
 * Usage: const { notify, notifications, removeNotification } = useNotification();
 */
export const useNotification = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const notify = useCallback((
        message: string,
        type: NotificationType = 'info',
        duration: number = 3000
    ) => {
        const id = `${Date.now()}-${Math.random()}`;
        const notification: Notification = { id, type, message, duration };

        setNotifications(prev => [...prev, notification]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }, [removeNotification]);

    return { notify, notifications, removeNotification };
};

/**
 * Hook for handling async operations with loading and error states
 */
export const useAsync = <T,>(
    asyncFunction: () => Promise<T>
) => {
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(async () => {
        setStatus('pending');
        setData(null);
        setError(null);

        try {
            const response = await asyncFunction();
            setData(response);
            setStatus('success');
            return response;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            setStatus('error');
            throw error;
        }
    }, [asyncFunction]);

    return { execute, status, data, error };
};

/**
 * Hook for debounced search
 */
export const useDebouncedSearch = (
    searchFn: (query: string) => Promise<any[]>,
    delay: number = 300
) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const timeoutRef = useCallback((callback: () => void) => {
        const timeout = setTimeout(callback, delay);
        return () => clearTimeout(timeout);
    }, [delay]);

    const search = useCallback((q: string) => {
        setQuery(q);
        setLoading(true);
        setError(null);

        const cleanup = timeoutRef(async () => {
            if (!q.trim()) {
                setResults([]);
                setLoading(false);
                return;
            }

            try {
                const data = await searchFn(q);
                setResults(data);
            } catch (err) {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        });

        return cleanup;
    }, [searchFn, timeoutRef]);

    return { query, results, loading, error, search };
};

/**
 * Hook for pagination
 */
export const usePagination = <T,>(items: T[], itemsPerPage: number = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = items.slice(startIndex, endIndex);

    const goToPage = useCallback((page: number) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    }, [totalPages]);

    const nextPage = useCallback(() => {
        goToPage(currentPage + 1);
    }, [currentPage, goToPage]);

    const prevPage = useCallback(() => {
        goToPage(currentPage - 1);
    }, [currentPage, goToPage]);

    return {
        currentPage,
        totalPages,
        currentItems,
        goToPage,
        nextPage,
        prevPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
    };
};
