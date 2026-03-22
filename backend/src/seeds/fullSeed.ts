import 'reflect-metadata';
import bcrypt from 'bcryptjs';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Message } from '../entities/Message';
import { TrainerProfile } from '../entities/TrainerProfile';
import { TrainerExperience } from '../entities/TrainerExperience';
import { TrainerSkill } from '../entities/TrainerSkill';
import { TrainerPackage } from '../entities/TrainerPackage';
import { TrainerProfileHighlight } from '../entities/TrainerProfileHighlight';
import { TrainerGallery } from '../entities/TrainerGallery';
import { Testimonial } from '../entities/Testimonial';
import { BeforeAfterPhoto } from '../entities/BeforeAfterPhoto';
import { Program } from '../entities/Program';
import { ProgressPhoto } from '../entities/ProgressPhoto';
import { AthleteAchievement } from '../entities/AthleteAchievement';
import { GymCenter } from '../entities/GymCenter';
import { GymBranch } from '../entities/GymBranch';
import { GymAmenity } from '../entities/GymAmenity';
import { GymEquipment } from '../entities/GymEquipment';
import { GymPricing } from '../entities/GymPricing';
import { GymGallery } from '../entities/GymGallery';
import { GymTaxonomyTerm } from '../entities/GymTaxonomyTerm';
import { GymCenterTaxonomyTerm } from '../entities/GymCenterTaxonomyTerm';
import { GymZone } from '../entities/GymZone';
import { GymProgram } from '../entities/GymProgram';
import { GymProgramSession } from '../entities/GymProgramSession';
import { GymLeadRoute } from '../entities/GymLeadRoute';
import { GymReview } from '../entities/GymReview';
import { GymTrainerLink } from '../entities/GymTrainerLink';
import { CommunityGallery } from '../entities/CommunityGallery';
import { SellerProfile } from '../entities/SellerProfile';
import { ProductCategory } from '../entities/ProductCategory';
import { Product } from '../entities/Product';
import { ProductVariant } from '../entities/ProductVariant';
import { TrainingPackage } from '../entities/TrainingPackage';
import { ProductOrder } from '../entities/ProductOrder';
import { ProductOrderItem } from '../entities/ProductOrderItem';
import { ProductReview } from '../entities/ProductReview';
import { ProductWishlist } from '../entities/ProductWishlist';
import { UserProfileSection } from '../entities/UserProfileSection';
import { UserProfileTerm } from '../entities/UserProfileTerm';
import { UserProfileTermSelection } from '../entities/UserProfileTermSelection';
import { buildMockDataset } from './mock-v2/buildMockDataset';
import { assertDatasetIntegrity } from './mock-v2/integrity';
import { validateSeedImagesOrThrow } from './mock-v2/imageValidation';
import { GYM_TAXONOMY_SEEDS, PRODUCT_CATEGORY_SEEDS, USER_PROFILE_CATALOG_SEEDS } from './mock-v2/referenceCatalog';
import type { MockCoachRecord, MockDataset, MockGymRecord, MockProductRecord } from './mock-v2/types';

const PASS = 'Demo@123456';
const PRESERVED_TABLES = new Set([
    'product_categories',
    'gym_taxonomy_terms',
    'user_profile_sections',
    'user_profile_terms',
    'prohibited_keywords',
    'revenue_tiers',
    'app_settings',
    'exercises',
]);

type AdminSnapshot = Pick<
    User,
    | 'id'
    | 'email'
    | 'password'
    | 'full_name'
    | 'is_email_verified'
    | 'onboarding_completed'
    | 'user_type'
    | 'is_active'
    | 'gym_owner_status'
    | 'avatar_url'
    | 'bio'
    | 'height_cm'
    | 'current_weight_kg'
    | 'experience_level'
    | 'specialties'
    | 'base_price_monthly'
    | 'is_verified'
    | 'marketplace_membership_active'
    | 'slug'
    | 'city'
    | 'avg_rating'
    | 'profile_view_count'
>;

function assertSeedEnvironment(): void {
    const nodeEnv = (process.env.NODE_ENV ?? 'development').toLowerCase();
    const allowDestructive = process.env.ALLOW_DESTRUCTIVE_SEED === 'true';
    const safeEnvs = new Set(['development', 'dev', 'local', 'test', 'demo']);

    if (nodeEnv === 'production' && !allowDestructive) {
        throw new Error('Refusing destructive seed in production. Set ALLOW_DESTRUCTIVE_SEED=true only if you really mean it.');
    }

    if (!safeEnvs.has(nodeEnv) && !allowDestructive) {
        throw new Error(`Refusing destructive seed in NODE_ENV=${nodeEnv}. Set ALLOW_DESTRUCTIVE_SEED=true to override intentionally.`);
    }
}

function snapshotAdmins(admins: User[]): AdminSnapshot[] {
    return admins.map((admin) => ({
        id: admin.id,
        email: admin.email,
        password: admin.password,
        full_name: admin.full_name,
        is_email_verified: admin.is_email_verified,
        onboarding_completed: admin.onboarding_completed,
        user_type: admin.user_type,
        is_active: admin.is_active,
        gym_owner_status: admin.gym_owner_status,
        avatar_url: admin.avatar_url,
        bio: admin.bio,
        height_cm: admin.height_cm,
        current_weight_kg: admin.current_weight_kg,
        experience_level: admin.experience_level,
        specialties: admin.specialties,
        base_price_monthly: admin.base_price_monthly,
        is_verified: admin.is_verified,
        marketplace_membership_active: admin.marketplace_membership_active,
        slug: admin.slug,
        city: admin.city,
        avg_rating: admin.avg_rating,
        profile_view_count: admin.profile_view_count,
    }));
}

async function hardResetContent(): Promise<User> {
    const userRepo = AppDataSource.getRepository(User);
    const adminSnapshots = snapshotAdmins(await userRepo.findBy({ user_type: 'admin' }));

    const tableNames = [...new Set(AppDataSource.entityMetadatas.map((meta) => meta.tableName))]
        .filter((tableName) => !PRESERVED_TABLES.has(tableName));

    if (tableNames.length > 0) {
        await AppDataSource.query(`TRUNCATE TABLE ${tableNames.map((tableName) => `"${tableName}"`).join(', ')} RESTART IDENTITY CASCADE`);
    }

    const adminRepo = AppDataSource.getRepository(User);
    if (adminSnapshots.length > 0) {
        const restored = await adminRepo.save(adminSnapshots.map((snapshot) => adminRepo.create(snapshot)));
        return restored[0];
    }

    const hashed = await bcrypt.hash(PASS, 10);
    return adminRepo.save(adminRepo.create({
        email: `admin@seed.gymerviet.demo`,
        password: hashed,
        full_name: 'GYMERVIET Admin',
        is_email_verified: true,
        onboarding_completed: true,
        user_type: 'admin',
        is_active: true,
        is_verified: true,
        marketplace_membership_active: false,
        profile_view_count: 0,
    }));
}

