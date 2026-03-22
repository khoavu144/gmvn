import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Testimonial } from '../entities/Testimonial';
import { BeforeAfterPhoto } from '../entities/BeforeAfterPhoto';
import { UpdateProfileInput } from '../schemas/user';



class UserService {
    private get repo() {
        return AppDataSource.getRepository(User);
    }
    async updateProfile(userId: string, input: UpdateProfileInput) {
        const user = await this.repo.findOneBy({ id: userId });
        if (!user) {
            throw new Error('User not found');
        }

        // Merge input into user entity
        Object.assign(user, input);

        await this.repo.save(user);

        return {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            user_type: user.user_type,
            avatar_url: user.avatar_url,
            bio: user.bio,
            height_cm: user.height_cm,
            current_weight_kg: user.current_weight_kg,
            experience_level: user.experience_level,
            specialties: user.specialties,
            base_price_monthly: user.base_price_monthly,
            is_verified: user.is_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
        };
    }

    async getTrainers(
        page: number = 1,
        limit: number = 10,
        search?: string,
        specialty?: string,
        priceMin?: number,
        priceMax?: number,
        city?: string,
        sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating_desc' | 'views_desc',
        user_type?: 'trainer' | 'athlete'
    ) {
        const queryBuilder = this.repo.createQueryBuilder('user')
            .where('user.user_type = :type', { type: user_type || 'trainer' });

        if (search) {
            queryBuilder.andWhere(
                '(user.full_name ILIKE :search OR user.bio ILIKE :search OR EXISTS (SELECT 1 FROM jsonb_array_elements_text(user.specialties) AS spec WHERE spec ILIKE :search))',
                { search: `%${search}%` }
            );
        }

        // Sprint 2: Specialty filter (JSONB array contains)
        if (specialty) {
            queryBuilder.andWhere(
                'EXISTS (SELECT 1 FROM jsonb_array_elements_text(user.specialties) AS spec WHERE spec ILIKE :specialty)',
                { specialty: `%${specialty}%` }
            );
        }

        // Sprint 2: Price range filter
        if (priceMin !== undefined) {
            queryBuilder.andWhere('user.base_price_monthly >= :priceMin', { priceMin });
        }
        if (priceMax !== undefined) {
            queryBuilder.andWhere('user.base_price_monthly <= :priceMax', { priceMax });
        }

        // Sprint 2: City filter (via trainer's city field if available, otherwise skip)
        if (city) {
            queryBuilder.andWhere('user.city ILIKE :city', { city: `%${city}%` });
        }

        // Sprint 2: Sort
        switch (sort) {
            case 'price_asc':
                queryBuilder.orderBy('user.base_price_monthly', 'ASC', 'NULLS LAST');
                break;
            case 'price_desc':
                queryBuilder.orderBy('user.base_price_monthly', 'DESC', 'NULLS LAST');
                break;
            case 'rating_desc':
                queryBuilder.orderBy('user.avg_rating', 'DESC', 'NULLS LAST');
                queryBuilder.addOrderBy('user.created_at', 'DESC');
                break;
            case 'views_desc':
                queryBuilder.orderBy('user.profile_view_count', 'DESC');
                queryBuilder.addOrderBy('user.created_at', 'DESC');
                break;
            case 'newest':
            default:
                queryBuilder.orderBy('user.created_at', 'DESC');
                break;
        }

        const [trainers, total] = await queryBuilder
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const trainerIds = trainers.map((t) => t.id);
        const profileRows: Array<{ trainer_id: string; slug: string | null; headline: string | null }> = trainerIds.length
            ? await AppDataSource
                .createQueryBuilder()
                .select('profile.trainer_id', 'trainer_id')
                .addSelect('profile.slug', 'slug')
                .addSelect('profile.headline', 'headline')
                .from('trainer_profiles', 'profile')
                .where('profile.trainer_id IN (:...ids)', { ids: trainerIds })
                .getRawMany()
            : [];

        const profileByTrainerId = new Map(profileRows.map((row) => [row.trainer_id, row]));

        return {
            trainers: trainers.map((t) => {
                const profileRow = profileByTrainerId.get(t.id);
                return {
                    id: t.id,
                    user_type: t.user_type,
                    profile_slug: profileRow?.slug ?? t.slug ?? null, // for /coach/:slug URL
                    full_name: t.full_name,
                    headline: profileRow?.headline ?? null,
                    avatar_url: t.avatar_url,
                    bio: t.bio,
                    specialties: t.specialties,
                    base_price_monthly: t.base_price_monthly,
                    is_verified: t.is_verified,
                    city: t.city ?? null,
                    avg_rating: t.avg_rating != null ? Number(t.avg_rating) : null,
                };
            }),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }


    async getTrainerById(id: string) {
        const trainer = await this.repo.findOneBy({ id });
        if (!trainer || (trainer.user_type !== 'trainer' && trainer.user_type !== 'athlete')) {
            throw new Error('Trainer not found');
        }

        const profileRow = await AppDataSource
            .createQueryBuilder()
            .select('profile.slug', 'slug')
            .from('trainer_profiles', 'profile')
            .where('profile.trainer_id = :trainerId', { trainerId: id })
            .getRawOne<{ slug: string | null }>();

        const resolvedSlug = profileRow?.slug ?? trainer.slug ?? null;

        return {
            id: trainer.id,
            slug: resolvedSlug,
            profile_slug: resolvedSlug,
            full_name: trainer.full_name,
            avatar_url: trainer.avatar_url,
            bio: trainer.bio,
            specialties: trainer.specialties,
            base_price_monthly: trainer.base_price_monthly,
            is_verified: trainer.is_verified,
            created_at: trainer.created_at,
        };
    }

    async getTrainerBySlug(slug: string) {
        let trainer = await this.repo.findOneBy({ slug, user_type: 'trainer' });

        if (!trainer) {
            const profileRow = await AppDataSource
                .createQueryBuilder()
                .select('profile.trainer_id', 'trainer_id')
                .from('trainer_profiles', 'profile')
                .where('profile.slug = :slug', { slug })
                .getRawOne<{ trainer_id: string }>();

            if (profileRow?.trainer_id) {
                trainer = await this.repo.findOneBy({ id: profileRow.trainer_id, user_type: 'trainer' });
            }
        }

        if (!trainer) {
            throw new Error('Trainer not found');
        }

        return {
            id: trainer.id,
            slug,
            full_name: trainer.full_name,
            avatar_url: trainer.avatar_url,
            bio: trainer.bio,
            specialties: trainer.specialties,
            base_price_monthly: trainer.base_price_monthly,
            is_verified: trainer.is_verified,
            created_at: trainer.created_at,
        };
    }

    /** Generic slug lookup — returns ANY user_type (trainer or athlete). Used by CoachDetailPage to redirect athletes. */
    async getUserBySlug(slug: string) {
        // Try exact user slug first
        let user = await this.repo.findOneBy({ slug });

        if (!user) {
            // Try trainer_profile.slug
            const profileRow = await AppDataSource
                .createQueryBuilder()
                .select('profile.trainer_id', 'trainer_id')
                .from('trainer_profiles', 'profile')
                .where('profile.slug = :slug', { slug })
                .getRawOne<{ trainer_id: string }>();

            if (profileRow?.trainer_id) {
                user = await this.repo.findOneBy({ id: profileRow.trainer_id });
            }
        }

        if (!user) {
            throw new Error('User not found');
        }

        const profileSlugRow = await AppDataSource
            .createQueryBuilder()
            .select('profile.slug', 'slug')
            .from('trainer_profiles', 'profile')
            .where('profile.trainer_id = :id', { id: user.id })
            .getRawOne<{ slug: string | null }>();

        const resolvedSlug = profileSlugRow?.slug ?? user.slug ?? slug;

        return {
            id: user.id,
            slug: resolvedSlug,
            user_type: user.user_type,
            full_name: user.full_name,
            avatar_url: user.avatar_url,
            bio: user.bio,
            specialties: user.specialties,
            base_price_monthly: user.base_price_monthly,
            is_verified: user.is_verified,
            created_at: user.created_at,
        };
    }

    async getSimilarCoaches(trainerId: string, limit: number = 3, targetUserType?: 'trainer' | 'athlete') {
        const user = await this.repo.findOneBy({ id: trainerId });
        if (!user) {
            return [];
        }

        const userType = targetUserType ?? (user.user_type === 'athlete' ? 'athlete' : 'trainer');

        let similarTrainers: User[] = [];

        if (user.specialties && user.specialties.length > 0) {
            // Find users with overlapping specialties
            const queryBuilder = this.repo.createQueryBuilder('user')
                .where('user.user_type = :type', { type: userType })
                .andWhere('user.id != :trainerId', { trainerId });

            const specialtyConditions = user.specialties.map((_, idx) =>
                `EXISTS (SELECT 1 FROM jsonb_array_elements_text(user.specialties) AS spec WHERE spec ILIKE :specialty${idx})`
            ).join(' OR ');

            const params: Record<string, string> = {};
            user.specialties.forEach((spec, idx) => {
                params[`specialty${idx}`] = `%${spec}%`;
            });

            similarTrainers = await queryBuilder
                .andWhere(`(${specialtyConditions})`, params)
                .orderBy('user.created_at', 'DESC')
                .limit(limit)
                .getMany();
        }

        // Fallback: return newest users of same type when specialty match is empty
        if (similarTrainers.length === 0) {
            similarTrainers = await this.repo.createQueryBuilder('user')
                .where('user.user_type = :type', { type: userType })
                .andWhere('user.id != :trainerId', { trainerId })
                .orderBy('user.created_at', 'DESC')
                .limit(limit)
                .getMany();
        }

        const similarIds = similarTrainers.map((t) => t.id);
        const similarProfileRows: Array<{ trainer_id: string; slug: string | null }> = similarIds.length
            ? await AppDataSource
                .createQueryBuilder()
                .select('profile.trainer_id', 'trainer_id')
                .addSelect('profile.slug', 'slug')
                .from('trainer_profiles', 'profile')
                .where('profile.trainer_id IN (:...ids)', { ids: similarIds })
                .getRawMany()
            : [];

        const profileSlugByTrainerId = new Map(similarProfileRows.map((row) => [row.trainer_id, row.slug]));

        return similarTrainers.map(t => {
            const resolvedSlug = profileSlugByTrainerId.get(t.id) ?? t.slug ?? null;
            return {
                id: t.id,
                slug: resolvedSlug,
                profile_slug: resolvedSlug,
                full_name: t.full_name,
                avatar_url: t.avatar_url,
                bio: t.bio,
                specialties: t.specialties,
                base_price_monthly: t.base_price_monthly,
                is_verified: t.is_verified,
                user_type: t.user_type,
            };
        });
    }

    async getTestimonials(trainerId: string, page: number = 1, limit: number = 10) {
        const testimonialRepo = AppDataSource.getRepository(Testimonial);

        const [testimonials, total] = await testimonialRepo.findAndCount({
            where: { trainer_id: trainerId, is_approved: true },
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            testimonials: testimonials.map(t => ({
                id: t.id,
                client_name: t.client_name,
                client_avatar: t.client_avatar,
                rating: t.rating,
                comment: t.comment,
                created_at: t.created_at,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getBeforeAfterPhotos(trainerId: string) {
        const photoRepo = AppDataSource.getRepository(BeforeAfterPhoto);

        const photos = await photoRepo.find({
            where: { trainer_id: trainerId, is_approved: true },
            order: { created_at: 'DESC' },
        });

        return photos.map(p => ({
            id: p.id,
            before_url: p.before_url,
            after_url: p.after_url,
            client_name: p.client_name,
            story: p.story,
            duration_weeks: p.duration_weeks,
            created_at: p.created_at,
        }));
    }
}

export const userService = new UserService();
