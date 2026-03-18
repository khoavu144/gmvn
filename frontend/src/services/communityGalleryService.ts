import apiClient from './api';

export interface CommunityGalleryUser {
    id: string;
    full_name: string;
    avatar_url: string | null;
    slug: string | null;
    user_type: string;
}

export interface CommunityGalleryItem {
    id: string;
    image_url: string;
    caption: string | null;
    category: 'workout' | 'lifestyle' | 'transformation' | 'event' | 'gym_space' | 'portrait' | 'other';
    source: 'admin_upload' | 'trainer_gallery';
    is_featured: boolean;
    created_at: string;
    linked_user: CommunityGalleryUser | null;
}

export interface CommunityGalleryResponse {
    success: boolean;
    items: CommunityGalleryItem[];
    total: number;
    page: number;
    totalPages: number;
}

export interface CommunityGalleryStats {
    success: boolean;
    total_images: number;
    featured_images: number;
    total_contributors: number;
}

export const communityGalleryApiService = {
    // ── Public ──────────────────────────────────────────────────
    async getGallery(params?: { page?: number; limit?: number; category?: string }): Promise<CommunityGalleryResponse> {
        const response = await apiClient.get('/gallery', { params });
        return response.data;
    },

    async getStats(): Promise<CommunityGalleryStats> {
        const response = await apiClient.get('/gallery/stats');
        return response.data;
    },

    // ── Admin ───────────────────────────────────────────────────
    async adminGetGallery(params?: { page?: number; limit?: number }) {
        const response = await apiClient.get('/gallery/admin', { params });
        return response.data;
    },

    async adminCreateItem(data: Partial<CommunityGalleryItem>) {
        const response = await apiClient.post('/gallery/admin', data);
        return response.data;
    },

    async adminUpdateItem(id: string, data: Partial<CommunityGalleryItem>) {
        const response = await apiClient.put(`/gallery/admin/${id}`, data);
        return response.data;
    },

    async adminDeleteItem(id: string) {
        const response = await apiClient.delete(`/gallery/admin/${id}`);
        return response.data;
    },
};