async function ensureReferenceCatalogs(): Promise<{
    categoryBySlug: Map<string, ProductCategory>;
    taxonomyBySlug: Map<string, GymTaxonomyTerm>;
    termBySectionAndSlug: Map<string, UserProfileTerm>;
}> {
    const categoryRepo = AppDataSource.getRepository(ProductCategory);
    const taxonomyRepo = AppDataSource.getRepository(GymTaxonomyTerm);
    const sectionRepo = AppDataSource.getRepository(UserProfileSection);
    const termRepo = AppDataSource.getRepository(UserProfileTerm);

    for (const seed of PRODUCT_CATEGORY_SEEDS) {
        const existing = await categoryRepo.findOneBy({ slug: seed.slug });
        if (existing) {
            existing.label = seed.label;
            existing.icon_emoji = seed.icon_emoji;
            existing.product_type = seed.product_type;
            existing.sort_order = seed.sort_order;
            existing.requires_moderation = seed.requires_moderation ?? false;
            existing.is_active = true;
            await categoryRepo.save(existing);
        } else {
            await categoryRepo.save(categoryRepo.create({
                slug: seed.slug,
                label: seed.label,
                icon_emoji: seed.icon_emoji,
                product_type: seed.product_type,
                sort_order: seed.sort_order,
                requires_moderation: seed.requires_moderation ?? false,
                is_active: true,
            }));
        }
    }

    for (const seed of GYM_TAXONOMY_SEEDS) {
        const existing = await taxonomyRepo.findOneBy({ slug: seed.slug });
        if (existing) {
            existing.label = seed.label;
            existing.term_type = seed.term_type;
            existing.sort_order = seed.sort_order;
            existing.is_active = true;
            await taxonomyRepo.save(existing);
        } else {
            await taxonomyRepo.save(taxonomyRepo.create({
                slug: seed.slug,
                label: seed.label,
                term_type: seed.term_type,
                sort_order: seed.sort_order,
                is_active: true,
            }));
        }
    }

    for (const sectionSeed of USER_PROFILE_CATALOG_SEEDS) {
        let section = await sectionRepo.findOneBy({ slug: sectionSeed.section.slug });
        if (!section) {
            section = sectionRepo.create(sectionSeed.section);
        } else {
            Object.assign(section, sectionSeed.section, { is_active: true });
        }
        section = await sectionRepo.save(section);

        for (const termSeed of sectionSeed.terms) {
            const existing = await termRepo.findOne({ where: { section_id: section.id, slug: termSeed.slug } });
            if (existing) {
                existing.label_vi = termSeed.label_vi;
                existing.sort_order = termSeed.sort_order;
                existing.is_active = true;
                await termRepo.save(existing);
            } else {
                await termRepo.save(termRepo.create({
                    section_id: section.id,
                    slug: termSeed.slug,
                    label_vi: termSeed.label_vi,
                    sort_order: termSeed.sort_order,
                    is_active: true,
                }));
            }
        }
    }

    const categories = await categoryRepo.find();
    const taxonomy = await taxonomyRepo.find();
    const terms = await termRepo.find({ relations: { section: true } });

    return {
        categoryBySlug: new Map(categories.map((item) => [item.slug, item])),
        taxonomyBySlug: new Map(taxonomy.map((item) => [item.slug, item])),
        termBySectionAndSlug: new Map(terms.map((item) => [`${item.section.slug}:${item.slug}`, item])),
    };
}

function computeProductStats(dataset: MockDataset): Map<string, { saleCount: number; wishlistCount: number; reviewCount: number; avgRating: number | null }> {
    const stats = new Map<string, { saleCount: number; wishlistCount: number; reviewCount: number; avgRating: number | null }>();

    dataset.products.forEach((product) => {
        stats.set(product.key, { saleCount: 0, wishlistCount: 0, reviewCount: 0, avgRating: null });
    });

    dataset.wishlists.forEach((wishlist) => {
        const entry = stats.get(wishlist.product_key);
        if (entry) entry.wishlistCount += 1;
    });

    const ratingBuckets = new Map<string, number[]>();
    dataset.productReviews.forEach((review) => {
        const bucket = ratingBuckets.get(review.product_key) ?? [];
        bucket.push(review.rating);
        ratingBuckets.set(review.product_key, bucket);
    });

    dataset.productOrders.forEach((order) => {
        if (order.status === 'cancelled' || order.status === 'refunded') return;
        order.items.forEach((item) => {
            const entry = stats.get(item.product_key);
            if (entry) entry.saleCount += item.quantity;
        });
    });

    ratingBuckets.forEach((ratings, productKey) => {
        const entry = stats.get(productKey);
        if (!entry) return;
        entry.reviewCount = ratings.length;
        entry.avgRating = ratings.length ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)) : null;
    });

    return stats;
}

function computeSellerStats(dataset: MockDataset, productStats: Map<string, { saleCount: number; wishlistCount: number; reviewCount: number; avgRating: number | null }>): Map<string, { totalOrders: number; totalRevenue: number; avgRating: number | null }> {
    const productByKey = new Map(dataset.products.map((product) => [product.key, product]));
    const shopOrders = new Map<string, Set<string>>();
    const shopRevenue = new Map<string, number>();
    const shopRatings = new Map<string, number[]>();

    dataset.productOrders.forEach((order) => {
        if (order.status === 'cancelled' || order.status === 'refunded') return;
        order.items.forEach((item) => {
            const product = productByKey.get(item.product_key);
            if (!product) return;
            const unitPrice = product.variants.find((variant) => variant.sku === item.variant_sku)?.price ?? product.price;
            const orderSet = shopOrders.get(product.shop_key) ?? new Set<string>();
            orderSet.add(order.order_number);
            shopOrders.set(product.shop_key, orderSet);
            shopRevenue.set(product.shop_key, (shopRevenue.get(product.shop_key) ?? 0) + unitPrice * item.quantity);
        });
    });

    dataset.products.forEach((product) => {
        const stat = productStats.get(product.key);
        if (!stat?.avgRating) return;
        const bucket = shopRatings.get(product.shop_key) ?? [];
        for (let index = 0; index < stat.reviewCount; index += 1) {
            bucket.push(stat.avgRating);
        }
        shopRatings.set(product.shop_key, bucket);
    });

    const result = new Map<string, { totalOrders: number; totalRevenue: number; avgRating: number | null }>();
    dataset.shops.forEach((shop) => {
        const ratings = shopRatings.get(shop.key) ?? [];
        result.set(shop.key, {
            totalOrders: shopOrders.get(shop.key)?.size ?? 0,
            totalRevenue: shopRevenue.get(shop.key) ?? 0,
            avgRating: ratings.length ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)) : null,
        });
    });
    return result;
}

