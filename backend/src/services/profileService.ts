import { AppDataSource } from '../config/database';
import { TrainerProfile } from '../entities/TrainerProfile';
import { TrainerExperience } from '../entities/TrainerExperience';
import { TrainerGallery } from '../entities/TrainerGallery';
import { TrainerFAQ } from '../entities/TrainerFAQ';

const profileRepo = () => AppDataSource.getRepository(TrainerProfile);
const expRepo = () => AppDataSource.getRepository(TrainerExperience);
const galleryRepo = () => AppDataSource.getRepository(TrainerGallery);
const faqRepo = () => AppDataSource.getRepository(TrainerFAQ);

export class ProfileService {
    // ── Core Profile ─────────────────────────────────────────────────────────

    async getProfileByTrainerId(trainerId: string): Promise<TrainerProfile | null> {
        return profileRepo().findOne({ where: { trainer_id: trainerId }, relations: ['trainer'] });
    }

    async getProfileBySlug(slug: string): Promise<TrainerProfile | null> {
        return profileRepo().findOne({ where: { slug }, relations: ['trainer'] });
    }

    async getPublicProfile(trainerId: string): Promise<TrainerProfile | null> {
        return profileRepo().findOne({
            where: { trainer_id: trainerId, is_profile_public: true },
            relations: ['trainer'],
        });
    }

    async upsertProfile(trainerId: string, data: Partial<TrainerProfile>): Promise<TrainerProfile> {
        let profile = await profileRepo().findOne({ where: { trainer_id: trainerId } });
        if (!profile) {
            profile = profileRepo().create({ trainer_id: trainerId, ...data });
        } else {
            if (data.slug && data.slug !== profile.slug) {
                const slugExists = await profileRepo().findOne({ where: { slug: data.slug } });
                if (slugExists && slugExists.trainer_id !== trainerId) {
                    throw new Error('Slug already taken');
                }
            }
            Object.assign(profile, data);
        }
        return profileRepo().save(profile);
    }

    async trackView(trainerId: string): Promise<void> {
        // View tracked for trainer: ${trainerId}
    }

    // ── Experience ───────────────────────────────────────────────────────────

    async getExperience(trainerId: string): Promise<TrainerExperience[]> {
        return expRepo().find({ where: { trainer_id: trainerId }, order: { start_date: 'DESC' } });
    }

    async addExperience(trainerId: string, data: Partial<TrainerExperience>): Promise<TrainerExperience> {
        const exp = expRepo().create({ trainer_id: trainerId, ...data });
        return expRepo().save(exp);
    }

    async updateExperience(trainerId: string, id: string, data: Partial<TrainerExperience>): Promise<TrainerExperience> {
        const exp = await expRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!exp) throw new Error('Experience not found');
        Object.assign(exp, data);
        return expRepo().save(exp);
    }

    async deleteExperience(trainerId: string, id: string): Promise<void> {
        const exp = await expRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!exp) throw new Error('Experience not found');
        await expRepo().remove(exp);
    }

    // ── Gallery ──────────────────────────────────────────────────────────────

    async getGallery(trainerId: string): Promise<TrainerGallery[]> {
        return galleryRepo().find({ where: { trainer_id: trainerId }, order: { order_number: 'ASC', created_at: 'DESC' } });
    }

    async addGalleryImage(trainerId: string, data: Partial<TrainerGallery>): Promise<TrainerGallery> {
        const img = galleryRepo().create({ trainer_id: trainerId, ...data });
        return galleryRepo().save(img);
    }

    async updateGalleryImage(trainerId: string, id: string, data: Partial<TrainerGallery>): Promise<TrainerGallery> {
        const img = await galleryRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!img) throw new Error('Gallery image not found');
        Object.assign(img, data);
        return galleryRepo().save(img);
    }

    async deleteGalleryImage(trainerId: string, id: string): Promise<void> {
        const img = await galleryRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!img) throw new Error('Gallery image not found');
        await galleryRepo().remove(img);
    }

    // ── FAQ ──────────────────────────────────────────────────────────────────

    async getFAQ(trainerId: string): Promise<TrainerFAQ[]> {
        return faqRepo().find({ where: { trainer_id: trainerId }, order: { order_number: 'ASC', created_at: 'ASC' } });
    }

    async addFAQ(trainerId: string, data: Partial<TrainerFAQ>): Promise<TrainerFAQ> {
        const faq = faqRepo().create({ trainer_id: trainerId, ...data });
        return faqRepo().save(faq);
    }

    async updateFAQ(trainerId: string, id: string, data: Partial<TrainerFAQ>): Promise<TrainerFAQ> {
        const faq = await faqRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!faq) throw new Error('FAQ not found');
        Object.assign(faq, data);
        return faqRepo().save(faq);
    }

    async deleteFAQ(trainerId: string, id: string): Promise<void> {
        const faq = await faqRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!faq) throw new Error('FAQ not found');
        await faqRepo().remove(faq);
    }

    // ── Full public profile (profile + related data) ─────────────────────────

    async getFullPublicProfile(trainerId: string) {
        const [profile, experience, gallery, faq] = await Promise.all([
            this.getPublicProfile(trainerId),
            this.getExperience(trainerId),
            this.getGallery(trainerId),
            this.getFAQ(trainerId),
        ]);
        if (!profile) return null;
        return { profile, experience, gallery, faq };
    }
}

export const profileService = new ProfileService();
