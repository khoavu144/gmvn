import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// Auto-correct missing /api/v1 in production configs
if (API_URL) {
    API_URL = API_URL.replace(/\/$/, ''); // remove trailing slash if any
    if (!API_URL.endsWith('/api/v1')) {
        API_URL += '/api/v1';
    }
}
export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token refresh on 401
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Thử refresh token trước
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken && !error.config._retry) {
                error.config._retry = true;
                try {
                    const res = await axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });
                    const newToken = res.data.data.access_token;
                    localStorage.setItem('access_token', newToken);
                    error.config.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(error.config);
                } catch {
                    // Refresh cũng fail → logout hoàn toàn
                }
            }
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;