function resolveHealthGoals(record: { user_type: string; specialties?: string[] | null; onboarding_goals?: string[] | null }): string[] {
    if (record.user_type === 'user' && record.onboarding_goals?.length) {
        return record.onboarding_goals.slice(0, 3);
    }

    const specialtyText = (record.specialties ?? []).join(' ').toLowerCase();
    const resolved = new Set<string>();
    if (/rehab|recovery|mobility/.test(specialtyText)) resolved.add('rehab');
    if (/pilates|yoga|mobility/.test(specialtyText)) resolved.add('mobility');
    if (/hypertrophy|strength|powerlifting|bodyweight|calisthenics/.test(specialtyText)) resolved.add('muscle_gain');
    if (/running|endurance|hybrid|conditioning/.test(specialtyText)) resolved.add('competition');
    if (/boxing|fat loss|recomp/.test(specialtyText)) resolved.add('fat_loss');
    if (resolved.size === 0) resolved.add('general_health');
    return [...resolved].slice(0, 3);
}

function resolveCoachSpecialties(record: { specialties?: string[] | null }): string[] {
    const specialtyText = (record.specialties ?? []).join(' ').toLowerCase();
    const resolved = new Set<string>();
    if (/pilates/.test(specialtyText)) resolved.add('pilates');
    if (/yoga/.test(specialtyText)) resolved.add('yoga');
    if (/powerlifting|strength/.test(specialtyText)) resolved.add('powerlifting');
    if (/bodyweight|calisthenics/.test(specialtyText)) resolved.add('calisthenics');
    if (/running|endurance|hybrid|conditioning/.test(specialtyText)) resolved.add('endurance');
    if (/rehab|recovery|mobility/.test(specialtyText)) resolved.add('rehab');
    if (/hypertrophy|body recomp/.test(specialtyText)) resolved.add('muscle');
    if (resolved.size === 0) resolved.add('fat_loss');
    return [...resolved].slice(0, 4);
}

