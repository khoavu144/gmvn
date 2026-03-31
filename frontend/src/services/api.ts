import axios from 'axios';

const REQUEST_TIMEOUT_MS = 15_000;

const normalizeApiUrl = (rawUrl: string) => {
    if (rawUrl === '/api/v1') {
        return rawUrl;
    }

    let normalized = rawUrl.replace(/\/$/, '');
    if (!normalized.endsWith('/api/v1')) {
        normalized += '/api/v1';
    }

    return normalized;
};

// 1) VITE_API_URL from build env
// 2) Same-origin fallback for production if VITE_API_URL is missing
// 3) Localhost strictly for local development
const RAW_API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api/v1' : 'http://localhost:3001/api/v1');
const API_URL = normalizeApiUrl(RAW_API_URL);

let refreshTokenPromise: Promise<string> | null = null;

const clearStoredTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

const isAuthEndpoint = (url?: string) => {
    if (!url) {
        return false;
    }

    return ['/auth/login', '/auth/register', '/auth/refresh'].some((path) => url.includes(path));
};

export const apiClient = axios.create({
    baseURL: API_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config as any;
        const refreshToken = localStorage.getItem('refresh_token');

        if (
            error.response?.status === 401 &&
            refreshToken &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthEndpoint(originalRequest.url)
        ) {
            originalRequest._retry = true;

            try {
                if (!refreshTokenPromise) {
                    refreshTokenPromise = axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    }).then(res => {
                        const newAccessToken = res.data.data.access_token;
                        const newRefreshToken = res.data.data.refresh_token;

                        localStorage.setItem('access_token', newAccessToken);
                        if (newRefreshToken) {
                            localStorage.setItem('refresh_token', newRefreshToken);
                        }

                        return newAccessToken;
                    }).catch(err => {
                        clearStoredTokens();
                        if (window.location.pathname !== '/login') {
                            window.location.href = '/login';
                        }
                        throw err;
                    }).finally(() => {
                        refreshTokenPromise = null;
                    });
                }

                const newAccessToken = await refreshTokenPromise;
                originalRequest.headers = originalRequest.headers ?? {};
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return apiClient(originalRequest);
            } catch {
                return Promise.reject(error);
            }
        }

        if (error.response?.status === 401) {
            clearStoredTokens();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        if (!error.response && error.code === 'ECONNABORTED') {
            error.message = 'Không thể kết nối. Vui lòng thử lại.';
        }

        return Promise.reject(error);
    }
);

export default apiClient;
