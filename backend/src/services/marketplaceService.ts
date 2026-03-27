/**
 * marketplaceService.ts
 * Business logic for GYMERVIET Product Marketplace
 */
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Product, ProductStatus } from '../entities/Product';
import { ProductCategory } from '../entities/ProductCategory';
import { ProductVariant } from '../entities/ProductVariant';
import { ProductReview } from '../entities/ProductReview';
import { ProductOrder } from '../entities/ProductOrder';
import { ProductOrderItem } from '../entities/ProductOrderItem';
import { ProductWishlist } from '../entities/ProductWishlist';
import { SellerProfile } from '../entities/SellerProfile';
import { ProhibitedKeyword } from '../entities/ProhibitedKeyword';
import { TrainingPackage } from '../entities/TrainingPackage';
import { ILike, IsNull, Not, In } from 'typeorm';

// ─────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────

export interface ListProductsOptions {
    category_slug?: string;
    product_type?: string;
    search?: string;
    min_price?: number;
    max_price?: number;
    sort?: 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'rating';
    page?: number;
    limit?: number;
}

export interface CreateProductInput {
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

/** Thrown when seller listing rules block create (membership, role, admin). */
export class MarketplaceSellerRuleError extends Error {
    constructor(
        public readonly code:
            | 'NEEDS_MEMBERSHIP'
            | 'FORBIDDEN_PRODUCT_TYPE'
            | 'FORBIDDEN_TRAINING_PACKAGE'
            | 'ADMIN_NO_SELLER',
        message: string,
    ) {
        super(message);
        this.name = 'MarketplaceSellerRuleError';
    }
}

export interface CreateTrainingPackageInput extends CreateProductInput {
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

// ─────────────────────────────────────────────────────────────────────
// MODERATION
// ─────────────────────────────────────────────────────────────────────

export async function checkProhibitedContent(text: string): Promise<{
    flagged: boolean;
    severity: 'auto_reject' | 'flag_for_review' | null;
    matchedKeywords: string[];
}> {
    const repo = AppDataSource.getRepository(ProhibitedKeyword);
    const keywords = await repo.find({ where: { is_active: true } });

    const lowerText = text.toLowerCase();
    const matched = keywords.filter((kw) => lowerText.includes(kw.keyword.toLowerCase()));

    if (matched.length === 0) {
        return { flagged: false, severity: null, matchedKeywords: [] };
    }

    const hasAutoReject = matched.some((kw) => kw.severity === 'auto_reject');
    return {
        flagged: true,
        severity: hasAutoReject ? 'auto_reject' : 'flag_for_review',
        matchedKeywords: matched.map((kw) => kw.keyword),
    };
}

async function determineProductStatus(
    input: CreateProductInput,
    categoryId: string,
    sellerId: string,
): Promise<ProductStatus> {
    // Check for prohibited content
    const textToCheck = `${input.title} ${input.description || ''} ${(input.tags || []).join(' ')}`;
    const modResult = await checkProhibitedContent(textToCheck);

    if (modResult.flagged && modResult.severity === 'auto_reject') {
        return 'rejected';
    }

    if (modResult.flagged && modResult.severity === 'flag_for_review') {
        return 'pending_review';
    }

    // Check if category requires moderation
    const catRepo = AppDataSource.getRepository(ProductCategory);
    const category = await catRepo.findOne({ where: { id: categoryId } });
    if (category?.requires_moderation) {
        return 'pending_review';
    }

    return 'active';
}

async function countSellerListings(userId: string): Promise<number> {
    const repo = AppDataSource.getRepository(Product);
    return repo.count({ where: { seller_id: userId, deleted_at: IsNull() } });
}

export async function getUserForMarketplace(userId: string): Promise<User | null> {
    return AppDataSource.getRepository(User).findOneBy({ id: userId });
}

export async function getSellerProfileByUserId(userId: string): Promise<SellerProfile | null> {
    return AppDataSource.getRepository(SellerProfile).findOne({ where: { user_id: userId } });
}

function assertNotAdminSeller(user: User): void {
    if (user.user_type === 'admin') {
        throw new MarketplaceSellerRuleError('ADMIN_NO_SELLER', 'Tài khoản admin không bán trên marketplace.');
    }
}

export async function assertSellerListingMembershipQuota(user: User): Promise<void> {
    void user;
    return;
}

export function assertSellerStandardProductType(user: User, input: CreateProductInput): void {
    if (user.user_type === 'user' || user.user_type === 'gym_owner') {
        if (input.product_type !== 'physical') {
            throw new MarketplaceSellerRuleError(
                'FORBIDDEN_PRODUCT_TYPE',
                'Tài khoản của bạn chỉ được đăng sản phẩm vật lý trên marketplace.',
            );
        }
    }
}

export function assertSellerTrainingPackageRole(user: User): void {
    if (user.user_type !== 'athlete' && user.user_type !== 'trainer') {
        throw new MarketplaceSellerRuleError(
            'FORBIDDEN_TRAINING_PACKAGE',
            'Chỉ Athlete hoặc Coach mới được đăng gói tập / giáo án.',
        );
    }
}

// ─────────────────────────────────────────────────────────────────────
// SLUG
// ─────────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

async function generateUniqueSlug(title: string, existingId?: string): Promise<string> {
    const repo = AppDataSource.getRepository(Product);
    const base = toSlug(title);
    let slug = base;
    let i = 1;

    while (true) {
        const existing = await repo.findOne({
            where: { slug },
            withDeleted: true,
        });
        if (!existing || existing.id === existingId) break;
        slug = `${base}-${i++}`;
    }

    return slug;
}

// ─────────────────────────────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────────────────────────────

export async function listCategories(): Promise<ProductCategory[]> {
    const repo = AppDataSource.getRepository(ProductCategory);
    return repo.find({
        where: { is_active: true, parent_id: IsNull() },
        relations: ['children'],
        order: { sort_order: 'ASC' },
    });
}

export async function getCategoryBySlug(slug: string): Promise<ProductCategory | null> {
    const repo = AppDataSource.getRepository(ProductCategory);
    return repo.findOne({
        where: { slug, is_active: true },
        relations: ['children', 'parent'],
    });
}

// ─────────────────────────────────────────────────────────────────────
// PRODUCTS — PUBLIC
// ─────────────────────────────────────────────────────────────────────

export async function listProducts(opts: ListProductsOptions = {}): Promise<{
    products: Product[];
    total: number;
    page: number;
    limit: number;
}> {
    const repo = AppDataSource.getRepository(Product);
    const page = Math.max(1, opts.page || 1);
    const limit = Math.min(50, Math.max(1, opts.limit || 20));
    const offset = (page - 1) * limit;

    const qb = repo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.category', 'category')
        .leftJoinAndSelect('p.seller', 'seller')
        .leftJoinAndSelect('p.variants', 'variants', 'variants.is_active = true')
        .where('p.status = :status', { status: 'active' })
        .andWhere('p.deleted_at IS NULL');

    // Category filter — accepts slug
    if (opts.category_slug) {
        qb.andWhere(
            '(category.slug = :slug OR EXISTS (SELECT 1 FROM product_categories pc2 WHERE pc2.id = p.category_id AND pc2.parent_id = (SELECT id FROM product_categories WHERE slug = :slug)))',
            { slug: opts.category_slug },
        );
    }

    if (opts.product_type) {
        qb.andWhere('p.product_type = :product_type', { product_type: opts.product_type });
    }

    if (opts.search) {
        qb.andWhere(
            "(p.title ILIKE :q OR p.description ILIKE :q OR p.tags::text ILIKE :q)",
            { q: `%${opts.search}%` },
        );
    }

    if (opts.min_price !== undefined) {
        qb.andWhere('p.price >= :min_price', { min_price: opts.min_price });
    }

    if (opts.max_price !== undefined) {
        qb.andWhere('p.price <= :max_price', { max_price: opts.max_price });
    }

    // Sort
    switch (opts.sort) {
        case 'price_asc':
            qb.orderBy('p.price', 'ASC');
            break;
        case 'price_desc':
            qb.orderBy('p.price', 'DESC');
            break;
        case 'rating':
            qb.orderBy('p.avg_rating', 'DESC', 'NULLS LAST');
            break;
        case 'newest':
            qb.orderBy('p.created_at', 'DESC');
            break;
        case 'popular':
        default:
            qb.orderBy('p.sale_count', 'DESC').addOrderBy('p.featured_weight', 'DESC');
    }

    const [products, total] = await qb.skip(offset).take(limit).getManyAndCount();

    return { products, total, page, limit };
}

export async function getProductBySlug(slug: string, userId?: string): Promise<Product | null> {
    const repo = AppDataSource.getRepository(Product);
    const product = await repo.findOne({
        where: { slug, status: 'active', deleted_at: IsNull() },
        relations: ['category', 'seller', 'variants', 'training_package'],
    });

    if (!product) return null;

    // Increment view count (fire-and-forget)
    repo.increment({ id: product.id }, 'view_count', 1).catch(() => {});

    return product;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
    const repo = AppDataSource.getRepository(Product);
    return repo.find({
        where: { status: 'active', deleted_at: IsNull() },
        relations: ['category', 'seller'],
        order: { featured_weight: 'DESC', sale_count: 'DESC' },
        take: limit,
    });
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
    const repo = AppDataSource.getRepository(Product);
    return repo.find({
        where: { status: 'active', deleted_at: IsNull() },
        relations: ['category', 'seller'],
        order: { created_at: 'DESC' },
        take: limit,
    });
}

// ─────────────────────────────────────────────────────────────────────
// PRODUCTS — SELLER
// ─────────────────────────────────────────────────────────────────────

export type SellerUpdateProductInput = Partial<CreateProductInput> & {
    category_id?: string;
    status?: 'draft' | 'archived';
};

async function createProductInternal(
    sellerId: string,
    input: CreateProductInput,
): Promise<Product> {
    const repo = AppDataSource.getRepository(Product);

    const status = await determineProductStatus(input, input.category_id, sellerId);
    const slug = await generateUniqueSlug(input.title);

    const product = repo.create({
        seller_id: sellerId,
        category_id: input.category_id,
        title: input.title,
        slug,
        description: input.description,
        product_type: input.product_type,
        price: input.price,
        compare_at_price: input.compare_at_price,
        stock_quantity: input.stock_quantity,
        track_inventory: input.track_inventory ?? false,
        sku: input.sku,
        digital_file_url: input.digital_file_url,
        preview_content: input.preview_content,
        thumbnail_url: input.thumbnail_url,
        gallery: input.gallery,
        attributes: input.attributes,
        tags: input.tags,
        status,
    });

    return repo.save(product);
}

export async function createProduct(
    sellerId: string,
    input: CreateProductInput,
): Promise<Product> {
    const user = await getUserForMarketplace(sellerId);
    if (!user) {
        throw new Error('User not found');
    }
    assertNotAdminSeller(user);
    assertSellerStandardProductType(user, input);
    await assertSellerListingMembershipQuota(user);
    return createProductInternal(sellerId, input);
}

export async function createTrainingPackage(
    sellerId: string,
    input: CreateTrainingPackageInput,
): Promise<{ product: Product; trainingPackage: TrainingPackage }> {
    const user = await getUserForMarketplace(sellerId);
    if (!user) {
        throw new Error('User not found');
    }
    assertNotAdminSeller(user);
    assertSellerTrainingPackageRole(user);
    await assertSellerListingMembershipQuota(user);

    const product = await createProductInternal(sellerId, {
        ...input,
        product_type: 'digital',
    });

    // Create training package details
    const tpRepo = AppDataSource.getRepository(TrainingPackage);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tp = tpRepo.create({
        product_id: product.id,
        goal: input.goal as TrainingPackage['goal'],
        level: input.level as TrainingPackage['level'],
        duration_weeks: input.duration_weeks,
        sessions_per_week: input.sessions_per_week,
        equipment_required: input.equipment_required ?? null,
        includes_nutrition: input.includes_nutrition ?? false,
        includes_video: input.includes_video ?? false,
        // Cast through unknown to satisfy ProgramStructure shape — validated at runtime
        program_structure: (input.program_structure ?? null) as unknown as TrainingPackage['program_structure'],
        preview_weeks: input.preview_weeks ?? 1,
        nutrition_guide: (input.nutrition_guide ?? null) as unknown as TrainingPackage['nutrition_guide'],
    });

    const trainingPackage = await tpRepo.save(tp);
    return { product, trainingPackage };
}

export async function updateProduct(
    productId: string,
    sellerId: string,
    input: SellerUpdateProductInput,
): Promise<Product | null> {
    const repo = AppDataSource.getRepository(Product);
    const product = await repo.findOne({
        where: { id: productId, seller_id: sellerId },
    });

    if (!product) return null;

    if (input.title && input.title !== product.title) {
        product.slug = await generateUniqueSlug(input.title, productId);
        product.title = input.title;
    }

    if (input.category_id !== undefined && input.category_id !== product.category_id) {
        product.category_id = input.category_id;
        const synthetic: CreateProductInput = {
            title: product.title,
            description: product.description ?? undefined,
            category_id: product.category_id,
            product_type: product.product_type,
            price: Number(product.price),
            compare_at_price: product.compare_at_price != null ? Number(product.compare_at_price) : undefined,
            stock_quantity: product.stock_quantity ?? undefined,
            track_inventory: product.track_inventory,
            sku: product.sku ?? undefined,
            digital_file_url: product.digital_file_url ?? undefined,
            preview_content: product.preview_content ?? undefined,
            thumbnail_url: product.thumbnail_url ?? undefined,
            gallery: product.gallery ?? undefined,
            attributes: product.attributes ?? undefined,
            tags: product.tags ?? undefined,
        };
        product.status = await determineProductStatus(synthetic, product.category_id, sellerId);
    }

    Object.assign(product, {
        ...(input.description !== undefined && { description: input.description }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.compare_at_price !== undefined && { compare_at_price: input.compare_at_price }),
        ...(input.stock_quantity !== undefined && { stock_quantity: input.stock_quantity }),
        ...(input.thumbnail_url !== undefined && { thumbnail_url: input.thumbnail_url }),
        ...(input.gallery !== undefined && { gallery: input.gallery }),
        ...(input.attributes !== undefined && { attributes: input.attributes }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.digital_file_url !== undefined && { digital_file_url: input.digital_file_url }),
        ...(input.preview_content !== undefined && { preview_content: input.preview_content }),
        ...(input.product_type !== undefined && { product_type: input.product_type }),
    });

    if (input.status !== undefined && (input.status === 'draft' || input.status === 'archived')) {
        product.status = input.status;
    }

    const owner = await getUserForMarketplace(sellerId);
    if (owner && (owner.user_type === 'user' || owner.user_type === 'gym_owner')) {
        if (product.product_type !== 'physical') {
            throw new MarketplaceSellerRuleError(
                'FORBIDDEN_PRODUCT_TYPE',
                'Tài khoản của bạn chỉ được đăng sản phẩm vật lý trên marketplace.',
            );
        }
    }

    return repo.save(product);
}

export async function getSellerProductById(
    productId: string,
    sellerId: string,
): Promise<Product | null> {
    const repo = AppDataSource.getRepository(Product);
    return repo.findOne({
        where: { id: productId, seller_id: sellerId, deleted_at: IsNull() },
        relations: ['category', 'training_package'],
    });
}

export type UpdateTrainingPackageSellerInput = Partial<
    Pick<
        CreateTrainingPackageInput,
        | 'goal'
        | 'level'
        | 'duration_weeks'
        | 'sessions_per_week'
        | 'equipment_required'
        | 'includes_nutrition'
        | 'includes_video'
        | 'program_structure'
        | 'preview_weeks'
        | 'nutrition_guide'
    >
>;

export async function updateSellerTrainingPackage(
    productId: string,
    sellerId: string,
    input: UpdateTrainingPackageSellerInput,
): Promise<TrainingPackage | null> {
    const product = await AppDataSource.getRepository(Product).findOne({
        where: { id: productId, seller_id: sellerId, deleted_at: IsNull() },
        relations: ['training_package'],
    });
    if (!product?.training_package) {
        return null;
    }

    const tpRepo = AppDataSource.getRepository(TrainingPackage);
    const tp = product.training_package;

    Object.assign(tp, {
        ...(input.goal !== undefined && { goal: input.goal as TrainingPackage['goal'] }),
        ...(input.level !== undefined && { level: input.level as TrainingPackage['level'] }),
        ...(input.duration_weeks !== undefined && { duration_weeks: input.duration_weeks }),
        ...(input.sessions_per_week !== undefined && { sessions_per_week: input.sessions_per_week }),
        ...(input.equipment_required !== undefined && { equipment_required: input.equipment_required }),
        ...(input.includes_nutrition !== undefined && { includes_nutrition: input.includes_nutrition }),
        ...(input.includes_video !== undefined && { includes_video: input.includes_video }),
        ...(input.program_structure !== undefined && {
            program_structure: input.program_structure as unknown as TrainingPackage['program_structure'],
        }),
        ...(input.preview_weeks !== undefined && { preview_weeks: input.preview_weeks }),
        ...(input.nutrition_guide !== undefined && {
            nutrition_guide: input.nutrition_guide as TrainingPackage['nutrition_guide'],
        }),
    });

    return tpRepo.save(tp);
}

export async function listSellerProducts(
    sellerId: string,
    page = 1,
    limit = 20,
): Promise<{ products: Product[]; total: number }> {
    const repo = AppDataSource.getRepository(Product);
    const [products, total] = await repo.findAndCount({
        where: { seller_id: sellerId, deleted_at: IsNull() },
        relations: ['category'],
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
    return { products, total };
}

// ─────────────────────────────────────────────────────────────────────
// SELLER PROFILES
// ─────────────────────────────────────────────────────────────────────

export async function getOrCreateSellerProfile(
    userId: string,
    data: { shop_name: string; business_type: SellerProfile['business_type'] },
): Promise<SellerProfile> {
    const repo = AppDataSource.getRepository(SellerProfile);
    const existing = await repo.findOne({ where: { user_id: userId } });
    if (existing) return existing;

    const slug = await (async () => {
        let base = toSlug(data.shop_name);
        let attempt = base;
        let i = 1;
        while (await repo.findOne({ where: { shop_slug: attempt } })) {
            attempt = `${base}-${i++}`;
        }
        return attempt;
    })();

    const profile = repo.create({
        user_id: userId,
        shop_name: data.shop_name,
        shop_slug: slug,
        business_type: data.business_type,
    });
    return repo.save(profile);
}

export async function getSellerBySlug(slug: string): Promise<SellerProfile | null> {
    const repo = AppDataSource.getRepository(SellerProfile);
    return repo.findOne({
        where: { shop_slug: slug, status: 'active' },
        relations: ['user'],
    });
}

// ─────────────────────────────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────────────────────────────

export async function listProductReviews(
    productId: string,
    page = 1,
    limit = 10,
): Promise<{ reviews: ProductReview[]; total: number }> {
    const repo = AppDataSource.getRepository(ProductReview);
    const [reviews, total] = await repo.findAndCount({
        where: { product_id: productId, is_visible: true },
        relations: ['user'],
        order: { created_at: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
    });
    return { reviews, total };
}

export async function createProductReview(
    productId: string,
    userId: string,
    data: {
        rating: number;
        comment?: string;
        quality_rating?: number;
        value_rating?: number;
        delivery_rating?: number;
    },
): Promise<ProductReview> {
    const repo = AppDataSource.getRepository(ProductReview);

    // Check verified purchase
    const orderItemRepo = AppDataSource.getRepository(ProductOrderItem);
    const purchased = await orderItemRepo
        .createQueryBuilder('oi')
        .innerJoin('oi.order', 'o')
        .where('oi.product_id = :productId', { productId })
        .andWhere('o.buyer_id = :userId', { userId })
        .andWhere('o.status = :status', { status: 'delivered' })
        .getOne();

    const review = repo.create({
        product_id: productId,
        user_id: userId,
        rating: data.rating,
        comment: data.comment,
        quality_rating: data.quality_rating,
        value_rating: data.value_rating,
        delivery_rating: data.delivery_rating,
        is_verified_purchase: Boolean(purchased),
    });

    const saved = await repo.save(review);

    // Update product avg_rating
    await updateProductRating(productId);

    return saved;
}

async function updateProductRating(productId: string): Promise<void> {
    const repo = AppDataSource.getRepository(ProductReview);
    const result = await repo
        .createQueryBuilder('r')
        .select('AVG(r.rating)', 'avg')
        .addSelect('COUNT(r.id)', 'count')
        .where('r.product_id = :productId', { productId })
        .andWhere('r.is_visible = true')
        .getRawOne<{ avg: string; count: string }>();

    const productRepo = AppDataSource.getRepository(Product);
    await productRepo.update(productId, {
        avg_rating: result?.avg ? parseFloat(parseFloat(result.avg).toFixed(2)) : undefined,
        review_count: result?.count ? parseInt(result.count) : 0,
    });
}

// ─────────────────────────────────────────────────────────────────────
// WISHLIST
// ─────────────────────────────────────────────────────────────────────

export async function toggleWishlist(
    userId: string,
    productId: string,
): Promise<{ wishlisted: boolean }> {
    const repo = AppDataSource.getRepository(ProductWishlist);
    const existing = await repo.findOne({ where: { user_id: userId, product_id: productId } });

    if (existing) {
        await repo.remove(existing);
        await AppDataSource.getRepository(Product).decrement({ id: productId }, 'wishlist_count', 1);
        return { wishlisted: false };
    } else {
        await repo.save(repo.create({ user_id: userId, product_id: productId }));
        await AppDataSource.getRepository(Product).increment({ id: productId }, 'wishlist_count', 1);
        return { wishlisted: true };
    }
}

export async function getUserWishlist(userId: string): Promise<ProductWishlist[]> {
    const repo = AppDataSource.getRepository(ProductWishlist);
    return repo.find({
        where: { user_id: userId },
        relations: ['product', 'product.category'],
        order: { created_at: 'DESC' },
    });
}

// ─────────────────────────────────────────────────────────────────────
// ADMIN MODERATION
// ─────────────────────────────────────────────────────────────────────

export async function getModerationQueue(page = 1, limit = 20): Promise<{
    products: Product[];
    total: number;
}> {
    const repo = AppDataSource.getRepository(Product);
    const [products, total] = await repo.findAndCount({
        where: { status: 'pending_review' },
        relations: ['category', 'seller'],
        order: { created_at: 'ASC' },
        skip: (page - 1) * limit,
        take: limit,
    });
    return { products, total };
}

export async function moderateProduct(
    productId: string,
    adminId: string,
    decision: 'approve' | 'reject',
    note?: string,
): Promise<Product | null> {
    const repo = AppDataSource.getRepository(Product);
    const product = await repo.findOne({ where: { id: productId } });
    if (!product) return null;

    product.status = decision === 'approve' ? 'active' : 'rejected';
    product.moderated_by = adminId;
    product.moderated_at = new Date();
    product.moderation_note = note ?? null;

    return repo.save(product);
}