async function seedUserProfiles(
    dataset: MockDataset,
    userByKey: Map<string, User>,
    adminUser: User,
    termBySectionAndSlug: Map<string, UserProfileTerm>,
): Promise<Map<string, TrainerGallery[]>> {
    const profileRepo = AppDataSource.getRepository(TrainerProfile);
    const experienceRepo = AppDataSource.getRepository(TrainerExperience);
    const skillRepo = AppDataSource.getRepository(TrainerSkill);
    const packageRepo = AppDataSource.getRepository(TrainerPackage);
    const highlightRepo = AppDataSource.getRepository(TrainerProfileHighlight);
    const galleryRepo = AppDataSource.getRepository(TrainerGallery);
    const testimonialRepo = AppDataSource.getRepository(Testimonial);
    const beforeAfterRepo = AppDataSource.getRepository(BeforeAfterPhoto);
    const programRepo = AppDataSource.getRepository(Program);
    const progressPhotoRepo = AppDataSource.getRepository(ProgressPhoto);
    const athleteAchievementRepo = AppDataSource.getRepository(AthleteAchievement);
    const termSelectionRepo = AppDataSource.getRepository(UserProfileTermSelection);

    const galleryMap = new Map<string, TrainerGallery[]>();

    const profileRecords = [...dataset.coaches, ...dataset.athletes];
    for (const record of profileRecords) {
        const user = userByKey.get(record.key);
        if (!user) continue;

        const isCoach = record.user_type === 'trainer';
        const profile = await profileRepo.save(profileRepo.create({
            trainer_id: user.id,
            slug: record.slug,
            profile_template: isCoach ? 'hero' : 'card',
            cover_image_url: record.cover_image_url,
            headline: record.headline,
            bio_short: record.bio_short,
            bio_long: record.bio_long,
            years_experience: record.years_experience,
            clients_trained: isCoach ? (record as MockCoachRecord).clients_trained : 0,
            success_stories: isCoach ? (record as MockCoachRecord).success_stories : (record.achievements?.length ?? 0),
            certifications: record.experiences.filter((item) => item.experience_type === 'certification').map((item) => ({
                name: item.title,
                issuer: item.organization,
                year: Number(item.start_date.slice(0, 4)),
            })),
            awards: record.experiences.filter((item) => item.experience_type === 'achievement').map((item) => ({
                name: item.title,
                organization: item.organization,
                year: Number(item.start_date.slice(0, 4)),
            })),
            phone: `+84 90${user.profile_view_count.toString().padStart(6, '0')}`,
            location: `${record.district}, ${record.city}`,
            timezone: 'Asia/Ho_Chi_Minh',
            social_links: record.social_links,
            languages: record.languages,
            is_accepting_clients: isCoach ? record.is_accepting_clients : true,
            theme_color: '#51504a',
            is_profile_public: true,
            profile_tagline: record.profile_tagline,
            profile_theme_variant: 'brand-light',
            hero_badges: [
                { label: user.is_verified ? 'Đã xác minh' : 'Hồ sơ công khai', icon_key: 'shield-check' },
                { label: record.specialties[0], icon_key: 'sparkles' },
            ],
            key_metrics: isCoach
                ? [
                    { label: 'Học viên', value: `${(record as MockCoachRecord).clients_trained}+` },
                    { label: 'Kinh nghiệm', value: `${record.years_experience} năm` },
                    { label: 'Case tiến bộ', value: `${(record as MockCoachRecord).success_stories}` },
                ]
                : [
                    { label: 'Kinh nghiệm', value: `${record.years_experience} năm` },
                    { label: 'Thành tích', value: `${record.achievements.length}` },
                    { label: 'Ảnh hành trình', value: `${record.progress_photos.length}` },
                ],
            cta_config: isCoach
                ? { primary_label: 'Nhắn tin', secondary_label: 'Xem gói tập' }
                : { primary_label: 'Nhắn tin', secondary_label: 'Xem hành trình' },
            section_order: isCoach
                ? ['hero', 'services', 'gallery', 'experience', 'packages', 'testimonials', 'contact']
                : ['hero', 'about', 'achievements', 'gallery', 'progress', 'contact'],
            is_featured_profile: user.is_verified,
        }));

        await experienceRepo.save(record.experiences.map((item) => experienceRepo.create({
            trainer_id: user.id,
            title: item.title,
            organization: item.organization,
            location: item.location ?? null,
            experience_type: item.experience_type,
            start_date: item.start_date,
            end_date: item.end_date ?? null,
            is_current: item.is_current ?? false,
            description: item.description ?? null,
            achievements: 'achievements' in item ? item.achievements ?? null : null,
        })));

        await packageRepo.save(record.packages.map((item, index) => packageRepo.create({
            trainer_id: user.id,
            name: item.name,
            description: item.description,
            duration_months: item.duration_months,
            sessions_per_week: item.sessions_per_week,
            price: item.price,
            features: item.features,
            is_popular: item.is_popular,
            is_active: true,
            order_number: index,
        })));

        const galleries = await galleryRepo.save(record.gallery.map((item, index) => galleryRepo.create({
            trainer_id: user.id,
            image_url: item.image_url,
            caption: item.caption,
            image_type: item.image_type === 'transformation' ? 'transformation' : item.image_type === 'event' ? 'event' : item.image_type === 'certificate' ? 'certificate' : item.image_type === 'other' ? 'other' : 'workout',
            order_number: index,
        })));
        galleryMap.set(record.key, galleries);

        if (isCoach) {
            const coach = record as MockCoachRecord;
            await skillRepo.save(coach.skills.map((item, index) => skillRepo.create({
                trainer_id: user.id,
                name: item.name,
                level: item.level,
                category: item.category,
                order_number: index,
            })));

            await highlightRepo.save(coach.highlights.map((item, index) => highlightRepo.create({
                trainer_id: user.id,
                title: item.title,
                value: item.value,
                icon_key: item.icon_key,
                order_number: index,
                is_active: true,
            })));

            await testimonialRepo.save(coach.testimonials.map((item) => testimonialRepo.create({
                trainer_id: user.id,
                client_name: item.client_name,
                client_avatar: item.client_avatar,
                rating: item.rating,
                comment: item.comment,
                result_achieved: item.result_achieved,
                is_featured: item.is_featured,
                is_approved: true,
            })));

            await beforeAfterRepo.save(beforeAfterRepo.create({
                trainer_id: user.id,
                before_url: coach.before_after.before_url,
                after_url: coach.before_after.after_url,
                client_name: coach.before_after.client_name,
                story: coach.before_after.story,
                duration_weeks: coach.before_after.duration_weeks,
                is_approved: true,
            }));

            await programRepo.save(coach.programs.map((item) => programRepo.create({
                trainer_id: user.id,
                name: item.name,
                description: item.description,
                duration_weeks: item.duration_weeks,
                difficulty: item.difficulty,
                equipment_needed: item.equipment_needed,
                price_monthly: item.price_monthly ?? null,
                price_one_time: item.price_one_time ?? null,
                training_format: item.training_format,
                included_features: item.included_features,
                pricing_type: item.pricing_type,
                training_goals: item.training_goals,
                prerequisites: item.prerequisites ?? null,
                cover_image_url: item.cover_image_url,
                is_published: true,
                max_clients: item.max_clients,
                current_clients: item.current_clients,
            })));
        } else {
            await progressPhotoRepo.save(record.progress_photos.map((item) => progressPhotoRepo.create({
                user_id: user.id,
                image_url: item.image_url,
                caption: item.caption,
                taken_at: item.taken_at,
                weight_kg: item.weight_kg,
            })));

            await athleteAchievementRepo.save(record.achievements.map((item) => athleteAchievementRepo.create({
                athlete_id: user.id,
                achievement_title: item.achievement_title,
                competition_name: item.competition_name,
                organizing_body: item.organizing_body,
                achievement_level: item.achievement_level,
                achievement_date: item.achievement_date,
                certificate_image_url: item.certificate_image_url,
                medal_type: item.medal_type,
                proof_url: item.proof_url ?? null,
                status: 'APPROVED',
                admin_id: adminUser.id,
                verification_notes: item.verification_notes,
                verified_at: new Date(item.achievement_date),
            })));
        }

        const goalSlugs = resolveHealthGoals(record);
        const specialtySlugs = record.user_type === 'trainer' || record.user_type === 'athlete' ? resolveCoachSpecialties(record) : [];
        const selectionTerms = [
            ...goalSlugs.map((slug) => termBySectionAndSlug.get(`health_goals:${slug}`)).filter(Boolean),
            ...specialtySlugs.map((slug) => termBySectionAndSlug.get(`coach_specialties:${slug}`)).filter(Boolean),
        ];

        if (selectionTerms.length > 0) {
            await termSelectionRepo.save(selectionTerms.map((term) => termSelectionRepo.create({
                user_id: user.id,
                term_id: term!.id,
            })));
        }
    }

    return galleryMap;
}

