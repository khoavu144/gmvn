import { AppDataSource } from '../config/database';
import { GymCenter } from '../entities/GymCenter';
import { GymBranch } from '../entities/GymBranch';
import { GymTrainerLink } from '../entities/GymTrainerLink';
import { GymAmenity } from '../entities/GymAmenity';
import { GymEquipment } from '../entities/GymEquipment';
import { GymPricing } from '../entities/GymPricing';
import { GymEvent } from '../entities/GymEvent';
import { GymGallery } from '../entities/GymGallery';
import { GymReview } from '../entities/GymReview';
import { Subscription } from '../entities/Subscription';
import { In, Like } from 'typeorm';
// Marketplace extension imports
import { GymTaxonomyTerm } from '../entities/GymTaxonomyTerm';
import { GymCenterTaxonomyTerm } from '../entities/GymCenterTaxonomyTerm';
import { GymZone } from '../entities/GymZone';
import { GymProgram } from '../entities/GymProgram';
import { GymProgramSession } from '../entities/GymProgramSession';
import { GymLeadRoute } from '../entities/GymLeadRoute';
import { GymTrainerAvailability } from '../entities/GymTrainerAvailability';

export const gymService = {
    // ── PUBLIC LISTING ──────────────────────────────────────────────

    async listGyms(query: {
        search?: string;
        city?: string;
        page?: number;
        limit?: number;
        sort?: 'rating' | 'newest' | 'views';
    }) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const page = query.page || 1;
        const limit = Math.min(query.limit || 12, 50);
        const skip = (page - 1) * limit;

        const qb = gymCenterRepo.createQueryBuilder('gc')
            .leftJoinAndSelect('gc.branches', 'branch', 'branch.is_active = true')
            .where('gc.is_verified = true')
            .andWhere('gc.is_active = true');

        if (query.search) {
            qb.andWhere('(gc.name ILIKE :search OR branch.address ILIKE :search OR branch.city ILIKE :search)', {
                search: `%${query.search}%`
            });
        }
        if (query.city) {
            qb.andWhere('branch.city ILIKE :city', { city: `%${query.city}%` });
        }

        if (query.sort === 'newest') {
            qb.orderBy('gc.created_at', 'DESC');
        } else if (query.sort === 'views') {
            qb.orderBy('gc.view_count', 'DESC');
        } else {
            qb.orderBy('gc.view_count', 'DESC'); // default
        }

        const [gyms, total] = await qb.skip(skip).take(limit).getManyAndCount();

        return {
            gyms,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
        };
    },

    async getGymCenterById(gymCenterIdOrSlug: string) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        // Detect UUID vs slug: UUIDs are 36 chars with hyphens in pattern
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gymCenterIdOrSlug);
        const where = isUUID
            ? { id: gymCenterIdOrSlug, is_active: true }
            : { slug: gymCenterIdOrSlug, is_active: true };
        const gym = await gymCenterRepo.findOne({
            where,
            relations: ['branches'],
        });
        if (gym) {
            await gymCenterRepo.update(gym.id, { view_count: () => 'view_count + 1' });
        }
        return gym;
    },

    async getBranchDetail(branchId: string) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const branch = await branchRepo.findOne({
            where: { id: branchId, is_active: true },
            relations: ['gym_center', 'gallery', 'amenities', 'equipment', 'pricing', 'events', 'reviews'],
        });
        if (branch) {
            await branchRepo.update(branchId, { view_count: () => 'view_count + 1' });
        }
        return branch;
    },

    async getGymTrainers(gymCenterId: string) {
        const linkRepo = AppDataSource.getRepository(GymTrainerLink);
        return linkRepo.find({
            where: { gym_center_id: gymCenterId, status: 'active' },
        });
    },

    async getGymReviews(gymCenterId: string) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const branches = await branchRepo.find({ where: { gym_center_id: gymCenterId } });
        const branchIds = branches.map(b => b.id);
        if (branchIds.length === 0) return [];

        const reviewRepo = AppDataSource.getRepository(GymReview);
        return reviewRepo.find({
            where: { branch_id: In(branchIds), is_visible: true },
            order: { created_at: 'DESC' },
        });
    },

    // ── GYM OWNER ────────────────────────────────────────────────────

    async registerGym(ownerId: string, data: {
        name: string;
        description?: string;
        tagline?: string;
        branchName: string;
        address: string;
        city?: string;
        district?: string;
        phone?: string;
    }) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const branchRepo = AppDataSource.getRepository(GymBranch);

        // Check for existing active gym center
        const existing = await gymCenterRepo.findOneBy({ owner_id: ownerId, is_active: true });
        if (existing) {
            throw new Error('Bạn đã có một Gym Center đang hoạt động. Vui lòng quản lý gym hiện tại.');
        }

        // Generate slug
        const slug = data.name.toLowerCase()
            .normalize('NFD').replace(/\p{Diacritic}/gu, '')
            .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            + '-' + Date.now();

        const center = gymCenterRepo.create({
            owner_id: ownerId,
            name: data.name,
            slug,
            description: data.description,
            tagline: data.tagline,
            is_verified: false,
            is_active: true,
        });
        const savedCenter = await gymCenterRepo.save(center);

        const branch = branchRepo.create({
            gym_center_id: savedCenter.id,
            branch_name: data.branchName || data.name,
            address: data.address,
            city: data.city,
            district: data.district,
            phone: data.phone,
            is_active: true,
        });
        await branchRepo.save(branch);

        return savedCenter;
    },

    async getOwnerGyms(ownerId: string) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        return gymCenterRepo.find({
            where: { owner_id: ownerId },
            relations: ['branches'],
            order: { created_at: 'DESC' },
        });
    },

    async updateGymCenter(centerId: string, ownerId: string, data: Partial<GymCenter>) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const gym = await gymCenterRepo.findOne({ where: { id: centerId, owner_id: ownerId } });
        if (!gym) throw new Error('Gym not found or unauthorized');
        Object.assign(gym, data);
        return gymCenterRepo.save(gym);
    },

    async updateBranch(branchId: string, ownerId: string, data: Partial<GymBranch>) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);

        const branch = await branchRepo.findOne({ where: { id: branchId } });
        if (!branch) throw new Error('Branch not found');

        // Verify ownership
        const center = await gymCenterRepo.findOne({ where: { id: branch.gym_center_id, owner_id: ownerId } });
        if (!center) throw new Error('Unauthorized');

        Object.assign(branch, data);
        return branchRepo.save(branch);
    },

    async createBranch(ownerId: string, data: {
        branch_name: string;
        address: string;
        city?: string;
        district?: string;
        phone?: string;
        email?: string;
        description?: string;
        manager_name?: string;
    }) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const branchRepo = AppDataSource.getRepository(GymBranch);

        // Lấy gym của owner
        const center = await gymCenterRepo.findOne({ where: { owner_id: ownerId, is_active: true } });
        if (!center) throw new Error('Không tìm thấy Gym Center của bạn');

        const branch = branchRepo.create({
            gym_center_id: center.id,
            branch_name: data.branch_name,
            address: data.address,
            city: data.city ?? null,
            district: data.district ?? null,
            phone: data.phone ?? null,
            email: data.email ?? null,
            description: data.description ?? null,
            manager_name: data.manager_name ?? null,
            is_active: true,
        });
        return branchRepo.save(branch);
    },

    // Bulk update amenities
    async updateAmenities(branchId: string, ownerId: string, amenities: Array<{ name: string; is_available: boolean; note?: string }>) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const amenityRepo = AppDataSource.getRepository(GymAmenity);

        const branch = await branchRepo.findOne({ where: { id: branchId } });
        if (!branch) throw new Error('Branch not found');
        const center = await gymCenterRepo.findOne({ where: { id: branch.gym_center_id, owner_id: ownerId } });
        if (!center) throw new Error('Unauthorized');

        await amenityRepo.delete({ branch_id: branchId });
        const entities = amenities.map(a => amenityRepo.create({ ...a, branch_id: branchId }));
        return amenityRepo.save(entities);
    },

    // Bulk update equipment
    async updateEquipment(branchId: string, ownerId: string, equipment: Array<{ category: string; name: string; quantity?: number; brand?: string; is_available?: boolean }>) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const equipRepo = AppDataSource.getRepository(GymEquipment);

        const branch = await branchRepo.findOne({ where: { id: branchId } });
        if (!branch) throw new Error('Branch not found');
        const center = await gymCenterRepo.findOne({ where: { id: branch.gym_center_id, owner_id: ownerId } });
        if (!center) throw new Error('Unauthorized');

        await equipRepo.delete({ branch_id: branchId });
        const entities = equipment.map(e => equipRepo.create({ ...e, branch_id: branchId }));
        return equipRepo.save(entities);
    },

    // Bulk update pricing
    async updatePricing(branchId: string, ownerId: string, pricing: Array<{ plan_name: string; price: number; billing_cycle: string; description?: string; is_highlighted?: boolean; order_number?: number }>) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const pricingRepo = AppDataSource.getRepository(GymPricing);

        const branch = await branchRepo.findOne({ where: { id: branchId } });
        if (!branch) throw new Error('Branch not found');
        const center = await gymCenterRepo.findOne({ where: { id: branch.gym_center_id, owner_id: ownerId } });
        if (!center) throw new Error('Unauthorized');

        await pricingRepo.delete({ branch_id: branchId });
        const pricingData = pricing.map(p => ({ ...p, branch_id: branchId }));
        const entities = pricingRepo.create(pricingData as any);
        return pricingRepo.save(entities);
    },

    // Trainer invitation
    async inviteTrainer(branchId: string, ownerId: string, trainerId: string, roleAtGym?: string) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const linkRepo = AppDataSource.getRepository(GymTrainerLink);

        const branch = await branchRepo.findOne({ where: { id: branchId } });
        if (!branch) throw new Error('Branch not found');
        const center = await gymCenterRepo.findOne({ where: { id: branch.gym_center_id, owner_id: ownerId } });
        if (!center) throw new Error('Unauthorized');

        // Check if already linked
        const existing = await linkRepo.findOne({ where: { branch_id: branchId, trainer_id: trainerId } });
        if (existing && existing.status === 'active') throw new Error('Trainer already linked');

        const link = linkRepo.create({
            branch_id: branchId,
            gym_center_id: branch.gym_center_id,
            trainer_id: trainerId,
            role_at_gym: roleAtGym,
            status: 'pending',
        });
        return linkRepo.save(link);
    },

    async removeTrainer(branchId: string, ownerId: string, linkId: string) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const linkRepo = AppDataSource.getRepository(GymTrainerLink);

        const branch = await branchRepo.findOne({ where: { id: branchId } });
        if (!branch) throw new Error('Branch not found');
        const center = await gymCenterRepo.findOne({ where: { id: branch.gym_center_id, owner_id: ownerId } });
        if (!center) throw new Error('Unauthorized');

        await linkRepo.update(linkId, { status: 'removed' });
    },

    // Gallery management
    async addGalleryImage(branchId: string, ownerId: string, imageData: { image_url: string; caption?: string; image_type?: string; order_number?: number }) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const galleryRepo = AppDataSource.getRepository(GymGallery);

        const branch = await branchRepo.findOne({ where: { id: branchId } });
        if (!branch) throw new Error('Branch not found');
        const center = await gymCenterRepo.findOne({ where: { id: branch.gym_center_id, owner_id: ownerId } });
        if (!center) throw new Error('Unauthorized');

        const img = galleryRepo.create({ branch_id: branchId, ...imageData } as any);
        return galleryRepo.save(img);
    },

    async deleteGalleryImage(branchId: string, ownerId: string, imageId: string) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const galleryRepo = AppDataSource.getRepository(GymGallery);

        const branch = await branchRepo.findOne({ where: { id: branchId } });
        if (!branch) throw new Error('Branch not found');
        const center = await gymCenterRepo.findOne({ where: { id: branch.gym_center_id, owner_id: ownerId } });
        if (!center) throw new Error('Unauthorized');

        await galleryRepo.delete({ id: imageId, branch_id: branchId });
    },

    // Stats
    async getGymStats(gymCenterId: string, ownerId: string) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const center = await gymCenterRepo.findOne({ where: { id: gymCenterId, owner_id: ownerId }, relations: ['branches'] });
        if (!center) throw new Error('Gym not found or unauthorized');

        const branchIds = center.branches.map(b => b.id);
        const linkRepo = AppDataSource.getRepository(GymTrainerLink);
        const reviewRepo = AppDataSource.getRepository(GymReview);

        const totalViews = center.branches.reduce((sum, b) => sum + b.view_count, 0) + center.view_count;
        const totalTrainers = await linkRepo.count({ where: { gym_center_id: gymCenterId, status: 'active' } });
        const reviews = branchIds.length > 0
            ? await reviewRepo.find({ where: { branch_id: In(branchIds), is_visible: true } })
            : [];
        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        const rating_distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                rating_distribution[r.rating]++;
            }
        });

        return {
            total_views: totalViews,
            total_trainers: totalTrainers,
            total_reviews: reviews.length,
            avg_rating: Math.round(avgRating * 10) / 10,
            total_branches: center.branches.length,
            rating_distribution,
        };
    },

    // ── TRAINER ACTIONS ───────────────────────────────────────────────

    async getTrainerInvitations(trainerId: string) {
        const linkRepo = AppDataSource.getRepository(GymTrainerLink);
        return linkRepo.find({ where: { trainer_id: trainerId, status: 'pending' } });
    },

    async acceptInvitation(invitationId: string, trainerId: string) {
        const linkRepo = AppDataSource.getRepository(GymTrainerLink);
        const link = await linkRepo.findOne({ where: { id: invitationId, trainer_id: trainerId, status: 'pending' } });
        if (!link) throw new Error('Invitation not found');
        link.status = 'active';
        link.linked_at = new Date();
        return linkRepo.save(link);
    },

    async declineInvitation(invitationId: string, trainerId: string) {
        const linkRepo = AppDataSource.getRepository(GymTrainerLink);
        const link = await linkRepo.findOne({ where: { id: invitationId, trainer_id: trainerId, status: 'pending' } });
        if (!link) throw new Error('Invitation not found');
        link.status = 'removed';
        return linkRepo.save(link);
    },

    // ── ADMIN ─────────────────────────────────────────────────────────

    async getPendingGyms() {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        return gymCenterRepo.find({ where: { is_verified: false, is_active: true }, relations: ['branches'] });
    },

    async approveGym(centerId: string) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        await gymCenterRepo.update(centerId, { is_verified: true });
    },

    async rejectGym(centerId: string) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        await gymCenterRepo.update(centerId, { is_active: false });
    },

    async suspendGym(centerId: string) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        await gymCenterRepo.update(centerId, { is_active: false });
    },

    async getAllGymsAdmin() {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        return gymCenterRepo.find({ relations: ['branches'], order: { created_at: 'DESC' } });
    },

    async getTrainerGyms(trainerId: string) {
        const linkRepo = AppDataSource.getRepository(GymTrainerLink);
        return linkRepo.find({
            where: { trainer_id: trainerId, status: 'active' },
            relations: ['branch', 'branch.gym_center'],
        });
    },

    async getBranchTrainers(branchId: string, ownerId: string) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const branch = await branchRepo.findOne({
            where: { id: branchId },
            relations: ['gym_center'],
        });

        if (!branch || branch.gym_center.owner_id !== ownerId) {
            throw new Error('Branch not found or unauthorized');
        }

        const linkRepo = AppDataSource.getRepository(GymTrainerLink);
        return linkRepo.find({
            where: { branch_id: branchId },
            relations: ['trainer'],
        });
    },

    // ── MARKETPLACE LISTING (new marketplace queries) ─────────────────

    /**
     * Rich marketplace listing with taxonomy, thumbnail, price_from, and trust proof.
     * Replaces basic listGyms for the new /gyms discovery page.
     */
    async listGymsMarketplace(query: {
        search?: string;
        city?: string;
        district?: string;
        venue_type?: string;
        audience_tag?: string;
        positioning_tier?: string;
        sort?: 'featured' | 'rating' | 'newest' | 'price_asc' | 'views';
        page?: number;
        limit?: number;
        lite?: boolean;
    }) {
        const page = Math.max(1, query.page || 1);
        const limit = Math.min(query.limit || 12, 50);
        const skip = (page - 1) * limit;
        const liteMode = Boolean(query.lite);

        const qb = AppDataSource.getRepository(GymCenter)
            .createQueryBuilder('gc')
            .leftJoinAndSelect('gc.branches', 'branch', 'branch.is_active = true')
            .where('gc.is_verified = true')
            .andWhere('gc.is_active = true')
            .andWhere('gc.deleted_at IS NULL');

        if (liteMode) {
            qb.select([
                'gc.id',
                'gc.owner_id',
                'gc.name',
                'gc.slug',
                'gc.logo_url',
                'gc.cover_image_url',
                'gc.description',
                'gc.tagline',
                'gc.is_verified',
                'gc.is_active',
                'gc.view_count',
                'gc.primary_venue_type_slug',
                'gc.price_from_amount',
                'gc.price_from_billing_cycle',
                'gc.positioning_tier',
                'gc.discovery_blurb',
                'gc.response_sla_text',
                'gc.featured_weight',
                'gc.created_at',
                'gc.updated_at',
                'branch.id',
                'branch.branch_name',
                'branch.city',
                'branch.district',
                'branch.neighborhood_label',
                'branch.is_active',
            ]);
        }

        if (query.search) {
            qb.andWhere(
                '(gc.name ILIKE :s OR gc.discovery_blurb ILIKE :s OR branch.city ILIKE :s OR branch.district ILIKE :s)',
                { s: `%${query.search}%` }
            );
        }
        if (query.city) {
            qb.andWhere('branch.city ILIKE :city', { city: `%${query.city}%` });
        }
        if (query.district) {
            qb.andWhere('branch.district ILIKE :district', { district: `%${query.district}%` });
        }
        if (query.venue_type) {
            qb.andWhere('gc.primary_venue_type_slug = :vt', { vt: query.venue_type });
        }
        if (query.audience_tag) {
            qb.andWhere(
                `EXISTS (
                    SELECT 1
                    FROM gym_center_taxonomy_terms gct
                    INNER JOIN gym_taxonomy_terms gtt ON gtt.id = gct.term_id
                    WHERE gct.gym_center_id = gc.id
                    AND gtt.term_type = 'audience'
                    AND gtt.slug = :audienceTag
                )`,
                { audienceTag: query.audience_tag }
            );
        }
        if (query.positioning_tier) {
            qb.andWhere('gc.positioning_tier = :tier', { tier: query.positioning_tier });
        }

        // Sort
        switch (query.sort) {
            case 'featured':
                qb.orderBy('gc.featured_weight', 'DESC').addOrderBy('gc.view_count', 'DESC');
                break;
            case 'newest':
                qb.orderBy('gc.created_at', 'DESC');
                break;
            case 'price_asc':
                qb.orderBy('gc.price_from_amount', 'ASC', 'NULLS LAST');
                break;
            case 'views':
                qb.orderBy('gc.view_count', 'DESC');
                break;
            default: // default: featured first
                qb.orderBy('gc.featured_weight', 'DESC').addOrderBy('gc.view_count', 'DESC');
        }

        const [gyms, total] = await qb.skip(skip).take(limit).getManyAndCount();

        // Enrich each gym with its listing thumbnail and taxonomy terms
        const gymIds = gyms.map(g => g.id);
        let thumbnailMap: Map<string, GymGallery> = new Map();
        let taxonomyMap: Map<string, GymCenterTaxonomyTerm[]> = new Map();

        if (gymIds.length > 0) {
            // Get listing thumbnails via branches
            const branchIds = gyms.flatMap(g => (g.branches || []).map(b => b.id));
            if (branchIds.length > 0) {
                const thumbsQb = AppDataSource.getRepository(GymGallery)
                    .createQueryBuilder('img')
                    .where('img.branch_id IN (:...ids)', { ids: branchIds })
                    .andWhere('img.is_listing_thumb = true')
                    .orderBy('img.order_number', 'ASC');

                if (liteMode) {
                    thumbsQb.select([
                        'img.id',
                        'img.branch_id',
                        'img.image_url',
                        'img.alt_text',
                        'img.caption',
                        'img.order_number',
                        'img.is_listing_thumb',
                    ]);
                }

                const thumbs = await thumbsQb.getMany();

                // Map branch → first thumb, then branch → gym
                const branchToGym = new Map<string, string>();
                gyms.forEach(g => (g.branches || []).forEach(b => branchToGym.set(b.id, g.id)));
                thumbs.forEach(t => {
                    const gymId = branchToGym.get(t.branch_id);
                    if (gymId && !thumbnailMap.has(gymId)) thumbnailMap.set(gymId, t);
                });

                // Fallback: first gallery image if no listing_thumb
                const gymsMissingThumb = gymIds.filter(id => !thumbnailMap.has(id));
                if (gymsMissingThumb.length > 0) {
                    const branchIdsMissing = gyms
                        .filter(g => gymsMissingThumb.includes(g.id))
                        .flatMap(g => (g.branches || []).map(b => b.id));
                    if (branchIdsMissing.length > 0) {
                        const fallbackQb = AppDataSource.getRepository(GymGallery)
                            .createQueryBuilder('img')
                            .where('img.branch_id IN (:...ids)', { ids: branchIdsMissing })
                            .orderBy('img.order_number', 'ASC');

                        if (liteMode) {
                            fallbackQb.select([
                                'img.id',
                                'img.branch_id',
                                'img.image_url',
                                'img.alt_text',
                                'img.caption',
                                'img.order_number',
                            ]);
                        }

                        const fallbacks = await fallbackQb.getMany();
                        fallbacks.forEach(t => {
                            const gymId = branchToGym.get(t.branch_id);
                            if (gymId && !thumbnailMap.has(gymId)) thumbnailMap.set(gymId, t);
                        });
                    }
                }
            }

            // Taxonomy terms
            const ctTermsQb = AppDataSource.getRepository(GymCenterTaxonomyTerm)
                .createQueryBuilder('ct')
                .leftJoinAndSelect('ct.term', 'term')
                .where('ct.gym_center_id IN (:...ids)', { ids: gymIds })
                .orderBy('ct.sort_order', 'ASC');

            if (liteMode) {
                ctTermsQb.select([
                    'ct.id',
                    'ct.gym_center_id',
                    'ct.term_id',
                    'ct.is_primary',
                    'ct.sort_order',
                    'term.id',
                    'term.slug',
                    'term.label',
                    'term.term_type',
                ]);
            }

            const ctTerms = await ctTermsQb.getMany();
            ctTerms.forEach(ct => {
                if (!taxonomyMap.has(ct.gym_center_id)) taxonomyMap.set(ct.gym_center_id, []);
                taxonomyMap.get(ct.gym_center_id)!.push(ct);
            });
        }

        const enriched = gyms.map(g => {
            const baseGym = liteMode
                ? {
                    id: g.id,
                    owner_id: g.owner_id,
                    name: g.name,
                    slug: g.slug,
                    logo_url: g.logo_url,
                    cover_image_url: g.cover_image_url,
                    description: g.description,
                    tagline: g.tagline,
                    is_verified: g.is_verified,
                    is_active: g.is_active,
                    view_count: g.view_count,
                    primary_venue_type_slug: g.primary_venue_type_slug,
                    price_from_amount: g.price_from_amount,
                    price_from_billing_cycle: g.price_from_billing_cycle,
                    positioning_tier: g.positioning_tier,
                    discovery_blurb: g.discovery_blurb,
                    response_sla_text: g.response_sla_text,
                    featured_weight: g.featured_weight,
                    created_at: g.created_at,
                    updated_at: g.updated_at,
                    branches: (g.branches || []).map((branch) => ({
                        id: branch.id,
                        branch_name: branch.branch_name,
                        city: branch.city,
                        district: branch.district,
                        neighborhood_label: branch.neighborhood_label,
                        is_active: branch.is_active,
                    })),
                }
                : g;

            return {
                ...baseGym,
                listing_thumbnail: thumbnailMap.get(g.id) ?? null,
                taxonomy_terms: taxonomyMap.get(g.id) ?? [],
            };
        });

        return {
            gyms: enriched,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    },

    /**
     * Full gym detail payload for the marketplace detail page.
     * Returns zones, programs, lead routes, trust dimensions, and taxonomy.
     */
    async getGymDetailMarketplace(gymCenterIdOrSlug: string) {
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gymCenterIdOrSlug);
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);

        const where = isUUID
            ? { id: gymCenterIdOrSlug, is_active: true }
            : { slug: gymCenterIdOrSlug, is_active: true };

        const gym = await gymCenterRepo.findOne({
            where,
            relations: ['branches'],
        });
        if (!gym) return null;

        // Increment view count
        await gymCenterRepo.update(gym.id, { view_count: () => 'view_count + 1' });

        const branchIds = (gym.branches || []).filter(b => b.is_active).map(b => b.id);

        // Parallel fetch of all related data
        const [
            gallery,
            amenities,
            equipment,
            pricing,
            reviews,
            trainerLinks,
            zones,
            programs,
            leadRoutes,
            taxonomyTerms,
        ] = await Promise.all([
            branchIds.length > 0
                ? AppDataSource.getRepository(GymGallery).find({
                    where: { branch_id: In(branchIds) },
                    order: { is_hero: 'DESC', is_featured: 'DESC', order_number: 'ASC' },
                })
                : [],
            branchIds.length > 0
                ? AppDataSource.getRepository(GymAmenity).find({
                    where: { branch_id: In(branchIds) },
                })
                : [],
            branchIds.length > 0
                ? AppDataSource.getRepository(GymEquipment).find({
                    where: { branch_id: In(branchIds) },
                })
                : [],
            branchIds.length > 0
                ? AppDataSource.getRepository(GymPricing).find({
                    where: { branch_id: In(branchIds) },
                    order: { order_number: 'ASC' },
                })
                : [],
            branchIds.length > 0
                ? AppDataSource.getRepository(GymReview).find({
                    where: { branch_id: In(branchIds), is_visible: true },
                    order: { created_at: 'DESC' },
                    take: 20,
                })
                : [],
            branchIds.length > 0
                ? AppDataSource.getRepository(GymTrainerLink).find({
                    where: { branch_id: In(branchIds), status: 'active' },
                    order: { featured_at_branch: 'DESC', visible_order: 'ASC' },
                })
                : [],
            branchIds.length > 0
                ? AppDataSource.getRepository(GymZone).find({
                    where: { branch_id: In(branchIds), is_active: true },
                    order: { is_signature_zone: 'DESC', sort_order: 'ASC' },
                })
                : [],
            branchIds.length > 0
                ? AppDataSource.getRepository(GymProgram).find({
                    where: { branch_id: In(branchIds), is_active: true },
                    order: { title: 'ASC' },
                })
                : [],
            branchIds.length > 0
                ? AppDataSource.getRepository(GymLeadRoute).find({
                    where: { branch_id: In(branchIds), is_active: true },
                })
                : [],
            AppDataSource.getRepository(GymCenterTaxonomyTerm).find({
                where: { gym_center_id: gym.id },
                relations: ['term'],
                order: { is_primary: 'DESC', sort_order: 'ASC' },
            }),
        ]);

        // Compute trust dimension aggregates
        const reviewCount = reviews.length;
        const avgRating = reviewCount > 0
            ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviewCount) * 10) / 10
            : null;

        const dimFields = ['equipment_rating', 'cleanliness_rating', 'coaching_rating', 'atmosphere_rating', 'value_rating', 'crowd_rating'] as const;
        const trustDimensions: Record<string, number | null> = {};
        for (const field of dimFields) {
            const vals = reviews.map(r => r[field]).filter((v): v is number => v !== null && v !== undefined);
            trustDimensions[field] = vals.length > 0
                ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
                : null;
        }

        // Group branch-level data
        const branchDetailMap = new Map<string, {
            gallery: GymGallery[];
            amenities: typeof amenities;
            equipment: typeof equipment;
            pricing: typeof pricing;
            reviews: typeof reviews;
            trainer_links: typeof trainerLinks;
            zones: typeof zones;
            programs: typeof programs;
            lead_routes: typeof leadRoutes;
        }>();

        branchIds.forEach(bid => {
            branchDetailMap.set(bid, {
                gallery: gallery.filter(i => i.branch_id === bid),
                amenities: amenities.filter(a => a.branch_id === bid),
                equipment: equipment.filter(e => e.branch_id === bid),
                pricing: pricing.filter(p => p.branch_id === bid),
                reviews: reviews.filter(r => r.branch_id === bid),
                trainer_links: trainerLinks.filter(t => t.branch_id === bid),
                zones: zones.filter(z => z.branch_id === bid),
                programs: programs.filter(pg => pg.branch_id === bid),
                lead_routes: leadRoutes.filter(lr => lr.branch_id === bid),
            });
        });

        const branchesWithDetail = (gym.branches || [])
            .filter(b => b.is_active)
            .map(b => ({
                ...b,
                ...(branchDetailMap.get(b.id) ?? {}),
            }));

        return {
            ...gym,
            taxonomy_terms: taxonomyTerms,
            branches: branchesWithDetail,
            trust_summary: {
                avg_rating: avgRating,
                review_count: reviewCount,
                dimensions: trustDimensions,
            },
        };
    },

    /**
     * Similar venues based on venue type, price band, city, and audience tags.
     */
    async getSimilarGyms(gymCenterId: string, limit = 4) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const sourceGym = await gymCenterRepo.findOne({
            where: { id: gymCenterId, is_active: true, is_verified: true },
            relations: ['branches'],
        });
        if (!sourceGym) return [];

        const sourceBranch = (sourceGym.branches || [])[0];
        const sourceCity = sourceBranch?.city ?? null;
        const sourceVenueType = sourceGym.primary_venue_type_slug;
        const sourcePriceFrom = sourceGym.price_from_amount ?? 0;
        const priceFloor = sourcePriceFrom * 0.4;
        const priceCeil = sourcePriceFrom > 0 ? sourcePriceFrom * 2.5 : 999_999_999;

        const qb = gymCenterRepo.createQueryBuilder('gc')
            .leftJoinAndSelect('gc.branches', 'b', 'b.is_active = true')
            .where('gc.is_active = true')
            .andWhere('gc.is_verified = true')
            .andWhere('gc.deleted_at IS NULL')
            .andWhere('gc.id != :id', { id: gymCenterId });

        const orConditions: string[] = [];
        if (sourceVenueType) {
            orConditions.push('gc.primary_venue_type_slug = :vt');
        }
        if (sourceCity) {
            orConditions.push('b.city ILIKE :city');
        }
        if (sourcePriceFrom > 0) {
            orConditions.push('(gc.price_from_amount BETWEEN :pf AND :pc)');
        }

        if (orConditions.length > 0) {
            qb.andWhere(`(${orConditions.join(' OR ')})`, {
                vt: sourceVenueType ?? undefined,
                city: sourceCity ? `%${sourceCity}%` : undefined,
                pf: priceFloor,
                pc: priceCeil,
            });
        }

        qb.orderBy('gc.featured_weight', 'DESC')
            .addOrderBy('gc.view_count', 'DESC')
            .take(limit);

        const similar = await qb.getMany();

        // Attach listing thumbnails
        const branchIds = similar.flatMap(g => (g.branches || []).map(b => b.id));
        let thumbMap = new Map<string, GymGallery>();
        if (branchIds.length > 0) {
            const thumbs = await AppDataSource.getRepository(GymGallery).find({
                where: { branch_id: In(branchIds), is_listing_thumb: true },
                order: { order_number: 'ASC' },
            });
            const branchToGym = new Map<string, string>();
            similar.forEach(g => (g.branches || []).forEach(b => branchToGym.set(b.id, g.id)));
            thumbs.forEach(t => {
                const gid = branchToGym.get(t.branch_id);
                if (gid && !thumbMap.has(gid)) thumbMap.set(gid, t);
            });
        }

        return similar.map(g => ({
            ...g,
            listing_thumbnail: thumbMap.get(g.id) ?? null,
        }));
    },

    // ── TAXONOMY ─────────────────────────────────────────────────────────

    async listTaxonomyTerms(termType?: string) {
        const repo = AppDataSource.getRepository(GymTaxonomyTerm);
        const where = termType ? { term_type: termType as any, is_active: true } : { is_active: true };
        return repo.find({ where, order: { sort_order: 'ASC', label: 'ASC' } });
    },

    async setGymTaxonomyTerms(gymCenterId: string, ownerId: string, termIds: string[], primaryTermId?: string) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const gym = await gymCenterRepo.findOne({ where: { id: gymCenterId, owner_id: ownerId } });
        if (!gym) throw new Error('Gym not found or unauthorized');

        const ctRepo = AppDataSource.getRepository(GymCenterTaxonomyTerm);
        await ctRepo.delete({ gym_center_id: gymCenterId });

        const entries = termIds.map((tid, i) =>
            ctRepo.create({
                gym_center_id: gymCenterId,
                term_id: tid,
                is_primary: tid === primaryTermId,
                sort_order: i,
            })
        );
        return ctRepo.save(entries);
    },

    // ── ZONES ────────────────────────────────────────────────────────────

    async getBranchZones(branchId: string) {
        return AppDataSource.getRepository(GymZone).find({
            where: { branch_id: branchId, is_active: true },
            order: { is_signature_zone: 'DESC', sort_order: 'ASC' },
        });
    },

    async upsertZone(branchId: string, ownerId: string, zoneData: Partial<GymZone> & { id?: string }) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const branch = await branchRepo.findOne({ where: { id: branchId }, relations: ['gym_center'] });
        if (!branch || branch.gym_center.owner_id !== ownerId) throw new Error('Unauthorized');

        const repo = AppDataSource.getRepository(GymZone);
        if (zoneData.id) {
            const zone = await repo.findOne({ where: { id: zoneData.id, branch_id: branchId } });
            if (!zone) throw new Error('Zone not found');
            Object.assign(zone, zoneData);
            return repo.save(zone);
        }
        const zone = repo.create({ ...zoneData, branch_id: branchId });
        return repo.save(zone);
    },

    async deleteZone(zoneId: string, branchId: string, ownerId: string) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const branch = await branchRepo.findOne({ where: { id: branchId }, relations: ['gym_center'] });
        if (!branch || branch.gym_center.owner_id !== ownerId) throw new Error('Unauthorized');
        await AppDataSource.getRepository(GymZone).delete({ id: zoneId, branch_id: branchId });
    },

    // ── PROGRAMS ─────────────────────────────────────────────────────────

    async getBranchPrograms(branchId: string) {
        return AppDataSource.getRepository(GymProgram).find({
            where: { branch_id: branchId, is_active: true },
            order: { title: 'ASC' },
        });
    },

    async upsertProgram(branchId: string, ownerId: string, programData: Partial<GymProgram> & { id?: string }) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const branch = await branchRepo.findOne({ where: { id: branchId }, relations: ['gym_center'] });
        if (!branch || branch.gym_center.owner_id !== ownerId) throw new Error('Unauthorized');

        const repo = AppDataSource.getRepository(GymProgram);
        if (programData.id) {
            const prog = await repo.findOne({ where: { id: programData.id, branch_id: branchId } });
            if (!prog) throw new Error('Program not found');
            Object.assign(prog, programData);
            return repo.save(prog);
        }
        const prog = repo.create({ ...programData, branch_id: branchId });
        return repo.save(prog);
    },

    async getProgramSessions(programId: string, from?: Date, to?: Date) {
        const qb = AppDataSource.getRepository(GymProgramSession)
            .createQueryBuilder('s')
            .where('s.program_id = :id', { id: programId })
            .andWhere('s.is_cancelled = false');
        if (from) qb.andWhere('s.starts_at >= :from', { from });
        if (to) qb.andWhere('s.starts_at <= :to', { to });
        return qb.orderBy('s.starts_at', 'ASC').getMany();
    },

    // ── LEAD ROUTES ───────────────────────────────────────────────────────

    async getBranchLeadRoutes(branchId: string) {
        return AppDataSource.getRepository(GymLeadRoute).find({
            where: { branch_id: branchId, is_active: true },
        });
    },

    async upsertLeadRoute(branchId: string, ownerId: string, routeData: Partial<GymLeadRoute> & { id?: string }) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const branch = await branchRepo.findOne({ where: { id: branchId }, relations: ['gym_center'] });
        if (!branch || branch.gym_center.owner_id !== ownerId) throw new Error('Unauthorized');

        const repo = AppDataSource.getRepository(GymLeadRoute);
        if (routeData.id) {
            const route = await repo.findOne({ where: { id: routeData.id, branch_id: branchId } });
            if (!route) throw new Error('Lead route not found');
            Object.assign(route, routeData);
            return repo.save(route);
        }
        const route = repo.create({ ...routeData, branch_id: branchId });
        return repo.save(route);
    },

    // ── PRICE_FROM SYNC ───────────────────────────────────────────────────

    /**
     * Recalculate and persist price_from_amount + price_from_billing_cycle
     * from the gym center's cheapest active pricing row.
     */
    async syncPriceFrom(gymCenterId: string) {
        const gymCenterRepo = AppDataSource.getRepository(GymCenter);
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const pricingRepo = AppDataSource.getRepository(GymPricing);

        const branches = await branchRepo.find({ where: { gym_center_id: gymCenterId, is_active: true } });
        const branchIds = branches.map(b => b.id);
        if (branchIds.length === 0) return;

        const allPricing = await pricingRepo.find({ where: { branch_id: In(branchIds) } });
        const valid = allPricing.filter(p => Number(p.price) > 0);
        if (valid.length === 0) return;

        valid.sort((a, b) => Number(a.price) - Number(b.price));
        const cheapest = valid[0];

        await gymCenterRepo.update(gymCenterId, {
            price_from_amount: Number(cheapest.price),
            price_from_billing_cycle: cheapest.billing_cycle,
        });
    },

    // ── BRANCH DETAIL (enhanced, includes new fields) ─────────────────────

    async getBranchDetailMarketplace(branchId: string) {
        const branchRepo = AppDataSource.getRepository(GymBranch);
        const branch = await branchRepo.findOne({
            where: { id: branchId, is_active: true },
            relations: ['gym_center'],
        });
        if (!branch) return null;

        await branchRepo.update(branchId, { view_count: () => 'view_count + 1' });

        const [gallery, amenities, equipment, pricing, reviews, trainerLinks, zones, programs, leadRoutes] =
            await Promise.all([
                AppDataSource.getRepository(GymGallery).find({
                    where: { branch_id: branchId },
                    order: { is_hero: 'DESC', is_featured: 'DESC', order_number: 'ASC' },
                }),
                AppDataSource.getRepository(GymAmenity).find({ where: { branch_id: branchId } }),
                AppDataSource.getRepository(GymEquipment).find({ where: { branch_id: branchId } }),
                AppDataSource.getRepository(GymPricing).find({
                    where: { branch_id: branchId },
                    order: { order_number: 'ASC' },
                }),
                AppDataSource.getRepository(GymReview).find({
                    where: { branch_id: branchId, is_visible: true },
                    order: { created_at: 'DESC' },
                    take: 20,
                }),
                AppDataSource.getRepository(GymTrainerLink).find({
                    where: { branch_id: branchId, status: 'active' },
                    order: { featured_at_branch: 'DESC', visible_order: 'ASC' },
                }),
                AppDataSource.getRepository(GymZone).find({
                    where: { branch_id: branchId, is_active: true },
                    order: { is_signature_zone: 'DESC', sort_order: 'ASC' },
                }),
                AppDataSource.getRepository(GymProgram).find({
                    where: { branch_id: branchId, is_active: true },
                    order: { title: 'ASC' },
                }),
                AppDataSource.getRepository(GymLeadRoute).find({
                    where: { branch_id: branchId, is_active: true },
                }),
            ]);

        return {
            ...branch,
            gallery,
            amenities,
            equipment,
            pricing,
            reviews,
            trainer_links: trainerLinks,
            zones,
            programs,
            lead_routes: leadRoutes,
        };
    },
};
