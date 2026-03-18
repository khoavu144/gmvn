import { AppDataSource } from '../config/database';
import { CommunityGallery } from '../entities/CommunityGallery';
import { TrainerGallery } from '../entities/TrainerGallery';
import { User } from '../entities/User';

const repo = () => AppDataSource.getRepository(CommunityGallery);

export const communityGalleryService = {

    // ── Public ───────────────────────────────────────────────────────────────

    async getPublicGallery(options: {
        page?: number;
        limit?: number;
        category?: string;
    }) {
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(48, Math.max(1, options.limit || 24));
        const offset = (page - 1) * limit;

        const qb = repo().createQueryBuilder('cg')
            .leftJoinAndSelect('cg.linked_user', 'user')
            .where('cg.is_active = :active', { active: true })
            .orderBy('cg.order_number', 'ASC')
            .addOrderBy('cg.created_at', 'DESC')
            .skip(offset)
            .take(limit);

        if (options.category && options.category !== 'all') {
            qb.andWhere('cg.category = :category', { category: options.category });
        }

        const [items, total] = await qb.getManyAndCount();

        return {
            items: items.map(item => ({
                id: item.id,
                image_url: item.image_url,
                caption: item.caption,
                category: item.category,
                source: item.source,
                is_featured: item.is_featured,
                created_at: item.created_at,
                linked_user: item.linked_user ? {
                    id: item.linked_user.id,
                    full_name: item.linked_user.full_name,
                    avatar_url: item.linked_user.avatar_url,
                    slug: item.linked_user.slug,
                    user_type: item.linked_user.user_type,
                } : null,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    },

    async getStats() {
        const total = await repo().count({ where: { is_active: true } });
        const featured = await repo().count({ where: { is_active: true, is_featured: true } });

        const linkedUsers = await repo().createQueryBuilder('cg')
            .select('COUNT(DISTINCT cg.linked_user_id)', 'count')
            .where('cg.is_active = :active AND cg.linked_user_id IS NOT NULL', { active: true })
            .getRawOne();

        return {
            total_images: total,
            featured_images: featured,
            total_contributors: parseInt(linkedUsers?.count || '0', 10),
        };
    },

    // ── Admin CRUD ───────────────────────────────────────────────────────────

    async adminGetAll(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const [items, total] = await repo().findAndCount({
            relations: ['linked_user', 'uploader'],
            order: { created_at: 'DESC' },
            skip: offset,
            take: limit,
        });
        return { items, total, page, totalPages: Math.ceil(total / limit) };
    },

    async adminCreate(adminId: string, data: {
        image_url: string;
        caption?: string;
        category?: string;
        linked_user_id?: string;
        source_image_id?: string;
        source?: string;
        is_featured?: boolean;
        order_number?: number;
    }) {
        const item = repo().create({
            ...data,
            uploaded_by: adminId,
            source: (data.source as any) || 'admin_upload',
            is_active: true,
        } as any);
        return repo().save(item);
    },

    async adminUpdate(id: string, data: Partial<CommunityGallery>) {
        const item = await repo().findOneBy({ id });
        if (!item) throw new Error('Gallery item not found');
        Object.assign(item, data);
        return repo().save(item);
    },

    async adminDelete(id: string) {
        const item = await repo().findOneBy({ id });
        if (!item) throw new Error('Gallery item not found');
        await repo().remove(item);
    },

    /** Import a trainer gallery image into community gallery */
    async adminImportFromTrainer(adminId: string, trainerGalleryId: string, linkedUserId: string) {
        const trainerGalleryRepo = AppDataSource.getRepository(TrainerGallery);
        const sourceImg = await trainerGalleryRepo.findOneBy({ id: trainerGalleryId });
        if (!sourceImg) throw new Error('Trainer gallery image not found');

        return this.adminCreate(adminId, {
            image_url: sourceImg.image_url,
            caption: sourceImg.caption || undefined,
            category: sourceImg.image_type === 'transformation' ? 'transformation' : 'workout',
            linked_user_id: linkedUserId,
            source_image_id: trainerGalleryId,
            source: 'trainer_gallery',
        });
    },

    /** Bulk import all gallery images from a trainer */
    async adminBulkImportFromTrainer(adminId: string, trainerId: string) {
        const trainerGalleryRepo = AppDataSource.getRepository(TrainerGallery);
        const images = await trainerGalleryRepo.find({
            where: { trainer_id: trainerId },
            order: { order_number: 'ASC' },
        });

        const results = [];
        for (const img of images) {
            // Skip if already imported
            const existing = await repo().findOneBy({ source_image_id: img.id });
            if (existing) continue;

            const item = await this.adminCreate(adminId, {
                image_url: img.image_url,
                caption: img.caption || undefined,
                category: img.image_type === 'transformation' ? 'transformation' : 'workout',
                linked_user_id: trainerId,
                source_image_id: img.id,
                source: 'trainer_gallery',
            });
            results.push(item);
        }
        return results;
    },
};
