import { AppDataSource } from '../config/database';
import { CoachApplication } from '../entities/CoachApplication';
import { User } from '../entities/User';
import { CoachApplicationInput } from '../schemas/user';

class CoachApplicationService {
    private get repo() {
        return AppDataSource.getRepository(CoachApplication);
    }
    private get userRepo() {
        return AppDataSource.getRepository(User);
    }

    /**
     * Athlete submits application to become a coach.
     * Guards:
     *  - user must be athlete (or user — allows athletes who haven't set type yet)
     *  - no pending application already exists
     *  - not already a trainer
     */
    async apply(userId: string, input: CoachApplicationInput) {
        const user = await this.userRepo.findOneBy({ id: userId });
        if (!user) throw new Error('User not found');

        if (user.user_type === 'trainer') {
            throw new Error('Bạn đã là Coach rồi');
        }

        // Guard: only athlete or base user can apply
        if (user.user_type !== 'athlete' && user.user_type !== 'user') {
            throw new Error('Chỉ Athlete mới có thể đăng ký làm Coach');
        }

        // Guard: no pending application
        const existing = await this.repo.findOne({
            where: { user_id: userId, status: 'pending' },
        });
        if (existing) {
            throw new Error('Bạn đã có đơn đang chờ duyệt');
        }

        const application = this.repo.create({
            user_id: userId,
            status: 'pending',
            specialties: input.specialties,
            headline: input.headline,
            base_price_monthly: input.base_price_monthly ?? null,
            motivation: input.motivation,
            certifications_note: input.certifications_note ?? null,
        });

        await this.repo.save(application);
        return application;
    }

    /**
     * Returns the most recent application (pending or rejected) for the user.
     * Returns null if no application exists.
     */
    async getMyApplication(userId: string) {
        return this.repo.findOne({
            where: [
                { user_id: userId, status: 'pending' },
                { user_id: userId, status: 'rejected' },
            ],
            order: { created_at: 'DESC' },
        });
    }

    /**
     * Admin: list all pending applications, newest first.
     */
    async listPending(page: number = 1, limit: number = 20) {
        const [applications, total] = await this.repo.findAndCount({
            where: { status: 'pending' },
            relations: ['user'],
            order: { created_at: 'ASC' }, // oldest first — FIFO review queue
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            applications: applications.map(a => ({
                id: a.id,
                created_at: a.created_at,
                specialties: a.specialties,
                headline: a.headline,
                base_price_monthly: a.base_price_monthly,
                motivation: a.motivation,
                certifications_note: a.certifications_note,
                user: {
                    id: a.user.id,
                    full_name: a.user.full_name,
                    email: a.user.email,
                    avatar_url: a.user.avatar_url,
                    user_type: a.user.user_type,
                },
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Admin: approve an application.
     * - Sets application status = 'approved'
     * - Updates user.user_type = 'trainer'
     * - Copies specialties, headline, base_price into user record
     */
    async approve(applicationId: string, adminId: string) {
        const application = await this.repo.findOne({
            where: { id: applicationId },
            relations: ['user'],
        });

        if (!application) throw new Error('Không tìm thấy đơn đăng ký');
        if (application.status !== 'pending') {
            throw new Error('Đơn này đã được xử lý');
        }

        // Update application
        application.status = 'approved';
        application.reviewed_by = adminId;
        application.reviewed_at = new Date();
        await this.repo.save(application);

        // Upgrade user type + copy coach fields
        await this.userRepo.update(application.user_id, {
            user_type: 'trainer',
            specialties: application.specialties ?? [],
            base_price_monthly: application.base_price_monthly ?? undefined,
        });

        return { success: true, user_id: application.user_id };
    }

    /**
     * Admin: reject an application with a reason.
     */
    async reject(applicationId: string, adminId: string, reason: string) {
        const application = await this.repo.findOneBy({ id: applicationId });
        if (!application) throw new Error('Không tìm thấy đơn đăng ký');
        if (application.status !== 'pending') {
            throw new Error('Đơn này đã được xử lý');
        }

        application.status = 'rejected';
        application.reviewed_by = adminId;
        application.reviewed_at = new Date();
        application.rejection_reason = reason;
        await this.repo.save(application);

        return { success: true };
    }
}

export const coachApplicationService = new CoachApplicationService();