async function seedGyms(
    dataset: MockDataset,
    userByKey: Map<string, User>,
    taxonomyBySlug: Map<string, GymTaxonomyTerm>,
): Promise<void> {
    const centerRepo = AppDataSource.getRepository(GymCenter);
    const branchRepo = AppDataSource.getRepository(GymBranch);
    const taxonomyLinkRepo = AppDataSource.getRepository(GymCenterTaxonomyTerm);
    const zoneRepo = AppDataSource.getRepository(GymZone);
    const galleryRepo = AppDataSource.getRepository(GymGallery);
    const amenityRepo = AppDataSource.getRepository(GymAmenity);
    const equipmentRepo = AppDataSource.getRepository(GymEquipment);
    const pricingRepo = AppDataSource.getRepository(GymPricing);
    const programRepo = AppDataSource.getRepository(GymProgram);
    const sessionRepo = AppDataSource.getRepository(GymProgramSession);
    const leadRouteRepo = AppDataSource.getRepository(GymLeadRoute);
    const trainerLinkRepo = AppDataSource.getRepository(GymTrainerLink);
    const reviewRepo = AppDataSource.getRepository(GymReview);

    for (const gym of dataset.gyms) {
        const owner = userByKey.get(gym.owner_key);
        if (!owner) continue;

        const membershipPlan = gym.pricing.find((item) => item.plan_type === 'membership') ?? gym.pricing[0];
        const center = await centerRepo.save(centerRepo.create({
            owner_id: owner.id,
            name: gym.name,
            slug: gym.slug,
            logo_url: gym.logo_url,
            cover_image_url: gym.cover_image_url,
            description: gym.description,
            tagline: gym.tagline,
            founded_year: gym.founded_year,
            total_area_sqm: gym.total_area_sqm,
            total_equipment_count: gym.total_equipment_count,
            highlights: gym.highlights,
            social_links: gym.social_links,
            is_verified: gym.is_verified,
            is_active: true,
            view_count: 160 + gym.total_equipment_count,
            primary_venue_type_slug: gym.primary_venue_type_slug,
            price_from_amount: membershipPlan.price,
            price_from_billing_cycle: membershipPlan.billing_cycle,
            positioning_tier: gym.positioning_tier,
            beginner_friendly: gym.beginner_friendly,
            women_friendly: gym.women_friendly,
            family_friendly: gym.family_friendly,
            athlete_friendly: gym.athlete_friendly,
            recovery_focused: gym.recovery_focused,
            discovery_blurb: gym.discovery_blurb,
            hero_value_props: gym.hero_value_props,
            profile_completeness_score: gym.profile_completeness_score,
            response_sla_text: gym.response_sla_text,
            default_primary_cta: gym.default_primary_cta,
            default_secondary_cta: gym.default_secondary_cta,
            featured_weight: gym.featured_weight,
            deleted_at: null,
        }));

        await taxonomyLinkRepo.save(gym.taxonomy_slugs.map((slug, index) => taxonomyLinkRepo.create({
            gym_center_id: center.id,
            term_id: taxonomyBySlug.get(slug)?.id,
            is_primary: index === 0,
            sort_order: index,
        })).filter((item) => !!item.term_id));

        const branch = await branchRepo.save(branchRepo.create({
            gym_center_id: center.id,
            branch_name: gym.branch.branch_name,
            description: gym.branch.description,
            manager_name: gym.branch.manager_name,
            address: gym.address,
            district: gym.district,
            city: gym.city,
            phone: gym.branch.phone,
            email: gym.branch.email,
            latitude: gym.branch.latitude,
            longitude: gym.branch.longitude,
            google_maps_embed_url: null,
            opening_hours: gym.branch.opening_hours,
            is_active: true,
            view_count: 120 + gym.total_equipment_count,
            neighborhood_label: gym.branch.neighborhood_label,
            parking_summary: gym.branch.parking_summary,
            locker_summary: gym.branch.locker_summary,
            shower_summary: gym.branch.shower_summary,
            towel_service_summary: gym.branch.towel_service_summary,
            crowd_level_summary: gym.branch.crowd_level_summary,
            best_visit_time_summary: gym.branch.best_visit_time_summary,
            accessibility_summary: gym.branch.accessibility_summary,
            women_only_summary: gym.branch.women_only_summary ?? null,
            child_friendly_summary: gym.branch.child_friendly_summary ?? null,
            check_in_instructions: gym.branch.check_in_instructions,
            branch_tagline: gym.branch.branch_tagline,
            whatsapp_number: gym.branch.whatsapp_number,
            messenger_url: gym.branch.messenger_url,
            consultation_phone: gym.branch.consultation_phone,
            cover_media_id: null,
            branch_status_badges: gym.branch.branch_status_badges,
        }));

        const zones = await zoneRepo.save(gym.zones.map((item) => zoneRepo.create({
            branch_id: branch.id,
            zone_type: item.zone_type,
            name: item.name,
            description: item.description,
            capacity: item.capacity,
            area_sqm: item.area_sqm,
            booking_required: item.booking_required,
            temperature_mode: item.temperature_mode ?? null,
            sound_profile: item.sound_profile ?? null,
            natural_light_score: item.natural_light_score ?? null,
            is_signature_zone: item.is_signature_zone ?? false,
            sort_order: item.sort_order,
            is_active: true,
        })));
        const zoneByName = new Map(zones.map((item) => [item.name, item]));

        const gallery = await galleryRepo.save(gym.gallery.map((item, index) => galleryRepo.create({
            branch_id: branch.id,
            image_url: item.image_url,
            caption: item.caption,
            image_type: item.image_type,
            order_number: index,
            media_role: item.media_role,
            zone_id: null,
            alt_text: item.alt_text,
            is_hero: item.is_hero,
            is_listing_thumb: item.is_listing_thumb,
            is_featured: item.is_featured,
            orientation: item.orientation,
        })));
        branch.cover_media_id = gallery[0]?.id ?? null;
        await branchRepo.save(branch);

        await amenityRepo.save(gym.amenities.map((item) => amenityRepo.create({
            branch_id: branch.id,
            name: item.name,
            note: item.note,
            is_available: true,
        })));

        await equipmentRepo.save(gym.equipment.map((item) => equipmentRepo.create({
            branch_id: branch.id,
            category: item.category,
            name: item.name,
            quantity: item.quantity,
            brand: item.brand ?? null,
            is_available: true,
        })));

        await pricingRepo.save(gym.pricing.map((item) => pricingRepo.create({
            branch_id: branch.id,
            plan_name: item.plan_name,
            price: item.price,
            billing_cycle: item.billing_cycle,
            description: item.description,
            is_highlighted: item.is_highlighted,
            order_number: item.order_number,
            plan_type: item.plan_type,
            access_scope: item.access_scope,
            included_services: item.included_services,
            class_credits: item.class_credits ?? null,
            session_count: item.session_count ?? null,
            trial_available: item.trial_available,
            trial_price: item.trial_price ?? null,
            joining_fee: item.joining_fee ?? null,
            deposit_amount: item.deposit_amount ?? null,
            freeze_policy_summary: item.freeze_policy_summary ?? null,
            cancellation_policy_summary: item.cancellation_policy_summary ?? null,
            validity_days: item.validity_days ?? null,
            peak_access_rule: item.peak_access_rule ?? null,
            supports_multi_branch: item.supports_multi_branch ?? false,
            highlighted_reason: item.highlighted_reason ?? null,
        })));

        for (const template of gym.program_templates) {
            const program = await programRepo.save(programRepo.create({
                branch_id: branch.id,
                zone_id: template.zone_name ? zoneByName.get(template.zone_name)?.id ?? null : null,
                trainer_id: template.trainer_key ? userByKey.get(template.trainer_key)?.id ?? null : null,
                title: template.title,
                program_type: template.program_type,
                level: template.level,
                description: template.description,
                duration_minutes: template.duration_minutes,
                capacity: template.capacity,
                language_code: 'vi',
                equipment_required: template.equipment_required ?? null,
                booking_mode: template.booking_mode,
                is_active: true,
            }));

            await sessionRepo.save(template.sessions.map((item) => sessionRepo.create({
                program_id: program.id,
                starts_at: item.starts_at,
                ends_at: item.ends_at,
                seats_total: item.seats_total,
                seats_remaining: item.seats_remaining,
                waitlist_enabled: item.waitlist_enabled ?? false,
                session_note: item.session_note ?? null,
                is_cancelled: false,
            })));
        }

        await leadRouteRepo.save(gym.lead_routes.map((item) => leadRouteRepo.create({
            branch_id: branch.id,
            inquiry_type: item.inquiry_type,
            primary_channel: item.primary_channel,
            fallback_channel: item.fallback_channel ?? null,
            phone: item.primary_channel === 'phone' ? gym.branch.consultation_phone : gym.branch.phone,
            whatsapp: item.primary_channel === 'whatsapp' ? gym.branch.whatsapp_number : null,
            messenger_url: item.primary_channel === 'messenger' || item.fallback_channel === 'messenger' ? gym.branch.messenger_url : null,
            email: branch.email,
            owner_user_id: owner.id,
            active_hours: {
                mon: { from: '08:00', to: '20:00' },
                tue: { from: '08:00', to: '20:00' },
                wed: { from: '08:00', to: '20:00' },
                thu: { from: '08:00', to: '20:00' },
                fri: { from: '08:00', to: '20:00' },
            },
            auto_prefill_message: item.auto_prefill_message,
            is_active: true,
        })));

        await trainerLinkRepo.save(gym.linked_trainer_keys.map((trainerKey, index) => {
            const trainer = userByKey.get(trainerKey);
            if (!trainer) return null;
            return trainerLinkRepo.create({
                branch_id: branch.id,
                gym_center_id: center.id,
                trainer_id: trainer.id,
                status: 'active',
                role_at_gym: index === 0 ? 'Lead trainer' : 'Resident coach',
                linked_at: new Date('2026-01-15T09:00:00+07:00'),
                specialization_summary: trainer.specialties?.slice(0, 2).join(' · ') ?? null,
                featured_at_branch: index === 0,
                accepts_private_clients: true,
                branch_intro: 'Có mặt thường xuyên ở sàn tập và phản hồi khá nhanh khi khách hỏi kỹ hơn.',
                languages: ['vi'],
                visible_order: index,
            });
        }).filter(Boolean) as GymTrainerLink[]);

        await reviewRepo.save(gym.review_templates.map((item) => reviewRepo.create({
            branch_id: branch.id,
            user_id: userByKey.get(item.reviewer_key)?.id,
            rating: item.rating,
            comment: item.comment,
            verified_via_subscription_id: null,
            is_visible: true,
            reply_text: item.reply_text,
            replied_by_id: owner.id,
            replied_at: new Date('2026-03-10T11:00:00+07:00'),
            equipment_rating: item.equipment_rating,
            cleanliness_rating: item.cleanliness_rating,
            coaching_rating: item.coaching_rating,
            atmosphere_rating: item.atmosphere_rating,
            value_rating: item.value_rating,
            crowd_rating: item.crowd_rating,
            visit_type: item.visit_type,
            is_verified_visit: item.is_verified_visit,
        })).filter((entity) => !!entity.user_id));
    }
}

