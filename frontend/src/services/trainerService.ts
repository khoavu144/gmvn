import api from './api';
import type { User, ApiResponse } from '../types';

export interface GetTrainersResponse {
    trainers: User[];
    total: number;
    page: number;
    totalPages: number;
}

export const trainerService = {
    getTrainers: async (page = 1, limit = 10, search?: string): Promise<GetTrainersResponse> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        if (search) {
            params.append('search', search);
        }

        const response = await api.get<ApiResponse<GetTrainersResponse>>(`/users/trainers?${params.toString()}`);
        return response.data.data!;
    },

    getTrainerDetail: async (id: string): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(`/users/trainers/${id}`);
        return response.data.data!;
    },
};
