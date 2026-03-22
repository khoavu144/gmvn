/**
 * Node/pg often surface connection failures as AggregateError with an empty `.message`.
 */
export const formatCliError = (error: unknown): string => {
    if (typeof error === 'string') {
        return error;
    }
    if (!(error instanceof Error)) {
        try {
            return JSON.stringify(error);
        } catch {
            return String(error);
        }
    }
    const msg = error.message?.trim();
    if (msg) {
        return msg;
    }
    const agg = error as Error & { errors?: unknown[] };
    if (Array.isArray(agg.errors) && agg.errors.length > 0) {
        return agg.errors
            .map((sub) => {
                if (sub instanceof Error && sub.message) {
                    return sub.message;
                }
                return String(sub);
            })
            .join('; ');
    }
    const cause = (error as Error & { cause?: unknown }).cause;
    if (cause instanceof Error && cause.message) {
        return cause.message;
    }
    return error.name || '(no message)';
};
