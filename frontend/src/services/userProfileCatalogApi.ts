import apiClient from './api';

export interface CatalogTerm {
    id: string;
    slug: string;
    label_vi: string;
    sort_order: number;
}

export interface CatalogSection {
    id: string;
    slug: string;
    title_vi: string;
    description_vi: string | null;
    sort_order: number;
    min_select: number;
    max_select: number;
    terms: CatalogTerm[];
    fields: unknown[];
}

export interface UserProfileCatalogPayload {
    sections: CatalogSection[];
    locale: string;
}

export async function fetchUserProfileCatalog(): Promise<UserProfileCatalogPayload> {
    const res = await apiClient.get<{ success: boolean; data: UserProfileCatalogPayload }>(
        '/user-profile/catalog',
    );
    return res.data.data;
}

export async function fetchUserProfileTermIds(): Promise<string[]> {
    const res = await apiClient.get<{ success: boolean; data: { term_ids: string[] } }>(
        '/user-profile/me',
    );
    return res.data.data.term_ids;
}

export async function updateUserProfileTermIds(
    term_ids: string[],
    context: 'post_signup_wizard' | 'profile' | 'feature_marketplace_listing' = 'profile',
): Promise<{ term_ids: string[] }> {
    const res = await apiClient.put<{ success: boolean; data: { term_ids: string[] } }>(
        '/user-profile/me',
        { term_ids, context },
    );
    return res.data.data;
}
