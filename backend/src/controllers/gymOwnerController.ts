import { Request, Response } from 'express';
import { gymService } from '../services/gymService';
import { AppDataSource } from '../config/database';
import { GymEvent } from '../entities/GymEvent';

export const gymOwnerController = {
    // POST /api/v1/gym-owner/register — Đăng ký gym mới
    async registerGym(req: Request, res: Response): Promise<void> {
        try {
            const ownerId = req.user!.user_id;
            const gym = await gymService.registerGym(ownerId, req.body);
            res.status(201).json({ success: true, gym, message: 'Gym đã được tạo và đang chờ duyệt' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gym-owner/my-gyms
    async getMyGyms(req: Request, res: Response): Promise<void> {
        try {
            const ownerId = req.user!.user_id;
            const gyms = await gymService.getOwnerGyms(ownerId);
            res.json({ success: true, gyms });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // PUT /api/v1/gym-owner/centers/:centerId — cập nhật GymCenter
    async updateGymCenter(req: Request, res: Response): Promise<void> {
        try {
            const centerId = String(req.params.centerId);
            const ownerId = req.user!.user_id;
            const gym = await gymService.updateGymCenter(centerId, ownerId, req.body);
            res.json({ success: true, gym });
        } catch (error: any) {
            res.status(error.message.includes('unauthorized') ? 403 : 400).json({ success: false, error: error.message });
        }
    },

    // PUT /api/v1/gym-owner/branches/:branchId — cập nhật chi nhánh
    async updateBranch(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const ownerId = req.user!.user_id;
            const branch = await gymService.updateBranch(branchId, ownerId, req.body);
            res.json({ success: true, branch });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // POST /api/v1/gym-owner/branches — tạo chi nhánh mới
    async createBranch(req: Request, res: Response): Promise<void> {
        try {
            const ownerId = req.user!.user_id;
            const { branch_name, address, city, district, phone, email, description, manager_name } = req.body;
            if (!branch_name || !address) {
                res.status(400).json({ success: false, error: 'Tên chi nhánh và địa chỉ là bắt buộc' });
                return;
            }
            const branch = await gymService.createBranch(ownerId, req.body);
            res.status(201).json({ success: true, branch, message: 'Đã tạo chi nhánh mới' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // PUT /api/v1/gym-owner/branches/:branchId/amenities — cập nhật tiện ích
    async updateAmenities(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const ownerId = req.user!.user_id;
            const amenities = await gymService.updateAmenities(branchId, ownerId, req.body.amenities || []);
            res.json({ success: true, amenities });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // PUT /api/v1/gym-owner/branches/:branchId/equipment
    async updateEquipment(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const ownerId = req.user!.user_id;
            const equipment = await gymService.updateEquipment(branchId, ownerId, req.body.equipment || []);
            res.json({ success: true, equipment });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // PUT /api/v1/gym-owner/branches/:branchId/pricing
    async updatePricing(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const ownerId = req.user!.user_id;
            const pricing = await gymService.updatePricing(branchId, ownerId, req.body.pricing || []);
            res.json({ success: true, pricing });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // POST /api/v1/gym-owner/branches/:branchId/gallery
    async addGalleryImage(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const ownerId = req.user!.user_id;
            const image = await gymService.addGalleryImage(branchId, ownerId, req.body);
            res.status(201).json({ success: true, image });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // DELETE /api/v1/gym-owner/branches/:branchId/gallery/:imageId
    async deleteGalleryImage(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const imageId = String(req.params.imageId);
            const ownerId = req.user!.user_id;
            await gymService.deleteGalleryImage(branchId, ownerId, imageId);
            res.json({ success: true, message: 'Đã xóa ảnh' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // POST /api/v1/gym-owner/branches/:branchId/events
    async createEvent(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const eventRepo = AppDataSource.getRepository(GymEvent);
            const event = eventRepo.create({ branch_id: branchId, ...req.body });
            const saved = await eventRepo.save(event);
            res.status(201).json({ success: true, event: saved });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // PUT /api/v1/gym-owner/branches/:branchId/events/:eventId
    async updateEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = String(req.params.eventId);
            const eventRepo = AppDataSource.getRepository(GymEvent);
            const event = await eventRepo.findOne({ where: { id: eventId } });
            if (!event) { res.status(404).json({ success: false, error: 'Event not found' }); return; }
            Object.assign(event, req.body);
            const saved = await eventRepo.save(event);
            res.json({ success: true, event: saved });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // DELETE /api/v1/gym-owner/branches/:branchId/events/:eventId
    async deleteEvent(req: Request, res: Response): Promise<void> {
        try {
            const eventId = String(req.params.eventId);
            const eventRepo = AppDataSource.getRepository(GymEvent);
            await eventRepo.delete(eventId);
            res.json({ success: true, message: 'Đã xóa event' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // POST /api/v1/gym-owner/branches/:branchId/trainers/invite
    async inviteTrainer(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const ownerId = req.user!.user_id;
            const { trainer_id, role_at_gym } = req.body;
            if (!trainer_id) { res.status(400).json({ success: false, error: 'Thiếu trainer_id' }); return; }
            const link = await gymService.inviteTrainer(branchId, ownerId, trainer_id, role_at_gym);
            res.status(201).json({ success: true, link, message: 'Đã gửi lời mời' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // DELETE /api/v1/gym-owner/branches/:branchId/trainers/:linkId
    async removeTrainer(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const linkId = String(req.params.linkId);
            const ownerId = req.user!.user_id;
            await gymService.removeTrainer(branchId, ownerId, linkId);
            res.json({ success: true, message: 'Đã gỡ HLV' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gym-owner/branches/:branchId/trainers
    async getBranchTrainers(req: Request, res: Response): Promise<void> {
        try {
            const branchId = String(req.params.branchId);
            const ownerId = req.user!.user_id;
            const links = await gymService.getBranchTrainers(branchId, ownerId);
            res.json({ success: true, trainers: links });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // GET /api/v1/gym-owner/stats/:centerId
    async getStats(req: Request, res: Response): Promise<void> {
        try {
            const centerId = String(req.params.centerId);
            const ownerId = req.user!.user_id;
            const stats = await gymService.getGymStats(centerId, ownerId);
            res.json({ success: true, stats });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // ── TRAINER ROUTES (dùng chung file để gọn) ─────────────────────

    // GET /api/v1/trainer/gym-invitations
    async getTrainerInvitations(req: Request, res: Response): Promise<void> {
        try {
            const trainerId = req.user!.user_id;
            const invitations = await gymService.getTrainerInvitations(trainerId);
            res.json({ success: true, invitations });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // POST /api/v1/trainer/gym-invitations/:id/accept
    async acceptInvitation(req: Request, res: Response): Promise<void> {
        try {
            const id = String(req.params.id);
            const trainerId = req.user!.user_id;
            const link = await gymService.acceptInvitation(id, trainerId);
            res.json({ success: true, link, message: 'Đã chấp nhận lời mời' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // POST /api/v1/trainer/gym-invitations/:id/decline
    async declineInvitation(req: Request, res: Response): Promise<void> {
        try {
            const id = String(req.params.id);
            const trainerId = req.user!.user_id;
            await gymService.declineInvitation(id, trainerId);
            res.json({ success: true, message: 'Đã từ chối lời mời' });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    },
};
