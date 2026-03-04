import api from './api';
import type {
    TrainerExperience,
    TrainerGallery,
    TrainerFAQ,
} from '../types';

// ── Experience ────────────────────────────────────────────────────────────────

export const addExperience = async (
    data: Omit<TrainerExperience, 'id' | 'trainer_id' | 'created_at'>
): Promise<TrainerExperience> => {
    const res = await api.post('/profiles/me/experience', data);
    return res.data.experience;
};

export const updateExperience = async (
    id: string,
    data: Partial<Omit<TrainerExperience, 'id' | 'trainer_id' | 'created_at'>>
): Promise<TrainerExperience> => {
    const res = await api.put(`/profiles/me/experience/${id}`, data);
    return res.data.experience;
};

export const deleteExperience = async (id: string): Promise<void> => {
    await api.delete(`/profiles/me/experience/${id}`);
};

// ── Gallery ───────────────────────────────────────────────────────────────────

export const addGalleryImage = async (
    data: Omit<TrainerGallery, 'id' | 'trainer_id' | 'created_at'>
): Promise<TrainerGallery> => {
    const res = await api.post('/profiles/me/gallery', data);
    return res.data.image;
};

export const updateGalleryImage = async (
    id: string,
    data: Partial<Omit<TrainerGallery, 'id' | 'trainer_id' | 'created_at'>>
): Promise<TrainerGallery> => {
    const res = await api.put(`/profiles/me/gallery/${id}`, data);
    return res.data.image;
};

export const deleteGalleryImage = async (id: string): Promise<void> => {
    await api.delete(`/profiles/me/gallery/${id}`);
};

// ── FAQ ───────────────────────────────────────────────────────────────────────

export const addFAQ = async (
    data: Omit<TrainerFAQ, 'id' | 'trainer_id' | 'created_at'>
): Promise<TrainerFAQ> => {
    const res = await api.post('/profiles/me/faq', data);
    return res.data.faq;
};

export const updateFAQ = async (
    id: string,
    data: Partial<Omit<TrainerFAQ, 'id' | 'trainer_id' | 'created_at'>>
): Promise<TrainerFAQ> => {
    const res = await api.put(`/profiles/me/faq/${id}`, data);
    return res.data.faq;
};

export const deleteFAQ = async (id: string): Promise<void> => {
    await api.delete(`/profiles/me/faq/${id}`);
};

export const profileApiService = {
    addExperience,
    updateExperience,
    deleteExperience,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    addFAQ,
    updateFAQ,
    deleteFAQ,
};
