import { Request, Response } from 'express';
import { profileService } from '../services/profileService';

// ── Core Profile ──────────────────────────────────────────────────────────────

// GET /api/v1/profiles/trainer/:trainerId — Public (basic)
export const getPublicProfile = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const profile = await profileService.getPublicProfile(trainerId);
        if (!profile) return res.status(404).json({ error: 'Profile not found or not public' });
        res.json({ success: true, profile });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/v1/profiles/trainer/:trainerId/full — Public full (with exp, gallery, faq)
export const getFullPublicProfile = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const data = await profileService.getFullPublicProfile(trainerId);
        if (!data) return res.status(404).json({ error: 'Profile not found' });
        profileService.trackView(trainerId).catch(() => { });
        res.json({ success: true, ...data });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/v1/profiles/slug/:slug — Public by slug (full)
export const getProfileBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const profile = await profileService.getProfileBySlug(String(slug));
        if (!profile || !profile.is_profile_public) return res.status(404).json({ error: 'Profile not found' });
        const trainerId = profile.trainer_id;
        const [experience, gallery, faq] = await Promise.all([
            profileService.getExperience(trainerId),
            profileService.getGallery(trainerId),
            profileService.getFAQ(trainerId),
        ]);
        profileService.trackView(trainerId).catch(() => { });
        res.json({ success: true, profile, experience, gallery, faq });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/v1/profiles/me — Private: trainer views own profile
export const getMyProfile = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const [profile, experience, gallery, faq] = await Promise.all([
            profileService.getProfileByTrainerId(trainerId),
            profileService.getExperience(trainerId),
            profileService.getGallery(trainerId),
            profileService.getFAQ(trainerId),
        ]);
        res.json({ success: true, profile, experience, gallery, faq });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/v1/profiles/me — Private: trainer updates core profile
export const updateMyProfile = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        if (req.user!.user_type !== 'trainer') {
            return res.status(403).json({ error: 'Only trainers can update a trainer profile' });
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
        res.status(400).json({ error: err.message });
    }
};

// ── Experience ────────────────────────────────────────────────────────────────

export const getExperience = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const experience = await profileService.getExperience(trainerId);
        res.json({ success: true, experience });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addExperience = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const exp = await profileService.addExperience(trainerId, req.body);
        res.status(201).json({ success: true, experience: exp });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const updateExperience = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const exp = await profileService.updateExperience(trainerId, String(req.params.id), req.body);
        res.json({ success: true, experience: exp });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteExperience = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        await profileService.deleteExperience(trainerId, String(req.params.id));
        res.json({ success: true, message: 'Experience deleted' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ── Gallery ───────────────────────────────────────────────────────────────────

export const getGallery = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const gallery = await profileService.getGallery(trainerId);
        res.json({ success: true, gallery });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addGalleryImage = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const img = await profileService.addGalleryImage(trainerId, req.body);
        res.status(201).json({ success: true, image: img });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const updateGalleryImage = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const img = await profileService.updateGalleryImage(trainerId, String(req.params.id), req.body);
        res.json({ success: true, image: img });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteGalleryImage = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        await profileService.deleteGalleryImage(trainerId, String(req.params.id));
        res.json({ success: true, message: 'Image deleted' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// ── FAQ ───────────────────────────────────────────────────────────────────────

export const getFAQ = async (req: Request, res: Response) => {
    try {
        const trainerId = String(req.params.trainerId);
        const faq = await profileService.getFAQ(trainerId);
        res.json({ success: true, faq });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
};

export const addFAQ = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const faq = await profileService.addFAQ(trainerId, req.body);
        res.status(201).json({ success: true, faq });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const updateFAQ = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const faq = await profileService.updateFAQ(trainerId, String(req.params.id), req.body);
        res.json({ success: true, faq });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const deleteFAQ = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        await profileService.deleteFAQ(trainerId, String(req.params.id));
        res.json({ success: true, message: 'FAQ deleted' });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
