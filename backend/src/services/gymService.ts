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
};
