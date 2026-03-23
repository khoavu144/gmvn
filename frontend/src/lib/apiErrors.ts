export function extractApiErrorMessage(error: any, fallbackMessage: string) {
    const apiError = error?.response?.data?.error;

    if (typeof apiError === 'string' && apiError.trim()) {
        return apiError;
    }

    if (typeof apiError?.message === 'string' && apiError.message.trim()) {
        return apiError.message;
    }

    return fallbackMessage;
}
