import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { communityGalleryApiService } from '../../services/communityGalleryService';
import type { CommunityGalleryItem, CommunityGalleryStats } from '../../services/communityGalleryService';

interface CommunityGalleryState {
    items: CommunityGalleryItem[];
    total: number;
    page: number;
    totalPages: number;
    stats: CommunityGalleryStats | null;
    currentCategory: string;
    loading: boolean;
    error: string | null;
    hasMore: boolean;
}

const initialState: CommunityGalleryState = {
    items: [],
    total: 0,
    page: 1,
    totalPages: 1,
    stats: null,
    currentCategory: 'all',
    loading: false,
    error: null,
    hasMore: true,
};

export const fetchCommunityGallery = createAsyncThunk(
    'communityGallery/fetchItems',
    async ({ page = 1, category = 'all', reset = false }: { page?: number; category?: string; reset?: boolean }, { rejectWithValue }) => {
        try {
            const response = await communityGalleryApiService.getGallery({ page, limit: 12, category });
            return { ...response, reset };
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch gallery');
        }
    }
);

export const fetchCommunityGalleryStats = createAsyncThunk(
    'communityGallery/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            return await communityGalleryApiService.getStats();
        } catch {
            return rejectWithValue('Failed to fetch stats');
        }
    }
);

const communityGallerySlice = createSlice({
    name: 'communityGallery',
    initialState,
    reducers: {
        setCategory(state, action: PayloadAction<string>) {
            state.currentCategory = action.payload;
            state.items = [];
            state.page = 1;
            state.hasMore = true;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Items
            .addCase(fetchCommunityGallery.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCommunityGallery.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.reset) {
                    state.items = action.payload.items;
                } else {
                    const newItems = action.payload.items.filter(
                        newItem => !state.items.find(existing => existing.id === newItem.id)
                    );
                    state.items = [...state.items, ...newItems];
                }
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.totalPages = action.payload.totalPages;
                state.hasMore = state.page < state.totalPages;
            })
            .addCase(fetchCommunityGallery.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Stats
            .addCase(fetchCommunityGalleryStats.fulfilled, (state, action) => {
                state.stats = action.payload;
            });
    },
});

export const { setCategory } = communityGallerySlice.actions;
export default communityGallerySlice.reducer;
