import apiClient from './api';
import type { GymCenter, GymBranch, GymEvent, GymPricing, GymAmenity, GymEquipment } from '../types';

export const gymService = {
    // ── PUBLIC ──────────────────────────────────────────────

    async listGyms(params?: { search?: string; city?: string; page?: number; limit?: number; sort?: string }) {
        const response = await apiClient.get('/gyms', { params });
        return response.data; // { success, gyms, pagination }
    },

    async listMarketplaceGyms(params?: {
        search?: string;
        city?: string;
        district?: string;
        venue_type?: string;
        audience_tag?: string;
        positioning_tier?: string;
        sort?: string;
        page?: number;
        limit?: number;
    }) {
        const response = await apiClient.get('/gyms/marketplace', { params });
        return response.data; // { success, gyms, pagination }
    },

    async listMarketplaceTaxonomy(term_type?: string) {
        const response = await apiClient.get('/gyms/marketplace/taxonomy', {
            params: term_type ? { term_type } : undefined,
        });
        return response.data; // { success, terms }
    },

    async getMarketplaceGym(gymId: string) {
        const response = await apiClient.get(`/gyms/marketplace/${gymId}`);
        return response.data; // { success, gym, canonical_slug }
    },

    async getMarketplaceBranchDetail(gymId: string, branchId: string) {
        const response = await apiClient.get(`/gyms/marketplace/${gymId}/branches/${branchId}`);
        return response.data; // { success, branch }
    },

    async getSimilarMarketplaceGyms(gymId: string, limit = 4) {
        const response = await apiClient.get(`/gyms/marketplace/${gymId}/similar`, {
            params: { limit },
        });
        return response.data; // { success, gyms }
    },

    async getProgramSessions(gymId: string, branchId: string, programId: string, params?: { from?: string; to?: string }) {
        const response = await apiClient.get(`/gyms/marketplace/${gymId}/branches/${branchId}/programs/${programId}/sessions`, {
            params,
        });
        return response.data; // { success, sessions }
    },

    async getGymCenterById(gymId: string) {
        const response = await apiClient.get(`/gyms/${gymId}`);
        return response.data; // { success, gym }
    },

    async getBranchDetail(gymId: string, branchId: string) {
        const response = await apiClient.get(`/gyms/${gymId}/branches/${branchId}`);
        return response.data; // { success, branch }
    },

    async getGymTrainers(gymId: string) {
        const response = await apiClient.get(`/gyms/${gymId}/trainers`);
        return response.data;
    },

    async getBranchTrainers(branchId: string) {
        const response = await apiClient.get(`/gym-owner/branches/${branchId}/trainers`);
        return response.data;
    },

    async getGymReviews(gymId: string) {
        const response = await apiClient.get(`/gyms/${gymId}/reviews`);
        return response.data; // { success, reviews, stats }
    },

    // ── REVIEWS (User) ────────────────────────────────────────

    async checkReviewEligibility(gymId: string) {
        const response = await apiClient.get(`/gyms/${gymId}/check-review`);
        return response.data;
    },

    async createReview(gymId: string, branchId: string, data: { rating: number; comment?: string }) {
        const response = await apiClient.post(`/gyms/${gymId}/reviews`, { ...data, branch_id: branchId });
        return response.data;
    },

    async updateReview(gymId: string, reviewId: string, data: { rating: number; comment?: string }) {
        const response = await apiClient.put(`/gyms/${gymId}/reviews/${reviewId}`, data);
        return response.data;
    },

    async deleteReview(gymId: string, reviewId: string) {
        const response = await apiClient.delete(`/gyms/${gymId}/reviews/${reviewId}`);
        return response.data;
    },

    // ── GYM OWNER ─────────────────────────────────────────────

    async registerGym(data: { name: string; description?: string; tagline?: string; branchName: string; address: string; city?: string; district?: string; phone?: string }) {
        const response = await apiClient.post('/gym-owner/register', data);
        return response.data;
    },

    async getMyGyms() {
        const response = await apiClient.get('/gym-owner/my-gyms');
        return response.data; // { success, gyms: GymCenter[] }
    },

    async updateGymCenter(centerId: string, data: Partial<GymCenter>) {
        const response = await apiClient.put(`/gym-owner/centers/${centerId}`, data);
        return response.data;
    },

    async updateBranch(branchId: string, data: Partial<GymBranch>) {
        const response = await apiClient.put(`/gym-owner/branches/${branchId}`, data);
        return response.data;
    },

    async createBranch(data: { branch_name: string; address: string; city?: string; district?: string; phone?: string; description?: string }) {
        const response = await apiClient.post('/gym-owner/branches', data);
        return response.data; // { success, branch }
    },

    async updateAmenities(branchId: string, amenities: Partial<GymAmenity>[]) {
        const response = await apiClient.put(`/gym-owner/branches/${branchId}/amenities`, { amenities });
        return response.data;
    },

    async updateEquipment(branchId: string, equipment: Partial<GymEquipment>[]) {
        const response = await apiClient.put(`/gym-owner/branches/${branchId}/equipment`, { equipment });
        return response.data;
    },

    async updatePricing(branchId: string, pricing: Partial<GymPricing>[]) {
        const response = await apiClient.put(`/gym-owner/branches/${branchId}/pricing`, { pricing });
        return response.data;
    },

    async addGalleryImage(branchId: string, data: { image_url: string; caption?: string; image_type?: string }) {
        const response = await apiClient.post(`/gym-owner/branches/${branchId}/gallery`, data);
        return response.data;
    },

    async deleteGalleryImage(branchId: string, imageId: string) {
        const response = await apiClient.delete(`/gym-owner/branches/${branchId}/gallery/${imageId}`);
        return response.data;
    },

    async createEvent(branchId: string, data: Partial<GymEvent>) {
        const response = await apiClient.post(`/gym-owner/branches/${branchId}/events`, data);
        return response.data;
    },

    async updateEvent(branchId: string, eventId: string, data: Partial<GymEvent>) {
        const response = await apiClient.put(`/gym-owner/branches/${branchId}/events/${eventId}`, data);
        return response.data;
    },

    async deleteEvent(branchId: string, eventId: string) {
        const response = await apiClient.delete(`/gym-owner/branches/${branchId}/events/${eventId}`);
        return response.data;
    },

    async inviteTrainer(branchId: string, data: { trainer_id: string; role_at_gym?: string }) {
        const response = await apiClient.post(`/gym-owner/branches/${branchId}/trainers/invite`, data);
        return response.data;
    },

    async removeTrainer(branchId: string, linkId: string) {
        const response = await apiClient.delete(`/gym-owner/branches/${branchId}/trainers/${linkId}`);
        return response.data;
    },

    async getGymStats(centerId: string) {
        const response = await apiClient.get(`/gym-owner/stats/${centerId}`);
        return response.data; // { success, stats }
    },

    // ── TRAINERS (Invitations loop) ───────────────────────────

    async getTrainerInvitations() {
        const response = await apiClient.get('/gym-owner/trainer/invitations');
        return response.data; // { success, invitations }
    },

    async acceptInvitation(invitationId: string) {
        const response = await apiClient.post(`/gym-owner/trainer/invitations/${invitationId}/accept`);
        return response.data;
    },

    async declineInvitation(invitationId: string) {
        const response = await apiClient.post(`/gym-owner/trainer/invitations/${invitationId}/decline`);
        return response.data;
    },

    // ── ADMIN ─────────────────────────────────────────────────

    async getPendingGyms() {
        const response = await apiClient.get('/admin/gyms/pending');
        return response.data;
    },

    async getAllGymsAdmin() {
        const response = await apiClient.get('/admin/gyms');
        return response.data;
    },

    async approveGym(centerId: string) {
        const response = await apiClient.post(`/admin/gyms/${centerId}/approve`);
        return response.data;
    },

    async rejectGym(centerId: string) {
        const response = await apiClient.post(`/admin/gyms/${centerId}/reject`);
        return response.data;
    },

    async suspendGym(centerId: string) {
        const response = await apiClient.put(`/admin/gyms/${centerId}/suspend`);
        return response.data;
    },

    async toggleReviewVisibility(reviewId: string) {
        const response = await apiClient.patch(`/admin/gyms/reviews/${reviewId}/toggle`);
        return response.data;
    },

    // Sprint 3: Gym Owner / Trainer reply to a review
    async replyToReview(gymId: string, reviewId: string, reply_text: string) {
        const response = await apiClient.post(`/gyms/${gymId}/reviews/${reviewId}/reply`, { reply_text });
        return response.data;
    }
};
