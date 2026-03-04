import apiClient from './api';

interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        email: string;
        full_name: string;
        user_type: 'athlete' | 'trainer';
        avatar_url: string | null;
        created_at: string;
    };
}

interface ApiSuccessResponse<T> {
    success: true;
    data: T;
}

export const authApi = {
    async register(data: {
        email: string;
        password: string;
        full_name: string;
        user_type: 'athlete' | 'trainer';
    }): Promise<AuthResponse> {
        const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
            '/auth/register',
            data
        );
        return response.data.data;
    },

    async login(data: {
        email: string;
        password: string;
    }): Promise<AuthResponse> {
        const response = await apiClient.post<ApiSuccessResponse<AuthResponse>>(
            '/auth/login',
            data
        );
        return response.data.data;
    },

    async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
        const response = await apiClient.post<
            ApiSuccessResponse<{ access_token: string }>
        >('/auth/refresh', { refresh_token: refreshToken });
        return response.data.data;
    },

    async logout(): Promise<void> {
        await apiClient.post('/auth/logout');
    },

    async getProfile() {
        const response = await apiClient.get('/auth/me');
        return response.data.data;
    },
};