async function seedMarketplace(
    dataset: MockDataset,
    adminUser: User,
    userByKey: Map<string, User>,
    categoryBySlug: Map<string, ProductCategory>,
    trainerGalleryByKey: Map<string, TrainerGallery[]>,
): Promise<void> {
    const sellerRepo = AppDataSource.getRepository(SellerProfile);
    const productRepo = AppDataSource.getRepository(Product);
    const variantRepo = AppDataSource.getRepository(ProductVariant);
    const trainingPackageRepo = AppDataSource.getRepository(TrainingPackage);
    const orderRepo = AppDataSource.getRepository(ProductOrder);
    const orderItemRepo = AppDataSource.getRepository(ProductOrderItem);
    const reviewRepo = AppDataSource.getRepository(ProductReview);
    const wishlistRepo = AppDataSource.getRepository(ProductWishlist);
    const communityRepo = AppDataSource.getRepository(CommunityGallery);

    const productStats = computeProductStats(dataset);
    const sellerStats = computeSellerStats(dataset, productStats);

    const sellerByKey = new Map<string, SellerProfile>();
    for (const shop of dataset.shops) {
        const owner = userByKey.get(shop.owner_key);
        const stats = sellerStats.get(shop.key);
        if (!owner) continue;
        const seller = await sellerRepo.save(sellerRepo.create({
            user_id: owner.id,
            shop_name: shop.shop_name,
            shop_slug: shop.shop_slug,
            shop_description: shop.shop_description,
            shop_logo_url: shop.shop_logo_url,
            shop_cover_url: shop.shop_cover_url,
            business_type: shop.business_type,
            contact_phone: shop.contact_phone,
            contact_email: shop.contact_email,
            bank_info: {
                bank_name: 'Techcombank',
                account_name: owner.full_name,
                account_number: `${Math.abs(owner.full_name.length * 9876543)}`,
            },
            commission_rate: shop.commission_rate,
            is_verified: shop.is_verified,
            total_revenue: Math.round(stats?.totalRevenue ?? 0),
            total_orders: stats?.totalOrders ?? 0,
            avg_rating: stats?.avgRating ?? null,
            status: shop.status,
        }));
        sellerByKey.set(shop.key, seller);
    }

    const productByKey = new Map<string, Product>();
    const variantBySku = new Map<string, ProductVariant>();
    for (const record of dataset.products) {
        const sellerProfile = sellerByKey.get(record.shop_key);
        const sellerUser = userByKey.get(record.seller_key);
        const category = categoryBySlug.get(record.category_slug);
        const stats = productStats.get(record.key);
        if (!sellerProfile || !sellerUser || !category) continue;

        const product = await productRepo.save(productRepo.create({
            seller_id: sellerUser.id,
            seller_profile_id: sellerProfile.id,
            category_id: category.id,
            title: record.title,
            slug: record.slug,
            description: record.description,
            product_type: record.product_type,
            status: 'active',
            price: record.price,
            compare_at_price: record.compare_at_price,
            currency: record.currency,
            stock_quantity: record.stock_quantity,
            track_inventory: record.track_inventory,
            sku: record.sku,
            digital_file_url: record.digital_file_url,
            preview_content: record.preview_content,
            thumbnail_url: record.thumbnail_url,
            gallery: record.gallery,
            attributes: record.attributes,
            tags: record.tags,
            view_count: 140 + record.featured_weight * 3,
            sale_count: stats?.saleCount ?? 0,
            wishlist_count: stats?.wishlistCount ?? 0,
            avg_rating: stats?.avgRating ?? null,
            review_count: stats?.reviewCount ?? 0,
            featured_weight: record.featured_weight,
            moderation_note: null,
            moderated_by: adminUser.id,
            moderated_at: new Date('2026-03-01T09:00:00+07:00'),
            deleted_at: null,
        }));
        productByKey.set(record.key, product);

        const variants = await variantRepo.save(record.variants.map((item) => variantRepo.create({
            product_id: product.id,
            variant_label: item.variant_label,
            variant_attributes: item.variant_attributes,
            price: item.price,
            compare_at_price: item.compare_at_price,
            stock_quantity: item.stock_quantity,
            sku: item.sku,
            image_url: item.image_url,
            is_active: item.is_active,
            sort_order: item.sort_order,
        })));
        variants.forEach((variant) => {
            if (variant.sku) {
                variantBySku.set(variant.sku, variant);
            }
        });

        if (record.training_package) {
            await trainingPackageRepo.save(trainingPackageRepo.create({
                product_id: product.id,
                goal: record.training_package.goal,
                level: record.training_package.level,
                duration_weeks: record.training_package.duration_weeks,
                sessions_per_week: record.training_package.sessions_per_week,
                equipment_required: record.training_package.equipment_required,
                includes_nutrition: record.training_package.includes_nutrition,
                includes_video: record.training_package.includes_video,
                program_structure: record.training_package.program_structure as TrainingPackage['program_structure'],
                preview_weeks: record.training_package.preview_weeks,
                nutrition_guide: (record.training_package.nutrition_guide ?? null) as TrainingPackage['nutrition_guide'],
            }));
        }
    }

    const orderItemByBuyerAndProduct = new Map<string, ProductOrderItem>();
    for (const record of dataset.productOrders) {
        const buyer = userByKey.get(record.buyer_key);
        if (!buyer) continue;
        let subtotal = 0;
        const itemsPayload = record.items.map((item) => {
            const product = productByKey.get(item.product_key);
            const variant = item.variant_sku ? variantBySku.get(item.variant_sku) ?? null : null;
            const unitPrice = variant?.price ?? product?.price ?? 0;
            subtotal += unitPrice * item.quantity;
            return { item, product, variant, unitPrice };
        }).filter((item) => !!item.product);

        const order = await orderRepo.save(orderRepo.create({
            buyer_id: buyer.id,
            order_number: record.order_number,
            status: record.status,
            total_amount: subtotal + record.shipping_fee - record.discount_amount,
            shipping_fee: record.shipping_fee,
            discount_amount: record.discount_amount,
            payment_method: record.payment_method,
            payment_status: record.payment_status,
            shipping_address: record.shipping_address,
            tracking_number: record.tracking_number,
            note: record.note,
        }));

        const savedItems = await orderItemRepo.save(itemsPayload.map(({ item, product, variant, unitPrice }) => orderItemRepo.create({
            order_id: order.id,
            product_id: product!.id,
            variant_id: variant?.id ?? null,
            quantity: item.quantity,
            unit_price: unitPrice,
            subtotal: unitPrice * item.quantity,
            digital_download_url: item.digital_download_url ?? null,
            digital_download_count: item.digital_download_count ?? 0,
            digital_download_limit: item.digital_download_limit ?? 5,
            product_title_snapshot: product!.title,
        })));

        savedItems.forEach((savedItem) => {
            const key = `${record.buyer_key}:${itemsPayload.find((payload) => payload.product?.id === savedItem.product_id)?.item.product_key}`;
            if (!orderItemByBuyerAndProduct.has(key)) {
                orderItemByBuyerAndProduct.set(key, savedItem);
            }
        });
    }

    await wishlistRepo.save(dataset.wishlists.map((record) => {
        const user = userByKey.get(record.user_key);
        const product = productByKey.get(record.product_key);
        if (!user || !product) return null;
        return wishlistRepo.create({ user_id: user.id, product_id: product.id });
    }).filter(Boolean) as ProductWishlist[]);

    await reviewRepo.save(dataset.productReviews.map((record) => {
        const user = userByKey.get(record.user_key);
        const product = productByKey.get(record.product_key);
        if (!user || !product) return null;
        const orderItem = record.is_verified_purchase ? orderItemByBuyerAndProduct.get(`${record.user_key}:${record.product_key}`) : undefined;
        return reviewRepo.create({
            product_id: product.id,
            user_id: user.id,
            order_item_id: orderItem?.id ?? null,
            rating: record.rating,
            comment: record.comment,
            quality_rating: record.quality_rating,
            value_rating: record.value_rating,
            delivery_rating: record.delivery_rating,
            is_verified_purchase: record.is_verified_purchase,
            is_visible: true,
            reply_text: record.reply_text ?? null,
            replied_by_id: product.seller_id,
            replied_at: record.reply_text ? new Date('2026-03-12T10:00:00+07:00') : null,
        });
    }).filter(Boolean) as ProductReview[]);

    const trainerGalleryIndex = new Map<string, string>();
    trainerGalleryByKey.forEach((galleries, key) => {
        galleries.forEach((gallery) => trainerGalleryIndex.set(`${key}:${gallery.image_url}`, gallery.id));
    });

    await communityRepo.save(dataset.communityGallery.map((record) => {
        const linkedUser = record.linked_user_key ? userByKey.get(record.linked_user_key) : null;
        return communityRepo.create({
            image_url: record.image_url,
            caption: record.caption,
            category: record.category,
            source: record.source,
            linked_user_id: linkedUser?.id ?? null,
            source_image_id: record.linked_user_key ? trainerGalleryIndex.get(`${record.linked_user_key}:${record.image_url}`) ?? null : null,
            uploaded_by: adminUser.id,
            is_featured: record.is_featured,
            order_number: record.order_number,
            is_active: true,
        });
    }));
}

