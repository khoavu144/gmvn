/**
 * marketplaceController.ts
 * HTTP handlers for GYMERVIET Product Marketplace
 */
import { Request, Response } from 'express';
import * as svc from '../services/marketplaceService';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { asAppError, getSingleParam, requireRequestUserId } from '../utils/controllerUtils';

const sellerRuleDetails = (err: svc.MarketplaceSellerRuleError) => ({
    error_code: err.code,
    ...(err.code === 'NEEDS_MEMBERSHIP' ? { needs_membership: true } : {}),
    ...(err.code === 'FORBIDDEN_PRODUCT_TYPE' ? { forbidden_product_type: true } : {}),
    ...(err.code === 'FORBIDDEN_TRAINING_PACKAGE' ? { forbidden_training_package: true } : {}),
});

const rethrowMarketplaceError = (
    error: unknown,
    fallbackStatus: number,
    code: string,
    fallbackMessage = 'Server error',
) => {
    if (error instanceof svc.MarketplaceSellerRuleError) {
        throw new AppError(error.message, 403, error.code, sellerRuleDetails(error));
    }

    if ((error as { code?: string } | undefined)?.code === '23505') {
        throw new AppError('Bạn đã review sản phẩm này rồi', 409, 'PRODUCT_REVIEW_DUPLICATE');
    }

    throw asAppError(error, fallbackStatus, fallbackMessage, code);
};

export const getCategories = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const categories = await svc.listCategories();
    res.json({ success: true, categories });
});

export const getProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
        category, product_type, search,
        min_price, max_price, sort, page, limit,
    } = req.query as Record<string, string | undefined>;

    const result = await svc.listProducts({
        category_slug: category,
        product_type,
        search,
        min_price: min_price ? Number(min_price) : undefined,
        max_price: max_price ? Number(max_price) : undefined,
        sort: sort as svc.ListProductsOptions['sort'],
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
    });

    res.json({ success: true, ...result });
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const slug = getSingleParam(req.params.slug);
    const userId = req.user?.user_id;
    const product = await svc.getProductBySlug(slug, userId);

    if (!product) {
        throw new AppError('Sản phẩm không tồn tại', 404, 'PRODUCT_NOT_FOUND');
    }

    res.json({ success: true, product });
});

export const getFeaturedProducts = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const featured = await svc.getFeaturedProducts(8);
    const newArrivals = await svc.getNewArrivals(8);
    res.json({ success: true, featured, new_arrivals: newArrivals });
});

export const registerSeller = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireRequestUserId(req);
        const userType = req.user?.user_type;

        if (userType === 'admin') {
            throw new AppError('Tài khoản admin không đăng ký bán trên marketplace.', 403, 'ADMIN_NO_SELLER');
        }

        const { shop_name, business_type } = req.body as {
            shop_name: string;
            business_type: 'individual' | 'brand' | 'gym' | 'coach';
        };

        if (!shop_name) {
            throw new AppError('Cần nhập tên shop', 400, 'SELLER_PROFILE_VALIDATION_ERROR');
        }

        const profile = await svc.getOrCreateSellerProfile(userId, {
            shop_name,
            business_type: business_type || 'individual',
        });

        res.json({ success: true, profile });
    } catch (error) {
        rethrowMarketplaceError(error, 500, 'SELLER_PROFILE_REGISTER_ERROR');
    }
});

export const getMySellerProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = requireRequestUserId(req);
    const profile = await svc.getSellerProfileByUserId(userId);
    res.json({ success: true, profile });
});

export const getSellerShop = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const slug = getSingleParam(req.params.slug);
    const seller = await svc.getSellerBySlug(slug);
    if (!seller) {
        throw new AppError('Shop không tồn tại', 404, 'SELLER_NOT_FOUND');
    }

    res.json({ success: true, seller });
});

export const sellerListProducts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = requireRequestUserId(req);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await svc.listSellerProducts(userId, page, limit);
    res.json({ success: true, ...result });
});

export const sellerCreateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireRequestUserId(req);
        const product = await svc.createProduct(userId, req.body as svc.CreateProductInput);
        res.status(201).json({ success: true, product });
    } catch (error) {
        rethrowMarketplaceError(error, 500, 'SELLER_CREATE_PRODUCT_ERROR');
    }
});

export const sellerCreateTrainingPackage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireRequestUserId(req);
        const result = await svc.createTrainingPackage(userId, req.body as svc.CreateTrainingPackageInput);
        res.status(201).json({ success: true, ...result });
    } catch (error) {
        rethrowMarketplaceError(error, 500, 'SELLER_CREATE_TRAINING_PACKAGE_ERROR');
    }
});

export const sellerGetProductById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = requireRequestUserId(req);
    const id = getSingleParam(req.params.id);
    const product = await svc.getSellerProductById(id, userId);

    if (!product) {
        throw new AppError('Sản phẩm không tồn tại', 404, 'PRODUCT_NOT_FOUND');
    }

    res.json({ success: true, product });
});

export const sellerUpdateTrainingPackage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireRequestUserId(req);
        const id = getSingleParam(req.params.id);
        const trainingPackage = await svc.updateSellerTrainingPackage(id, userId, req.body);

        if (!trainingPackage) {
            throw new AppError('Không tìm thấy gói tập cho sản phẩm này', 404, 'TRAINING_PACKAGE_NOT_FOUND');
        }

        res.json({ success: true, training_package: trainingPackage });
    } catch (error) {
        rethrowMarketplaceError(error, 500, 'SELLER_UPDATE_TRAINING_PACKAGE_ERROR');
    }
});

export const sellerUpdateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireRequestUserId(req);
        const id = getSingleParam(req.params.id);
        const product = await svc.updateProduct(id, userId, req.body as svc.SellerUpdateProductInput);

        if (!product) {
            throw new AppError('Sản phẩm không tồn tại', 404, 'PRODUCT_NOT_FOUND');
        }

        res.json({ success: true, product });
    } catch (error) {
        rethrowMarketplaceError(error, 500, 'SELLER_UPDATE_PRODUCT_ERROR');
    }
});

export const getProductReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const productId = getSingleParam(req.params.productId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const result = await svc.listProductReviews(productId, page, limit);
    res.json({ success: true, ...result });
});

export const createReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = requireRequestUserId(req);
        const productId = getSingleParam(req.params.productId);
        const review = await svc.createProductReview(productId, userId, req.body);
        res.status(201).json({ success: true, review });
    } catch (error) {
        rethrowMarketplaceError(error, 500, 'PRODUCT_REVIEW_CREATE_ERROR');
    }
});

export const toggleWishlist = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = requireRequestUserId(req);
    const productId = getSingleParam(req.params.productId);
    const result = await svc.toggleWishlist(userId, productId);
    res.json({ success: true, ...result });
});

export const getWishlist = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = requireRequestUserId(req);
    const items = await svc.getUserWishlist(userId);
    res.json({ success: true, items });
});

export const getModerationQueue = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const result = await svc.getModerationQueue(page, limit);
    res.json({ success: true, ...result });
});

export const moderateProduct = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    try {
        const adminId = requireRequestUserId(req);
        const id = getSingleParam(req.params.id);
        const { decision, note } = req.body as { decision: 'approve' | 'reject'; note?: string };

        const product = await svc.moderateProduct(id, adminId, decision, note);
        if (!product) {
            throw new AppError('Sản phẩm không tồn tại', 404, 'PRODUCT_NOT_FOUND');
        }

        res.json({ success: true, product });
    } catch (error) {
        rethrowMarketplaceError(error, 500, 'PRODUCT_MODERATION_ERROR');
    }
});
