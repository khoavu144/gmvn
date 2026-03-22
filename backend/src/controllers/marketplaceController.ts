/**
 * marketplaceController.ts
 * HTTP handlers for GYMERVIET Product Marketplace
 */
import { Request, Response } from 'express';
import * as svc from '../services/marketplaceService';

/** Express route params are typed string|string[] — use this to safely get a single value */
const p = (v: string | string[] | undefined): string => (Array.isArray(v) ? v[0] : v) ?? '';

function jsonSellerRuleError(res: Response, err: svc.MarketplaceSellerRuleError): void {
    const body: Record<string, unknown> = {
        success: false,
        error: err.message,
        error_code: err.code,
    };
    if (err.code === 'NEEDS_MEMBERSHIP') {
        body.needs_membership = true;
    }
    if (err.code === 'FORBIDDEN_PRODUCT_TYPE') {
        body.forbidden_product_type = true;
    }
    if (err.code === 'FORBIDDEN_TRAINING_PACKAGE') {
        body.forbidden_training_package = true;
    }
    res.status(403).json(body);
}

// ─────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────

export async function getCategories(req: Request, res: Response): Promise<void> {
    try {
        const categories = await svc.listCategories();
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

// ─────────────────────────────────────────────────────────────────────
// PRODUCTS — PUBLIC
// ─────────────────────────────────────────────────────────────────────

export async function getProducts(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function getProductBySlug(req: Request, res: Response): Promise<void> {
    try {
        const slug = p(req.params['slug']);
        const userId = (req as any).user?.user_id as string | undefined;
        const product = await svc.getProductBySlug(slug, userId);
        if (!product) {
            res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });
            return;
        }
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function getFeaturedProducts(req: Request, res: Response): Promise<void> {
    try {
        const products = await svc.getFeaturedProducts(8);
        const newArrivals = await svc.getNewArrivals(8);
        res.json({ success: true, featured: products, new_arrivals: newArrivals });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

// ─────────────────────────────────────────────────────────────────────
// SELLER PROFILE
// ─────────────────────────────────────────────────────────────────────

export async function registerSeller(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false, error: 'Unauthorized' }); return; }

        const userType = (req as any).user?.user_type as string | undefined;
        if (userType === 'admin') {
            res.status(403).json({ success: false, error: 'Tài khoản admin không đăng ký bán trên marketplace.' });
            return;
        }

        const { shop_name, business_type } = req.body as {
            shop_name: string;
            business_type: 'individual' | 'brand' | 'gym' | 'coach';
        };

        if (!shop_name) {
            res.status(400).json({ success: false, error: 'Cần nhập tên shop' });
            return;
        }

        const profile = await svc.getOrCreateSellerProfile(userId, {
            shop_name,
            business_type: business_type || 'individual',
        });
        res.json({ success: true, profile });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function getMySellerProfile(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false }); return; }

        const profile = await svc.getSellerProfileByUserId(userId);
        res.json({ success: true, profile });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function getSellerShop(req: Request, res: Response): Promise<void> {
    try {
        const slug = p(req.params['slug']);
        const seller = await svc.getSellerBySlug(slug);
        if (!seller) {
            res.status(404).json({ success: false, error: 'Shop không tồn tại' });
            return;
        }
        res.json({ success: true, seller });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

// ─────────────────────────────────────────────────────────────────────
// SELLER — PRODUCTS
// ─────────────────────────────────────────────────────────────────────

export async function sellerListProducts(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false }); return; }

        const { page, limit } = req.query as Record<string, string>;
        const result = await svc.listSellerProducts(userId, Number(page) || 1, Number(limit) || 20);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function sellerCreateProduct(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false }); return; }

        const product = await svc.createProduct(userId, req.body as svc.CreateProductInput);
        res.status(201).json({ success: true, product });
    } catch (err) {
        if (err instanceof svc.MarketplaceSellerRuleError) {
            jsonSellerRuleError(res, err);
            return;
        }
        console.error('[marketplace] createProduct error', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function sellerCreateTrainingPackage(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false }); return; }

        const result = await svc.createTrainingPackage(userId, req.body as svc.CreateTrainingPackageInput);
        res.status(201).json({ success: true, ...result });
    } catch (err) {
        if (err instanceof svc.MarketplaceSellerRuleError) {
            jsonSellerRuleError(res, err);
            return;
        }
        console.error('[marketplace] createTrainingPackage error', err);
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function sellerGetProductById(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false }); return; }

        const id = p(req.params['id']);
        const product = await svc.getSellerProductById(id, userId);
        if (!product) {
            res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });
            return;
        }
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function sellerUpdateTrainingPackage(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false }); return; }

        const id = p(req.params['id']);
        const trainingPackage = await svc.updateSellerTrainingPackage(id, userId, req.body);
        if (!trainingPackage) {
            res.status(404).json({ success: false, error: 'Không tìm thấy gói tập cho sản phẩm này' });
            return;
        }
        res.json({ success: true, training_package: trainingPackage });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function sellerUpdateProduct(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false }); return; }

        const id = p(req.params['id']);
        const product = await svc.updateProduct(id, userId, req.body as svc.SellerUpdateProductInput);
        if (!product) {
            res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });
            return;
        }
        res.json({ success: true, product });
    } catch (err) {
        if (err instanceof svc.MarketplaceSellerRuleError) {
            jsonSellerRuleError(res, err);
            return;
        }
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

// ─────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────

export async function getProductReviews(req: Request, res: Response): Promise<void> {
    try {
        const productId = p(req.params['productId']);
        const { page, limit } = req.query as Record<string, string>;
        const result = await svc.listProductReviews(productId, Number(page) || 1, Number(limit) || 10);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function createReview(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false }); return; }

        const productId = p(req.params['productId']);
        const review = await svc.createProductReview(productId, userId, req.body);
        res.status(201).json({ success: true, review });
    } catch (err: any) {
        if (err?.code === '23505') {
            res.status(409).json({ success: false, error: 'Bạn đã review sản phẩm này rồi' });
            return;
        }
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

// ─────────────────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────────────────

export async function toggleWishlist(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false }); return; }

        const productId = p(req.params['productId']);
        const result = await svc.toggleWishlist(userId, productId);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function getWishlist(req: Request, res: Response): Promise<void> {
    try {
        const userId = (req as any).user?.user_id as string | undefined;
        if (!userId) { res.status(401).json({ success: false }); return; }

        const items = await svc.getUserWishlist(userId);
        res.json({ success: true, items });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

// ─────────────────────────────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────────────────────────────

export async function getModerationQueue(req: Request, res: Response): Promise<void> {
    try {
        const { page, limit } = req.query as Record<string, string>;
        const result = await svc.getModerationQueue(Number(page) || 1, Number(limit) || 20);
        res.json({ success: true, ...result });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}

export async function moderateProduct(req: Request, res: Response): Promise<void> {
    try {
        const adminId = (req as any).user?.user_id as string | undefined;
        if (!adminId) { res.status(401).json({ success: false }); return; }

        const id = p(req.params['id']);
        const { decision, note } = req.body as { decision: 'approve' | 'reject'; note?: string };

        const product = await svc.moderateProduct(id, adminId, decision, note);
        if (!product) {
            res.status(404).json({ success: false, error: 'Sản phẩm không tồn tại' });
            return;
        }
        res.json({ success: true, product });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
}
