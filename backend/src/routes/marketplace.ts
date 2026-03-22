import { Router } from 'express';
import * as ctrl from '../controllers/marketplaceController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// ─── Public ───────────────────────────────────────────────────────
// GET /api/marketplace/categories
router.get('/categories', ctrl.getCategories);

// GET /api/marketplace/featured — home page featured + new arrivals
router.get('/featured', ctrl.getFeaturedProducts);

// GET /api/marketplace/products?category=&search=&sort=&page=&limit=
router.get('/products', ctrl.getProducts);

// GET /api/marketplace/products/:slug — product detail
router.get('/products/:slug', ctrl.getProductBySlug);

// GET /api/marketplace/products/:productId/reviews
router.get('/products/:productId/reviews', ctrl.getProductReviews);

// GET /api/marketplace/sellers/:slug — seller shop page
router.get('/sellers/:slug', ctrl.getSellerShop);

// ─── Authenticated (buyer actions) ────────────────────────────────
// POST /api/marketplace/wishlist/:productId — toggle wishlist
router.post('/wishlist/:productId', authenticate, ctrl.toggleWishlist);

// GET /api/marketplace/wishlist — my wishlist
router.get('/wishlist', authenticate, ctrl.getWishlist);

// POST /api/marketplace/products/:productId/reviews
router.post('/products/:productId/reviews', authenticate, ctrl.createReview);

// ─── Seller (authenticated seller) ────────────────────────────────
// POST /api/marketplace/seller/register
router.post('/seller/register', authenticate, ctrl.registerSeller);

// GET /api/marketplace/seller/profile — current user's seller shop profile (or null)
router.get('/seller/profile', authenticate, ctrl.getMySellerProfile);

// GET /api/marketplace/seller/products
router.get('/seller/products', authenticate, ctrl.sellerListProducts);

// GET /api/marketplace/seller/products/:id — one product (seller), with training_package
router.get('/seller/products/:id', authenticate, ctrl.sellerGetProductById);

// POST /api/marketplace/seller/products — create any product
router.post('/seller/products', authenticate, ctrl.sellerCreateProduct);

// POST /api/marketplace/seller/products/training-package — create training pkg
router.post('/seller/products/training-package', authenticate, ctrl.sellerCreateTrainingPackage);

// PUT /api/marketplace/seller/products/:id/training-package — update training package (seller)
router.put('/seller/products/:id/training-package', authenticate, ctrl.sellerUpdateTrainingPackage);

// PUT /api/marketplace/seller/products/:id
router.put('/seller/products/:id', authenticate, ctrl.sellerUpdateProduct);

// ─── Admin ────────────────────────────────────────────────────────
// GET /api/marketplace/admin/moderation
router.get('/admin/moderation', authenticate, requireAdmin, ctrl.getModerationQueue);

// PUT /api/marketplace/admin/products/:id/moderate
router.put('/admin/products/:id/moderate', authenticate, requireAdmin, ctrl.moderateProduct);

export default router;
