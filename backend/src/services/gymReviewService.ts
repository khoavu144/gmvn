import { AppDataSource } from '../config/database';
import { GymReview } from '../entities/GymReview';
import { GymTrainerLink } from '../entities/GymTrainerLink';
import { GymBranch } from '../entities/GymBranch';
import { Subscription } from '../entities/Subscription';
import { In } from 'typeorm';

export const gymReviewService = {
    // Kiểm tra quyền viết review
    async canUserReviewGym(userId: string, gymCenterId: string): Promise<{ canReview: boolean; subscriptionId?: string }> {
        const linkRepo = AppDataSource.getRepository(GymTrainerLink);
        const subscriptionRepo = AppDataSource.getRepository(Subscription);

        // 1. Tìm tất cả trainer thuộc gym này (active links)
        const trainerLinks = await linkRepo.find({
            where: { gym_center_id: gymCenterId, status: 'active' },
        });
        const trainerIds = trainerLinks.map(l => l.trainer_id);
        if (trainerIds.length === 0) return { canReview: false };

        // 2. Kiểm tra user có subscription active với bất kỳ trainer nào không
        const subscription = await subscriptionRepo.findOne({
            where: {
                user_id: userId,
                trainer_id: In(trainerIds),
                status: 'active',
            },
        });

        return {
            canReview: !!subscription,
            subscriptionId: subscription?.id,
        };
    },

    // Tạo review
    async createReview(userId: string, gymCenterId: string, branchId: string, data: { rating: number; comment?: string }) {
        const reviewRepo = AppDataSource.getRepository(GymReview);

        // Check quyền
        const { canReview, subscriptionId } = await this.canUserReviewGym(userId, gymCenterId);
        if (!canReview) throw new Error('Bạn cần có subscription với HLV tại gym này để đánh giá');

        // Check đã review chưa
        const existing = await reviewRepo.findOne({ where: { branch_id: branchId, user_id: userId } });
        if (existing) throw new Error('Bạn đã đánh giá chi nhánh này rồi');

        // Validate rating
        if (data.rating < 1 || data.rating > 5) throw new Error('Rating phải từ 1-5');

        const review = reviewRepo.create({
            branch_id: branchId,
            user_id: userId,
            rating: data.rating,
            comment: data.comment,
            verified_via_subscription_id: subscriptionId,
            is_visible: true,
        });
        return reviewRepo.save(review);
    },

    // Cập nhật review
    async updateReview(reviewId: string, userId: string, data: { rating?: number; comment?: string }) {
        const reviewRepo = AppDataSource.getRepository(GymReview);
        const review = await reviewRepo.findOne({ where: { id: reviewId, user_id: userId } });
        if (!review) throw new Error('Review không tồn tại hoặc không có quyền');

        if (data.rating !== undefined) {
            if (data.rating < 1 || data.rating > 5) throw new Error('Rating phải từ 1-5');
            review.rating = data.rating;
        }
        if (data.comment !== undefined) review.comment = data.comment;

        return reviewRepo.save(review);
    },

    // Xóa review
    async deleteReview(reviewId: string, userId: string, isAdmin = false) {
        const reviewRepo = AppDataSource.getRepository(GymReview);
        const review = isAdmin
            ? await reviewRepo.findOne({ where: { id: reviewId } })
            : await reviewRepo.findOne({ where: { id: reviewId, user_id: userId } });
        if (!review) throw new Error('Review không tồn tại hoặc không có quyền');
        await reviewRepo.delete(reviewId);
    },

    // Admin: ẩn/hiện review
    async toggleReviewVisibility(reviewId: string) {
        const reviewRepo = AppDataSource.getRepository(GymReview);
        const review = await reviewRepo.findOne({ where: { id: reviewId } });
        if (!review) throw new Error('Review not found');
        review.is_visible = !review.is_visible;
        return reviewRepo.save(review);
    },

    // Lấy reviews theo gym + tổng hợp rating
    async getReviewsWithStats(branchIds: string[]) {
        const reviewRepo = AppDataSource.getRepository(GymReview);
        const reviews = await reviewRepo.find({
            where: { branch_id: In(branchIds), is_visible: true },
            order: { created_at: 'DESC' },
            relations: ['user'],
        });

        const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } as Record<number, number>;
        reviews.forEach(r => { breakdown[r.rating] = (breakdown[r.rating] || 0) + 1; });

        return {
            reviews,
            avg_rating: Math.round(avgRating * 10) / 10,
            total_reviews: reviews.length,
            breakdown,
        };
    },
};