async function seedMessages(dataset: MockDataset, userByKey: Map<string, User>): Promise<void> {
    const messageRepo = AppDataSource.getRepository(Message);
    const messages: Message[] = [];

    dataset.messageThreads.forEach((thread) => {
        thread.messages.forEach((record, index) => {
            const sender = userByKey.get(record.sender_key);
            const receiverKey = thread.participants[0] === record.sender_key ? thread.participants[1] : thread.participants[0];
            const receiver = userByKey.get(receiverKey);
            if (!sender || !receiver) return;
            messages.push(messageRepo.create({
                sender_id: sender.id,
                receiver_id: receiver.id,
                content: record.content,
                is_read: record.is_read,
                read_at: record.is_read ? new Date(record.created_at) : null,
                created_at: new Date(record.created_at),
            }));
        });
    });

    await messageRepo.save(messages);
}

async function seedUsers(dataset: MockDataset): Promise<Map<string, User>> {
    const userRepo = AppDataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash(PASS, 10);
    const userByKey = new Map<string, User>();

    const userPayloads: Array<{ key: string; entity: User }> = [];

    dataset.coaches.forEach((coach, index) => {
        const avgRating = Number((coach.testimonials.reduce((sum, item) => sum + item.rating, 0) / coach.testimonials.length).toFixed(2));
        userPayloads.push({
            key: coach.key,
            entity: userRepo.create({
                email: coach.email,
                password: hashedPassword,
                full_name: coach.full_name,
                is_email_verified: true,
                onboarding_completed: true,
                user_type: 'trainer',
                is_active: true,
                avatar_url: coach.avatar_url,
                bio: coach.bio,
                experience_level: coach.experience_level,
                specialties: coach.specialties,
                base_price_monthly: coach.base_price_monthly,
                is_verified: coach.is_verified,
                marketplace_membership_active: coach.marketplace_membership_active,
                slug: coach.slug,
                city: coach.city,
                avg_rating: avgRating,
                profile_view_count: 240 + index * 14,
            }),
        });
    });

    dataset.athletes.forEach((athlete, index) => {
        userPayloads.push({
            key: athlete.key,
            entity: userRepo.create({
                email: athlete.email,
                password: hashedPassword,
                full_name: athlete.full_name,
                is_email_verified: true,
                onboarding_completed: true,
                user_type: 'athlete',
                is_active: true,
                avatar_url: athlete.avatar_url,
                bio: athlete.bio,
                experience_level: athlete.experience_level,
                specialties: athlete.specialties,
                base_price_monthly: athlete.packages[0]?.price ?? null,
                is_verified: athlete.is_verified,
                marketplace_membership_active: false,
                slug: athlete.slug,
                city: athlete.city,
                avg_rating: null,
                profile_view_count: 150 + index * 9,
            }),
        });
    });

    dataset.members.forEach((member, index) => {
        userPayloads.push({
            key: member.key,
            entity: userRepo.create({
                email: member.email,
                password: hashedPassword,
                full_name: member.full_name,
                is_email_verified: true,
                onboarding_completed: true,
                user_type: 'user',
                is_active: true,
                avatar_url: member.avatar_url,
                bio: member.bio,
                experience_level: member.experience_level,
                specialties: null,
                base_price_monthly: null,
                is_verified: false,
                marketplace_membership_active: index < 5,
                slug: member.slug,
                city: member.city,
                avg_rating: null,
                profile_view_count: 60 + index * 3,
            }),
        });
    });

    dataset.gymOwners.forEach((owner, index) => {
        userPayloads.push({
            key: owner.key,
            entity: userRepo.create({
                email: owner.email,
                password: hashedPassword,
                full_name: owner.full_name,
                is_email_verified: true,
                onboarding_completed: true,
                user_type: 'gym_owner',
                is_active: true,
                gym_owner_status: owner.gym_owner_status,
                avatar_url: owner.avatar_url,
                bio: owner.bio,
                experience_level: 'intermediate',
                specialties: null,
                base_price_monthly: null,
                is_verified: true,
                marketplace_membership_active: owner.marketplace_membership_active,
                slug: owner.slug,
                city: owner.city,
                avg_rating: null,
                profile_view_count: 75 + index * 4,
            }),
        });
    });

    const savedUsers = await userRepo.save(userPayloads.map((item) => item.entity));
    userPayloads.forEach((item, index) => userByKey.set(item.key, savedUsers[index]));
    return userByKey;
}

