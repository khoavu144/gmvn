import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../services/api';
import type { TrainerProfile, TrainerExperience, TrainerGallery, TrainerFAQ, TrainerSkill, TrainerPackage, TrainerTestimonial } from '../../types';

interface PremiumHeroBadge {
    label: string;
    value?: string;
    icon_key?: string;
}

interface PremiumHeroMetric {
    label: string;
    value: string;
}

interface PremiumHero {
    tagline: string | null;
    themeVariant: string | null;
    badges: PremiumHeroBadge[];
    metrics: PremiumHeroMetric[];
    ctaConfig: {
        primary_label?: string;
        secondary_label?: string;
    } | null;
    isFeaturedProfile: boolean;
}

interface TrainerProfileHighlight {
    id: string;
    trainer_id: string;
    title: string;
    value: string;
    icon_key: string | null;
    order_number: number;
}

interface TrainerMediaFeature {
    id: string;
    trainer_id: string;
    media_type: 'image' | 'video';
    url: string;
    thumbnail_url: string | null;
    caption: string | null;
    order_number: number;
    is_featured: boolean;
}

interface TrainerPressMention {
    id: string;
    trainer_id: string;
    source_name: string;
    title: string;
    mention_url: string | null;
    logo_url: string | null;
    excerpt: string | null;
    published_at: string | null;
    order_number: number;
}

export interface ViewedPremiumProfile {
    hero: PremiumHero;
    sectionOrder: string[];
    highlights: TrainerProfileHighlight[];
    mediaFeatures: TrainerMediaFeature[];
    pressMentions: TrainerPressMention[];
}
import { profileApiService } from '../../services/profileService';

// ── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchMyProfile = createAsyncThunk(
    'profile/fetchMyProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/profiles/me');
            return response.data as {
                success: boolean;
                profile: TrainerProfile | null;
                experience: TrainerExperience[];
                gallery: TrainerGallery[];
                faq: TrainerFAQ[];
            };
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Không thể tải profile');
        }
    }
);

