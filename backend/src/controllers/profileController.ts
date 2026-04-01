import { Request, Response } from 'express';
import { profileService } from '../services/profileService';
import { getErrorMessage } from '../utils/controllerUtils';

// ── Core Profile ──────────────────────────────────────────────────────────────

// GET /api/v1/profiles/trainer/:trainerId — Public (basic)
export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const profile = await profileService.getPublicProfile(trainerId);
        if (!profile) return res.status(404).json({ error: 'Không tìm thấy hồ sơ công khai' });
        res.json({ success: true, profile });
    } catch (err: any) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// GET /api/v1/profiles/trainer/:trainerId/full — Public full (with exp, gallery, faq, premium)
export const getFullPublicProfile = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const data = await profileService.getFullPublicProfile(trainerId);
        if (!data) return res.status(404).json({ error: 'Không tìm thấy hồ sơ' });
        profileService.trackView(trainerId).catch(() => { });
        res.json({ success: true, ...data });
    } catch (err: any) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// GET /api/v1/profiles/slug/:slug — Public by slug (full CV data + premium)
export const getProfileBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const data = await profileService.getFullPublicProfileBySlug(String(slug));
        if (!data) return res.status(404).json({ error: 'Không tìm thấy hồ sơ công khai' });
        res.json({ success: true, ...data });
    } catch (err: any) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// GET /api/v1/profiles/me — Private: trainer views own profile
export const getMyProfile = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const [profile, experience, gallery, faq, skills, packages, testimonials, highlights, mediaFeatures, pressMentions] = await Promise.all([
            profileService.getProfileByTrainerId(trainerId),
            profileService.getExperience(trainerId),
            profileService.getGallery(trainerId),
            profileService.getFAQ(trainerId),
            profileService.getSkills(trainerId),
            profileService.getPackages(trainerId),
            profileService.getTestimonials(trainerId),
            profileService.getHighlights(trainerId),
            profileService.getMediaFeatures(trainerId),
            profileService.getPressMentions(trainerId),
        ]);

        res.json({
            success: true,
            profile,
            experience,
            gallery,
            faq,
            skills,
            packages,
            testimonials,
            premium: profile
                ? {
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
                }
                : null,
        });
    } catch (err: any) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

// PUT /api/v1/profiles/me — Private: trainer updates core profile
export const updateMyProfile = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        if (req.user!.user_type !== 'trainer' && req.user!.user_type !== 'athlete') {
            return res.status(403).json({ error: 'Chỉ huấn luyện viên hoặc vận động viên mới có thể cập nhật hồ sơ' });
        }

        if (req.body.slug) {
            const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
            if (!slugRegex.test(req.body.slug)) {
                return res.status(400).json({ error: 'Slug không hợp lệ.' });
            }
        }

        const profile = await profileService.upsertProfile(trainerId, req.body);
        res.json({ success: true, profile });
    } catch (err: any) {
        if (err.message === 'Slug already taken') {
            return res.status(409).json({ error: 'Slug đã có người dùng, vui lòng chọn slug khác' });
        }
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

// ── Experience ────────────────────────────────────────────────────────────────

export const getExperience = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const experience = await profileService.getExperience(trainerId);
        res.json({ success: true, experience });
    } catch (err: any) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const addExperience = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const exp = await profileService.addExperience(trainerId, req.body);
        res.status(201).json({ success: true, experience: exp });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const updateExperience = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const exp = await profileService.updateExperience(trainerId, String(req.params.id), req.body);
        res.json({ success: true, experience: exp });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const deleteExperience = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        await profileService.deleteExperience(trainerId, String(req.params.id));
        res.json({ success: true, message: 'Đã xóa mục kinh nghiệm' });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

// ── Gallery ───────────────────────────────────────────────────────────────────

export const getGallery = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const gallery = await profileService.getGallery(trainerId);
        res.json({ success: true, gallery });
    } catch (err: any) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const addGalleryImage = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const img = await profileService.addGalleryImage(trainerId, req.body);
        res.status(201).json({ success: true, image: img });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const updateGalleryImage = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const img = await profileService.updateGalleryImage(trainerId, String(req.params.id), req.body);
        res.json({ success: true, image: img });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const deleteGalleryImage = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        await profileService.deleteGalleryImage(trainerId, String(req.params.id));
        res.json({ success: true, message: 'Đã xóa hình ảnh' });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

// ── FAQ ───────────────────────────────────────────────────────────────────────

export const getFAQ = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const faq = await profileService.getFAQ(trainerId);
        res.json({ success: true, faq });
    } catch (err: any) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const addFAQ = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const faq = await profileService.addFAQ(trainerId, req.body);
        res.status(201).json({ success: true, faq });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const updateFAQ = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const faq = await profileService.updateFAQ(trainerId, String(req.params.id), req.body);
        res.json({ success: true, faq });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const deleteFAQ = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        await profileService.deleteFAQ(trainerId, String(req.params.id));
        res.json({ success: true, message: 'Đã xóa câu hỏi thường gặp' });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

// ── Skills ────────────────────────────────────────────────────────────────────

export const getSkills = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const skills = await profileService.getSkills(trainerId);
        res.json({ success: true, skills });
    } catch (err: any) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const addSkill = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const skill = await profileService.addSkill(trainerId, req.body);
        res.status(201).json({ success: true, skill });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const updateSkill = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const skill = await profileService.updateSkill(trainerId, String(req.params.id), req.body);
        res.json({ success: true, skill });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const deleteSkill = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        await profileService.deleteSkill(trainerId, String(req.params.id));
        res.json({ success: true, message: 'Đã xóa kỹ năng' });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

// ── Packages ──────────────────────────────────────────────────────────────────

export const getPackages = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const packages = await profileService.getPackages(trainerId);
        res.json({ success: true, packages });
    } catch (err: any) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const addPackage = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const pkg = await profileService.addPackage(trainerId, req.body);
        res.status(201).json({ success: true, package: pkg });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const updatePackage = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const pkg = await profileService.updatePackage(trainerId, String(req.params.id), req.body);
        res.json({ success: true, package: pkg });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const deletePackage = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        await profileService.deletePackage(trainerId, String(req.params.id));
        res.json({ success: true, message: 'Đã xóa gói dịch vụ' });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

// ── Testimonials ──────────────────────────────────────────────────────────────

export const getTestimonials = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const testimonials = await profileService.getTestimonials(trainerId);
        res.json({ success: true, testimonials });
    } catch (err: any) {
        res.status(500).json({ error: getErrorMessage(err) });
    }
};

export const addTestimonial = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const t = await profileService.addTestimonial(trainerId, req.body);
        res.status(201).json({ success: true, testimonial: t });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const updateTestimonial = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const t = await profileService.updateTestimonial(trainerId, String(req.params.id), req.body);
        res.json({ success: true, testimonial: t });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};

export const deleteTestimonial = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        await profileService.deleteTestimonial(trainerId, String(req.params.id));
        res.json({ success: true, message: 'Đã xóa đánh giá' });
    } catch (err: any) {
        res.status(400).json({ error: getErrorMessage(err) });
    }
};
