import { Request, Response } from 'express';
import { gymService } from '../services/gymService';
import { gymReviewService } from '../services/gymReviewService';
import { AppDataSource } from '../config/database';
import { GymBranch } from '../entities/GymBranch';
import { GymCenter } from '../entities/GymCenter';

export const gymController = {
    // GET /api/v1/gyms — list tất cả gym (verified + active)
    async listGyms(req: Request, res: Response): Promise<void> {
        try {
            const { search, city, page, limit, sort } = req.query;
            const result = await gymService.listGyms({
                search: search as string,
                city: city as string,
                page: page ? parseInt(String(page)) : 1,
                limit: limit ? parseInt(String(limit)) : 12,
                sort: sort as any,
            });
            res.json({ success: true, ...result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/:gymId — detail GymCenter (accepts UUID or slug)
    async getGymCenter(req: Request, res: Response): Promise<void> {
        try {
            const gymId = String(req.params.gymId);
            const gym = await gymService.getGymCenterById(gymId);
            if (!gym) {
                res.status(404).json({ success: false, error: 'Gym không tồn tại' });
                return;
            }
            res.json({ success: true, gym, canonical_slug: gym.slug });
        } catch (error: any) {
            if (error?.message?.includes('uuid')) return res.status(404).json({ success: false, error: 'Gym không tồn tại' }) as any;
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/:gymId/branches/:branchId — detail chi nhánh
    async getBranchDetail(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const branch = await gymService.getBranchDetail(branchId);
            if (!branch) {
                res.status(404).json({ success: false, error: 'Chi nhánh không tồn tại' });
                return;
            }
            res.json({ success: true, branch });
        } catch (error: any) {
            if (error?.message?.includes('uuid')) return res.status(404).json({ success: false, error: 'Chi nhánh không tồn tại' }) as any;
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/:gymId/trainers — HLV của gym
    async getGymTrainers(req: Request, res: Response): Promise<void> {
        try {
            const gymId = String(req.params.gymId);
            const trainers = await gymService.getGymTrainers(gymId);
            res.json({ success: true, trainers });
        } catch (error: any) {
            if (error?.message?.includes('uuid')) return res.status(404).json({ success: false, error: 'Gym không tồn tại' }) as any;
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/:gymId/reviews — reviews của gym
    async getGymReviews(req: Request, res: Response): Promise<void> {
        try {
            const gymId = String(req.params.gymId);
            const branchRepo = AppDataSource.getRepository(GymBranch);
            const branches = await branchRepo.find({ where: { gym_center_id: gymId } });
            const branchIds = branches.map(b => b.id);
            const result = await gymReviewService.getReviewsWithStats(branchIds);
            res.json({ success: true, ...result });
        } catch (error: any) {
            if (error?.message?.includes('uuid')) return res.status(404).json({ success: false, error: 'Gym không tồn tại' }) as any;
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // POST /api/v1/gyms/:gymId/reviews — tạo review (cần auth)
    async createReview(req: Request, res: Response): Promise<void> {
        try {
            const gymId = String(req.params.gymId);
            const userId = req.user!.user_id;
            const { branch_id, rating, comment } = req.body;

            if (!branch_id || !rating) {
                res.status(400).json({ success: false, error: 'Thiếu branch_id hoặc rating' });
                return;
            }

            const review = await gymReviewService.createReview(userId, gymId, branch_id, { rating, comment });
            res.status(201).json({ success: true, review });
        } catch (error: any) {
            const statusCode = error.message.includes('Bạn cần') || error.message.includes('đã đánh giá') ? 403 : 500;
            res.status(statusCode).json({ success: false, error: error.message });
        }
    },

    // PUT /api/v1/gyms/:gymId/reviews/:reviewId — sửa review
    async updateReview(req: Request, res: Response): Promise<void> {
        try {
            const reviewId = String(req.params.reviewId);
            const userId = req.user!.user_id;
            const review = await gymReviewService.updateReview(reviewId, userId, req.body);
            res.json({ success: true, review });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // DELETE /api/v1/gyms/:gymId/reviews/:reviewId — xóa review
    async deleteReview(req: Request, res: Response): Promise<void> {
        try {
            const reviewId = String(req.params.reviewId);
            const userId = req.user!.user_id;
            const isAdmin = req.user!.user_type === 'admin';
            await gymReviewService.deleteReview(reviewId, userId, isAdmin);
            res.json({ success: true, message: 'Đã xóa review' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // POST /api/v1/gyms/:gymId/reviews/:reviewId/reply — Sprint 3: Gym Owner/Trainer trả lời review
    async replyToReview(req: Request, res: Response): Promise<void> {
        try {
            const reviewId = String(req.params.reviewId);
            const replierId = req.user!.user_id;
            const replierType = req.user!.user_type as 'gym_owner' | 'trainer';
            const { reply_text } = req.body;

            if (!reply_text) {
                res.status(400).json({ success: false, error: 'Thiếu nội dung phản hồi' });
                return;
            }
            if (replierType !== 'gym_owner' && replierType !== 'trainer') {
                res.status(403).json({ success: false, error: 'Chỉ Gym Owner hoặc HLV mới được trả lời' });
                return;
            }

            const review = await gymReviewService.replyToReview(reviewId, replierId, replierType, reply_text);
            res.json({ success: true, review });
        } catch (error: any) {
            const code = error.message.includes('không phải') ? 403 : 400;
            res.status(code).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/check-review/:gymId — kiểm tra quyền review
    async checkReviewEligibility(req: Request, res: Response): Promise<void> {
        try {
            const gymId = String(req.params.gymId);
            const userId = req.user!.user_id;
            const result = await gymReviewService.canUserReviewGym(userId, gymId);
            res.json({ success: true, ...result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/marketplace — rich marketplace listing
    async listGymsMarketplace(req: Request, res: Response): Promise<void> {
        try {
            const {
                search,
                city,
                district,
                venue_type,
                audience_tag,
                positioning_tier,
                sort,
                page,
                limit,
            } = req.query;

            const result = await gymService.listGymsMarketplace({
                search: search as string,
                city: city as string,
                district: district as string,
                venue_type: venue_type as string,
                audience_tag: audience_tag as string,
                positioning_tier: positioning_tier as string,
                sort: sort as any,
                page: page ? parseInt(String(page), 10) : 1,
                limit: limit ? parseInt(String(limit), 10) : 12,
            });

            res.json({ success: true, ...result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/marketplace/taxonomy
    async listMarketplaceTaxonomy(req: Request, res: Response): Promise<void> {
        try {
            const termType = req.query.term_type ? String(req.query.term_type) : undefined;
            const terms = await gymService.listTaxonomyTerms(termType);
            res.json({ success: true, terms });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/marketplace/:gymId — full marketplace detail
    async getGymMarketplace(req: Request, res: Response): Promise<void> {
        try {
            const gymId = String(req.params.gymId);
            const gym = await gymService.getGymDetailMarketplace(gymId);
            if (!gym) {
                res.status(404).json({ success: false, error: 'Gym không tồn tại' });
                return;
            }
            res.json({ success: true, gym, canonical_slug: gym.slug });
        } catch (error: any) {
            if (error?.message?.includes('uuid')) {
                res.status(404).json({ success: false, error: 'Gym không tồn tại' });
                return;
            }
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/marketplace/:gymId/similar
    async getSimilarMarketplaceGyms(req: Request, res: Response): Promise<void> {
        try {
            const gymIdOrSlug = String(req.params.gymId);
            const gymRepo = AppDataSource.getRepository(GymCenter);
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gymIdOrSlug);
            const gym = await gymRepo.findOne({
                where: isUUID
                    ? { id: gymIdOrSlug, is_active: true }
                    : { slug: gymIdOrSlug, is_active: true },
            });

            if (!gym) {
                res.status(404).json({ success: false, error: 'Gym không tồn tại' });
                return;
            }

            const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 4;
            const gyms = await gymService.getSimilarGyms(gym.id, limit);
            res.json({ success: true, gyms });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/marketplace/:gymId/branches/:branchId
    async getMarketplaceBranchDetail(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const branch = await gymService.getBranchDetailMarketplace(branchId);
            if (!branch) {
                res.status(404).json({ success: false, error: 'Chi nhánh không tồn tại' });
                return;
            }
            res.json({ success: true, branch });
        } catch (error: any) {
            if (error?.message?.includes('uuid')) {
                res.status(404).json({ success: false, error: 'Chi nhánh không tồn tại' });
                return;
            }
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gyms/marketplace/:gymId/branches/:branchId/programs/:programId/sessions
    async getProgramSessions(req: Request, res: Response): Promise<void> {
        try {
            const programId = String(req.params.programId);
            const from = req.query.from ? new Date(String(req.query.from)) : undefined;
            const to = req.query.to ? new Date(String(req.query.to)) : undefined;
            const sessions = await gymService.getProgramSessions(programId, from, to);
            res.json({ success: true, sessions });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    async getTrainerGyms(req: Request, res: Response): Promise<void> {
        try {
            const trainerId = String(req.params.trainerId);
            const gyms = await gymService.getTrainerGyms(trainerId);
            res.json({ success: true, gyms });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
};