// BUG FIX: fetchPublicProfile now uses slug via /profiles/slug/:slug endpoint
// which returns full CV data including skills, packages, testimonials
export const fetchPublicProfile = createAsyncThunk(
    'profile/fetchPublicProfile',
    async (identifier: string, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/profiles/slug/${identifier}`);
            return response.data as {
                success: boolean;
                profile: TrainerProfile;
                experience: TrainerExperience[];
                gallery: TrainerGallery[];
                faq: TrainerFAQ[];
                skills: TrainerSkill[];
                packages: TrainerPackage[];
                testimonials: TrainerTestimonial[];
                premium?: ViewedPremiumProfile;
            };
        } catch (err: any) {
            if (err.response?.status === 404) {
                try {
                    const fallbackResponse = await apiClient.get(`/profiles/trainer/${identifier}/full`);
                    return fallbackResponse.data as {
                        success: boolean;
                        profile: TrainerProfile;
                        experience: TrainerExperience[];
                        gallery: TrainerGallery[];
                        faq: TrainerFAQ[];
                        skills: TrainerSkill[];
                        packages: TrainerPackage[];
                        testimonials: TrainerTestimonial[];
                        premium?: ViewedPremiumProfile;
                    };
                } catch (fallbackErr: any) {
                    // FINAL FALLBACK: If TrainerProfile doesn't exist at all, fetch basic User record so UI doesn't 404
                    if (fallbackErr.response?.status === 404) {
                        try {
                            const userRes = await apiClient.get(`/users/trainers/${identifier}`);
                            const user = userRes.data.data;
                            if (user) {
                                return {
                                    success: true,
                                    profile: {
                                        id: 'dummy-profile-id',
                                        trainer_id: user.id,
                                        is_profile_public: true,
                                        is_featured_profile: false,
                                        created_at: user.created_at,
                                        updated_at: user.updated_at,
                                        trainer: user // Embed user record as trainer
                                    } as unknown as TrainerProfile,
                                    experience: [],
                                    gallery: [],
                                    faq: [],
                                    skills: [],
                                    packages: [],
                                    testimonials: []
                                };
                            }
                        } catch (e) {
                            // User not found at all
                        }
                    }
                    return rejectWithValue(fallbackErr.response?.data?.error || 'Profile không tồn tại');
                }
            }

            return rejectWithValue(err.response?.data?.error || 'Profile không tồn tại');
        }
    }
);

export const updateProfile = createAsyncThunk(
    'profile/updateProfile',
    async (data: Partial<TrainerProfile>, { rejectWithValue }) => {
        try {
            const response = await apiClient.put('/profiles/me', data);
            return response.data.profile as TrainerProfile;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Lỗi khi cập nhật profile');
        }
    }
);

// ── Experience Thunks ────────────────────────────────────────────────────────

export const addExperienceThunk = createAsyncThunk(
    'profile/addExperience',
    async (data: Omit<TrainerExperience, 'id' | 'trainer_id' | 'created_at'>, { rejectWithValue }) => {
        try {
            return await profileApiService.addExperience(data);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Lỗi khi thêm kinh nghiệm');
        }
    }
);

export const updateExperienceThunk = createAsyncThunk(
    'profile/updateExperience',
    async ({ id, data }: { id: string; data: Partial<TrainerExperience> }, { rejectWithValue }) => {
        try {
            return await profileApiService.updateExperience(id, data);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Lỗi khi cập nhật kinh nghiệm');
        }
    }
);

export const deleteExperienceThunk = createAsyncThunk(
    'profile/deleteExperience',
    async (id: string, { rejectWithValue }) => {
        try {
            await profileApiService.deleteExperience(id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Lỗi khi xóa kinh nghiệm');
        }
    }
);

// ── Gallery Thunks ───────────────────────────────────────────────────────────

export const addGalleryThunk = createAsyncThunk(
    'profile/addGallery',
    async (data: Omit<TrainerGallery, 'id' | 'trainer_id' | 'created_at'>, { rejectWithValue }) => {
        try {
            return await profileApiService.addGalleryImage(data);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Lỗi khi thêm ảnh');
        }
    }
);

export const updateGalleryThunk = createAsyncThunk(
    'profile/updateGallery',
    async ({ id, data }: { id: string; data: Partial<TrainerGallery> }, { rejectWithValue }) => {
        try {
            return await profileApiService.updateGalleryImage(id, data);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Lỗi khi cập nhật ảnh');
        }
    }
);

export const deleteGalleryThunk = createAsyncThunk(
    'profile/deleteGallery',
    async (id: string, { rejectWithValue }) => {
        try {
            await profileApiService.deleteGalleryImage(id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Lỗi khi xóa ảnh');
        }
    }
);

// ── FAQ Thunks ───────────────────────────────────────────────────────────────

export const addFAQThunk = createAsyncThunk(
    'profile/addFAQ',
    async (data: Omit<TrainerFAQ, 'id' | 'trainer_id' | 'created_at'>, { rejectWithValue }) => {
        try {
            return await profileApiService.addFAQ(data);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Lỗi khi thêm câu hỏi');
        }
    }
);

export const updateFAQThunk = createAsyncThunk(
    'profile/updateFAQ',
    async ({ id, data }: { id: string; data: Partial<TrainerFAQ> }, { rejectWithValue }) => {
        try {
            return await profileApiService.updateFAQ(id, data);
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Lỗi khi cập nhật câu hỏi');
        }
    }
);

export const deleteFAQThunk = createAsyncThunk(
    'profile/deleteFAQ',
    async (id: string, { rejectWithValue }) => {
        try {
            await profileApiService.deleteFAQ(id);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.error || 'Lỗi khi xóa câu hỏi');
        }
    }
);

// ── Slice ────────────────────────────────────────────────────────────────────

interface ProfileState {
    myProfile: TrainerProfile | null;
    experience: TrainerExperience[];
    gallery: TrainerGallery[];
    faq: TrainerFAQ[];
    viewedProfile: TrainerProfile | null;
    viewedExperience: TrainerExperience[];
    viewedGallery: TrainerGallery[];
    viewedFaq: TrainerFAQ[];
    viewedSkills: TrainerSkill[];
    viewedPackages: TrainerPackage[];
    viewedTestimonials: TrainerTestimonial[];
    viewedPremium: ViewedPremiumProfile | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
    successMsg: string | null;
}

const initialState: ProfileState = {
    myProfile: null,
    experience: [],
    gallery: [],
    faq: [],
    viewedProfile: null,
    viewedExperience: [],
    viewedGallery: [],
    viewedFaq: [],
    viewedSkills: [],
    viewedPackages: [],
    viewedTestimonials: [],
    viewedPremium: null,
    loading: false,
    saving: false,
    error: null,
    successMsg: null,
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        clearProfileMessages: (state) => {
            state.error = null;
            state.successMsg = null;
        },
        setSuccessMsg: (state, action: PayloadAction<string>) => {
            state.successMsg = action.payload;
        },
    },
    extraReducers: (builder) => {
        // ── fetchMyProfile ───────────────────────────────────────────────────
        builder
            .addCase(fetchMyProfile.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchMyProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.myProfile = action.payload.profile;
                state.experience = action.payload.experience || [];
                state.gallery = action.payload.gallery || [];
                state.faq = action.payload.faq || [];
            })
            .addCase(fetchMyProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // ── fetchPublicProfile ───────────────────────────────────────────────
        builder
            .addCase(fetchPublicProfile.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchPublicProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.viewedProfile = action.payload.profile;
                state.viewedExperience = action.payload.experience || [];
                state.viewedGallery = action.payload.gallery || [];
                state.viewedFaq = action.payload.faq || [];
                state.viewedSkills = action.payload.skills || [];
                state.viewedPackages = action.payload.packages || [];
                state.viewedTestimonials = action.payload.testimonials || [];
                state.viewedPremium = action.payload.premium || null;
            })
            .addCase(fetchPublicProfile.rejected, (state, action) => {
                state.loading = false;
                const payload = action.payload;
                state.error = typeof payload === 'string' ? payload : (payload as any)?.message || 'Profile không tồn tại';
            });

        // ── updateProfile ────────────────────────────────────────────────────
        builder
            .addCase(updateProfile.pending, (state) => { state.saving = true; state.error = null; })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.saving = false;
                state.myProfile = action.payload;
                state.successMsg = 'Đã cập nhật profile thành công!';
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload as string;
            });

        // ── Experience CRUD ──────────────────────────────────────────────────
        builder
            .addCase(addExperienceThunk.fulfilled, (state, action) => {
                state.experience.unshift(action.payload);
                state.successMsg = 'Đã thêm kinh nghiệm!';
            })
            .addCase(updateExperienceThunk.fulfilled, (state, action) => {
                const idx = state.experience.findIndex(e => e.id === action.payload.id);
                if (idx !== -1) state.experience[idx] = action.payload;
                state.successMsg = 'Đã cập nhật kinh nghiệm!';
            })
            .addCase(deleteExperienceThunk.fulfilled, (state, action) => {
                state.experience = state.experience.filter(e => e.id !== action.payload);
                state.successMsg = 'Đã xóa kinh nghiệm!';
            });

        // ── Gallery CRUD ─────────────────────────────────────────────────────
        builder
            .addCase(addGalleryThunk.fulfilled, (state, action) => {
                state.gallery.push(action.payload);
                state.successMsg = 'Đã thêm ảnh!';
            })
            .addCase(updateGalleryThunk.fulfilled, (state, action) => {
                const idx = state.gallery.findIndex(g => g.id === action.payload.id);
                if (idx !== -1) state.gallery[idx] = action.payload;
                state.successMsg = 'Đã cập nhật ảnh!';
            })
            .addCase(deleteGalleryThunk.fulfilled, (state, action) => {
                state.gallery = state.gallery.filter(g => g.id !== action.payload);
                state.successMsg = 'Đã xóa ảnh!';
            });

        // ── FAQ CRUD ─────────────────────────────────────────────────────────
        builder
            .addCase(addFAQThunk.fulfilled, (state, action) => {
                state.faq.push(action.payload);
                state.successMsg = 'Đã thêm câu hỏi!';
            })
            .addCase(updateFAQThunk.fulfilled, (state, action) => {
                const idx = state.faq.findIndex(f => f.id === action.payload.id);
                if (idx !== -1) state.faq[idx] = action.payload;
                state.successMsg = 'Đã cập nhật câu hỏi!';
            })
            .addCase(deleteFAQThunk.fulfilled, (state, action) => {
                state.faq = state.faq.filter(f => f.id !== action.payload);
                state.successMsg = 'Đã xóa câu hỏi!';
            });
    },
});

export const { clearProfileMessages, setSuccessMsg } = profileSlice.actions;
export default profileSlice.reducer;
