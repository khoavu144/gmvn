import api from './api';
import type { User, ApiResponse } from '../types';

export interface GetTrainersResponse {
    trainers: User[];
    total: number;
    page: number;
    totalPages: number;
}

export interface TrainerFilters {
    search?: string;
    specialty?: string;
    priceMin?: number;
    priceMax?: number;
    city?: string;
    sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'views_desc';
    user_type?: 'trainer' | 'athlete';
}

export const trainerService = {
    getTrainers: async (page = 1, limit = 10, filters: TrainerFilters = {}): Promise<GetTrainersResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (filters.search) params.append('search', filters.search);
        if (filters.specialty) params.append('specialty', filters.specialty);
        if (filters.priceMin !== undefined) params.append('priceMin', String(filters.priceMin));
        if (filters.priceMax !== undefined) params.append('priceMax', String(filters.priceMax));
        if (filters.city) params.append('city', filters.city);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.user_type) params.append('user_type', filters.user_type);

        const response = await api.get<ApiResponse<GetTrainersResponse>>(`/users/trainers?${params.toString()}`);
        return response.data.data!;
    },

    getTrainerDetail: async (id: string): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(`/users/trainers/${id}`);
        return response.data.data!;
    },

    searchTrainers: async (params: { search: string; page?: number; limit?: number }) => {
        const response = await api.get<ApiResponse<GetTrainersResponse>>('/users/trainers', { params });
        return {
            success: response.data.success,
            trainers: response.data.data?.trainers || [],
            total: response.data.data?.total || 0
        };
    }
};
