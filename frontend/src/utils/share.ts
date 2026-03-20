import apiClient from '../services/api';

const ABSOLUTE_URL_RE = /^https?:\/\//i;

function trimTrailingSlash(value: string): string {
    return value.replace(/\/$/, '');
}

export function getShareBaseUrl(): string {
    const apiBaseUrl = apiClient.defaults.baseURL ?? '/api/v1';

    if (ABSOLUTE_URL_RE.test(apiBaseUrl)) {
        return trimTrailingSlash(new URL(apiBaseUrl).origin);
    }

    return trimTrailingSlash(window.location.origin);
}

export function buildProfileShareUrl(kind: 'coach' | 'athlete', identifier: string): string {
    const encodedIdentifier = encodeURIComponent(identifier);
    return `${getShareBaseUrl()}/share/${kind}/${encodedIdentifier}`;
}
