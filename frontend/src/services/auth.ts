import apiClient from './api';

interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: {
        id: string;
        email: string;
        full_name: string;
        user_type: 'user' | 'athlete' | 'trainer' | 'admin' | 'gym_owner';
        avatar_url: string | null;
        created_at: string;
    };
}

interface RefreshResponse {
    access_token: string;
    refresh_token: string;
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
        user_type: 'user' | 'athlete' | 'trainer' | 'gym_owner';
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

    async refreshToken(refreshToken: string): Promise<RefreshResponse> {
        const response = await apiClient.post<
            ApiSuccessResponse<RefreshResponse>
        >('/auth/refresh', { refresh_token: refreshToken });
        return response.data.data;
    },

    async logout(refreshToken?: string): Promise<void> {
        await apiClient.post('/auth/logout', {
            refresh_token: refreshToken,
        });
    },

    async getProfile() {
        const response = await apiClient.get('/auth/me');
        return response.data.data;
    },
};