export async function fullSeed(): Promise<void> {
    assertSeedEnvironment();
    const dataset = buildMockDataset();
    assertDatasetIntegrity(dataset);

    if (process.env.SKIP_SEED_IMAGE_VALIDATION !== 'true') {
        await validateSeedImagesOrThrow();
    }

    await AppDataSource.initialize();
    try {
        const adminUser = await hardResetContent();
        const { categoryBySlug, taxonomyBySlug, termBySectionAndSlug } = await ensureReferenceCatalogs();
        const userByKey = await seedUsers(dataset);
        const trainerGalleryByKey = await seedUserProfiles(dataset, userByKey, adminUser, termBySectionAndSlug);
        await seedGyms(dataset, userByKey, taxonomyBySlug);
        await seedMarketplace(dataset, adminUser, userByKey, categoryBySlug, trainerGalleryByKey);
        await seedMessages(dataset, userByKey);

        console.log('Hard reset demo seed V2 completed');
        console.table({
            coaches: dataset.coaches.length,
            athletes: dataset.athletes.length,
            members: dataset.members.length,
            gymOwners: dataset.gymOwners.length,
            gyms: dataset.gyms.length,
            shops: dataset.shops.length,
            products: dataset.products.length,
            communityGallery: dataset.communityGallery.length,
            messageThreads: dataset.messageThreads.length,
            gymReviews: dataset.gyms.reduce((sum, gym) => sum + gym.review_templates.length, 0),
            productReviews: dataset.productReviews.length,
            wishlists: dataset.wishlists.length,
            productOrders: dataset.productOrders.length,
        });
    } finally {
        await AppDataSource.destroy();
    }
}

if (require.main === module) {
    fullSeed().catch((error) => {
        console.error('Seed failed');
        console.error(error);
        process.exit(1);
    });
}
