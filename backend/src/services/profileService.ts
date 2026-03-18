import { AppDataSource } from '../config/database';
import { TrainerProfile } from '../entities/TrainerProfile';
import { TrainerExperience } from '../entities/TrainerExperience';
import { TrainerGallery } from '../entities/TrainerGallery';
import { TrainerFAQ } from '../entities/TrainerFAQ';
import { TrainerSkill } from '../entities/TrainerSkill';
import { TrainerPackage } from '../entities/TrainerPackage';
import { Testimonial } from '../entities/Testimonial';
import { TrainerProfileHighlight } from '../entities/TrainerProfileHighlight';
import { TrainerMediaFeature } from '../entities/TrainerMediaFeature';
import { TrainerPressMention } from '../entities/TrainerPressMention';

const profileRepo = () => AppDataSource.getRepository(TrainerProfile);
const expRepo = () => AppDataSource.getRepository(TrainerExperience);
const galleryRepo = () => AppDataSource.getRepository(TrainerGallery);
const faqRepo = () => AppDataSource.getRepository(TrainerFAQ);
const skillRepo = () => AppDataSource.getRepository(TrainerSkill);
const packageRepo = () => AppDataSource.getRepository(TrainerPackage);
const testimonialRepo = () => AppDataSource.getRepository(Testimonial);
const highlightRepo = () => AppDataSource.getRepository(TrainerProfileHighlight);
const mediaFeatureRepo = () => AppDataSource.getRepository(TrainerMediaFeature);
const pressMentionRepo = () => AppDataSource.getRepository(TrainerPressMention);

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

    // ── Full public profile (profile + all related data) ─────────────────────

    async getHighlights(trainerId: string): Promise<TrainerProfileHighlight[]> {
        return highlightRepo().find({ where: { trainer_id: trainerId, is_active: true }, order: { order_number: 'ASC', created_at: 'ASC' } });
    }

    async getMediaFeatures(trainerId: string): Promise<TrainerMediaFeature[]> {
        return mediaFeatureRepo().find({ where: { trainer_id: trainerId, is_active: true }, order: { is_featured: 'DESC', order_number: 'ASC', created_at: 'ASC' } });
    }

    async getPressMentions(trainerId: string): Promise<TrainerPressMention[]> {
        return pressMentionRepo().find({ where: { trainer_id: trainerId, is_active: true }, order: { order_number: 'ASC', published_at: 'DESC', created_at: 'DESC' } });
    }

    async getFullPublicProfile(trainerId: string) {
        const [profile, experience, gallery, faq, skills, packages, testimonials, highlights, mediaFeatures, pressMentions] = await Promise.all([
            this.getPublicProfile(trainerId),
            this.getExperience(trainerId),
            this.getGallery(trainerId),
            this.getFAQ(trainerId),
            this.getSkills(trainerId),
            this.getPackages(trainerId),
            this.getTestimonials(trainerId),
            this.getHighlights(trainerId),
            this.getMediaFeatures(trainerId),
            this.getPressMentions(trainerId),
        ]);
        if (!profile) return null;
        return {
            profile,
            experience,
            gallery,
            faq,
            skills,
            packages,
            testimonials,
            premium: {
                hero: {
                    tagline: profile.profile_tagline,
                    themeVariant: profile.profile_theme_variant,
                    badges: profile.hero_badges ?? [],
                    metrics: profile.key_metrics ?? [],
                    ctaConfig: profile.cta_config,
                    isFeaturedProfile: profile.is_featured_profile,
                },
                sectionOrder: profile.section_order ?? [],
                highlights,
                mediaFeatures,
                pressMentions,
            },
        };
    }

    async getFullPublicProfileBySlug(slug: string) {
        const profile = await this.getProfileBySlug(slug);
        if (!profile || !profile.is_profile_public) return null;
        const trainerId = profile.trainer_id;
        const [experience, gallery, faq, skills, packages, testimonials, highlights, mediaFeatures, pressMentions] = await Promise.all([
            this.getExperience(trainerId),
            this.getGallery(trainerId),
            this.getFAQ(trainerId),
            this.getSkills(trainerId),
            this.getPackages(trainerId),
            this.getTestimonials(trainerId),
            this.getHighlights(trainerId),
            this.getMediaFeatures(trainerId),
            this.getPressMentions(trainerId),
        ]);
        this.trackView(trainerId).catch(() => { });
        return {
            profile,
            experience,
            gallery,
            faq,
            skills,
            packages,
            testimonials,
            premium: {
                hero: {
                    tagline: profile.profile_tagline,
                    themeVariant: profile.profile_theme_variant,
                    badges: profile.hero_badges ?? [],
                    metrics: profile.key_metrics ?? [],
                    ctaConfig: profile.cta_config,
                    isFeaturedProfile: profile.is_featured_profile,
                },
                sectionOrder: profile.section_order ?? [],
                highlights,
                mediaFeatures,
                pressMentions,
            },
        };
    }

    // ── Skills ───────────────────────────────────────────────────────────────

    async getSkills(trainerId: string): Promise<TrainerSkill[]> {
        return skillRepo().find({ where: { trainer_id: trainerId }, order: { order_number: 'ASC', created_at: 'ASC' } });
    }

    async addSkill(trainerId: string, data: Partial<TrainerSkill>): Promise<TrainerSkill> {
        const skill = skillRepo().create({ trainer_id: trainerId, ...data });
        return skillRepo().save(skill);
    }

    async updateSkill(trainerId: string, id: string, data: Partial<TrainerSkill>): Promise<TrainerSkill> {
        const skill = await skillRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!skill) throw new Error('Skill not found');
        Object.assign(skill, data);
        return skillRepo().save(skill);
    }

    async deleteSkill(trainerId: string, id: string): Promise<void> {
        const skill = await skillRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!skill) throw new Error('Skill not found');
        await skillRepo().remove(skill);
    }

    // ── Packages ──────────────────────────────────────────────────────────────

    async getPackages(trainerId: string): Promise<TrainerPackage[]> {
        return packageRepo().find({ where: { trainer_id: trainerId, is_active: true }, order: { order_number: 'ASC', duration_months: 'ASC' } });
    }

    async addPackage(trainerId: string, data: Partial<TrainerPackage>): Promise<TrainerPackage> {
        const pkg = packageRepo().create({ trainer_id: trainerId, ...data });
        return packageRepo().save(pkg);
    }

    async updatePackage(trainerId: string, id: string, data: Partial<TrainerPackage>): Promise<TrainerPackage> {
        const pkg = await packageRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!pkg) throw new Error('Package not found');
        Object.assign(pkg, data);
        return packageRepo().save(pkg);
    }

    async deletePackage(trainerId: string, id: string): Promise<void> {
        const pkg = await packageRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!pkg) throw new Error('Package not found');
        await packageRepo().remove(pkg);
    }

    // ── Testimonials ──────────────────────────────────────────────────────────

    async getTestimonials(trainerId: string): Promise<Testimonial[]> {
        return testimonialRepo().find({ where: { trainer_id: trainerId, is_approved: true }, order: { is_featured: 'DESC', created_at: 'DESC' } });
    }

    async addTestimonial(trainerId: string, data: Partial<Testimonial>): Promise<Testimonial> {
        const t = testimonialRepo().create({ trainer_id: trainerId, ...data });
        return testimonialRepo().save(t);
    }

    async updateTestimonial(trainerId: string, id: string, data: Partial<Testimonial>): Promise<Testimonial> {
        const t = await testimonialRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!t) throw new Error('Testimonial not found');
        Object.assign(t, data);
        return testimonialRepo().save(t);
    }

    async deleteTestimonial(trainerId: string, id: string): Promise<void> {
        const t = await testimonialRepo().findOne({ where: { id, trainer_id: trainerId } });
        if (!t) throw new Error('Testimonial not found');
        await testimonialRepo().remove(t);
    }
}

export const profileService = new ProfileService();
