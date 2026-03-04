import api from './api';
import type { User, ApiResponse } from '../types';

export interface UpdateProfileData {
    full_name?: string;
    avatar_url?: string | null;
    bio?: string | null;
    height_cm?: number | null;
    current_weight_kg?: number | null;
    experience_level?: string | null;
    specialties?: string[] | null;
    base_price_monthly?: number | null;
}

export const userService = {
    updateProfile: async (data: UpdateProfileData): Promise<User> => {
        const response = await api.put<ApiResponse<User>>('/users/profile', data);
        return response.data.data!;
    },
    searchCoaches: async (search?: string): Promise<User[]> => {
        const response = await api.get<ApiResponse<{ trainers: User[] }>>('/users/trainers', {
            params: { search, limit: 50 },
        });
        return response.data.data!.trainers;
    },
};
