import apiClient from './api';
import type { Product, ProductCategory, SellerProfile, TrainingPackageDetail } from '../types';

export type SellerBusinessType = 'individual' | 'brand' | 'gym' | 'coach';

export interface CreateSellerProductBody {
    title: string;
    description?: string;
    category_id: string;
    product_type: 'digital' | 'physical' | 'service';
    price: number;
    compare_at_price?: number;
    stock_quantity?: number;
    track_inventory?: boolean;
    sku?: string;
    digital_file_url?: string;
    preview_content?: string;
    thumbnail_url?: string;
    gallery?: string[];
    attributes?: Record<string, unknown>;
    tags?: string[];
}

export interface CreateSellerTrainingPackageBody extends CreateSellerProductBody {
    goal: string;
    level: string;
    duration_weeks: number;
    sessions_per_week: number;
    equipment_required?: string[];
    includes_nutrition?: boolean;
    includes_video?: boolean;
    program_structure?: Record<string, unknown>;
    preview_weeks?: number;
    nutrition_guide?: Record<string, unknown>;
}

export type SellerUpdateProductBody = Partial<CreateSellerProductBody> & {
    category_id?: string;
    status?: 'draft' | 'archived';
};

export interface MarketplaceSellerApiError {
    success: false;
    error?: string;
    error_code?: string;
    needs_membership?: boolean;
    forbidden_product_type?: boolean;
    forbidden_training_package?: boolean;
}

export function flattenProductCategories(categories: ProductCategory[]): ProductCategory[] {
    const out: ProductCategory[] = [];
    for (const c of categories) {
        out.push(c);
        if (c.children?.length) {
            out.push(...flattenProductCategories(c.children));
        }
    }
    return out;
}

export async function getMySellerProfile(): Promise<SellerProfile | null> {
    const res = await apiClient.get<{ success: boolean; profile: SellerProfile | null }>(
        '/marketplace/seller/profile',
    );
    return res.data.profile ?? null;
}

export async function registerSeller(body: {
    shop_name: string;
    business_type?: SellerBusinessType;
}): Promise<SellerProfile> {
    const res = await apiClient.post<{ success: boolean; profile: SellerProfile }>(
        '/marketplace/seller/register',
        {
            shop_name: body.shop_name,
            business_type: body.business_type ?? 'individual',
        },
    );
    return res.data.profile;
}

export async function listSellerProducts(page = 1, limit = 20): Promise<{
    products: Product[];
    total: number;
}> {
    const res = await apiClient.get<{ success: boolean; products: Product[]; total: number }>(
        '/marketplace/seller/products',
        { params: { page, limit } },
    );
    return { products: res.data.products ?? [], total: res.data.total ?? 0 };
}

export async function getSellerProduct(productId: string): Promise<Product> {
    const res = await apiClient.get<{ success: boolean; product: Product }>(
        `/marketplace/seller/products/${productId}`,
    );
    return res.data.product;
}

export async function createSellerProduct(body: CreateSellerProductBody): Promise<Product> {
    const res = await apiClient.post<{ success: boolean; product: Product }>(
        '/marketplace/seller/products',
        body,
    );
    return res.data.product;
}

export async function createSellerTrainingPackage(
    body: CreateSellerTrainingPackageBody,
): Promise<{ product: Product; trainingPackage: TrainingPackageDetail }> {
    const res = await apiClient.post<{
        success: boolean;
        product: Product;
        trainingPackage: TrainingPackageDetail;
    }>('/marketplace/seller/products/training-package', body);
    return { product: res.data.product, trainingPackage: res.data.trainingPackage };
}

export async function updateSellerProduct(
    productId: string,
    body: SellerUpdateProductBody,
): Promise<Product> {
    const res = await apiClient.put<{ success: boolean; product: Product }>(
        `/marketplace/seller/products/${productId}`,
        body,
    );
    return res.data.product;
}

export async function updateSellerTrainingPackage(
    productId: string,
    body: Partial<CreateSellerTrainingPackageBody>,
): Promise<TrainingPackageDetail> {
    const res = await apiClient.put<{ success: boolean; training_package: TrainingPackageDetail }>(
        `/marketplace/seller/products/${productId}/training-package`,
        body,
    );
    return res.data.training_package;
}

export async function fetchMarketplaceCategories(): Promise<ProductCategory[]> {
    const res = await apiClient.get<{ success: boolean; categories: ProductCategory[] }>(
        '/marketplace/categories',
    );
    return res.data.categories ?? [];
}
