import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { GymEvent } from '../entities/GymEvent';
import { gymService } from '../services/gymService';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { getErrorMessage, getSingleParam, requireRequestUserId } from '../utils/controllerUtils';

const gymOwnerError = (
    error: unknown,
    fallbackStatus: number,
    code: string,
): AppError => {
    const message = getErrorMessage(error, 'Lỗi hệ thống');
    const lowered = message.toLowerCase();

    if (lowered.includes('unauthorized') || lowered.includes('không có quyền')) {
        return new AppError(message, 403, code);
    }

    if (lowered.includes('not found') || lowered.includes('không tồn tại')) {
        return new AppError(message, 404, code);
    }

    return new AppError(message, fallbackStatus, code);
};

export const gymOwnerController = {
    registerGym: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const ownerId = requireRequestUserId(req);
            const gym = await gymService.registerGym(ownerId, req.body);
            res.status(201).json({ success: true, gym, message: 'Gym đã được tạo và đang chờ duyệt' });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_REGISTER_ERROR');
        }
    }),

    getMyGyms: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const ownerId = requireRequestUserId(req);
            const gyms = await gymService.getOwnerGyms(ownerId);
            res.json({ success: true, gyms });
        } catch (error) {
            throw gymOwnerError(error, 500, 'GYM_OWNER_LIST_ERROR');
        }
    }),

    updateGymCenter: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const centerId = getSingleParam(req.params.centerId);
            const ownerId = requireRequestUserId(req);
            const gym = await gymService.updateGymCenter(centerId, ownerId, req.body);
            res.json({ success: true, gym });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_UPDATE_CENTER_ERROR');
        }
    }),

    updateBranch: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const branchId = getSingleParam(req.params.branchId);
            const ownerId = requireRequestUserId(req);
            const branch = await gymService.updateBranch(branchId, ownerId, req.body);
            res.json({ success: true, branch });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_UPDATE_BRANCH_ERROR');
        }
    }),

    createBranch: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const ownerId = requireRequestUserId(req);
            const { branch_name, address } = req.body;
            if (!branch_name || !address) {
                throw new AppError('Tên chi nhánh và địa chỉ là bắt buộc', 400, 'GYM_OWNER_BRANCH_VALIDATION_ERROR');
            }

            const branch = await gymService.createBranch(ownerId, req.body);
            res.status(201).json({ success: true, branch, message: 'Đã tạo chi nhánh mới' });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_CREATE_BRANCH_ERROR');
        }
    }),

    updateAmenities: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const branchId = getSingleParam(req.params.branchId);
            const ownerId = requireRequestUserId(req);
            const amenities = await gymService.updateAmenities(branchId, ownerId, req.body.amenities || []);
            res.json({ success: true, amenities });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_UPDATE_AMENITIES_ERROR');
        }
    }),

    updateEquipment: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const branchId = getSingleParam(req.params.branchId);
            const ownerId = requireRequestUserId(req);
            const equipment = await gymService.updateEquipment(branchId, ownerId, req.body.equipment || []);
            res.json({ success: true, equipment });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_UPDATE_EQUIPMENT_ERROR');
        }
    }),

    updatePricing: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const branchId = getSingleParam(req.params.branchId);
            const ownerId = requireRequestUserId(req);
            const pricing = await gymService.updatePricing(branchId, ownerId, req.body.pricing || []);
            res.json({ success: true, pricing });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_UPDATE_PRICING_ERROR');
        }
    }),

    addGalleryImage: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const branchId = getSingleParam(req.params.branchId);
            const ownerId = requireRequestUserId(req);
            const image = await gymService.addGalleryImage(branchId, ownerId, req.body);
            res.status(201).json({ success: true, image });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_ADD_GALLERY_IMAGE_ERROR');
        }
    }),

    deleteGalleryImage: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const branchId = getSingleParam(req.params.branchId);
            const imageId = getSingleParam(req.params.imageId);
            const ownerId = requireRequestUserId(req);
            await gymService.deleteGalleryImage(branchId, ownerId, imageId);
            res.json({ success: true, message: 'Đã xóa ảnh' });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_DELETE_GALLERY_IMAGE_ERROR');
        }
    }),

    createEvent: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const branchId = getSingleParam(req.params.branchId);
            const eventRepo = AppDataSource.getRepository(GymEvent);
            const event = eventRepo.create({ branch_id: branchId, ...req.body });
            const saved = await eventRepo.save(event);
            res.status(201).json({ success: true, event: saved });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_CREATE_EVENT_ERROR');
        }
    }),

    updateEvent: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const eventId = getSingleParam(req.params.eventId);
            const eventRepo = AppDataSource.getRepository(GymEvent);
            const event = await eventRepo.findOne({ where: { id: eventId } });
            if (!event) {
                throw new AppError('Event not found', 404, 'GYM_EVENT_NOT_FOUND');
            }

            Object.assign(event, req.body);
            const saved = await eventRepo.save(event);
            res.json({ success: true, event: saved });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_UPDATE_EVENT_ERROR');
        }
    }),

    deleteEvent: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const eventId = getSingleParam(req.params.eventId);
            const eventRepo = AppDataSource.getRepository(GymEvent);
            await eventRepo.delete(eventId);
            res.json({ success: true, message: 'Đã xóa event' });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_DELETE_EVENT_ERROR');
        }
    }),

    inviteTrainer: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const branchId = getSingleParam(req.params.branchId);
            const ownerId = requireRequestUserId(req);
            const { trainer_id, role_at_gym } = req.body;

            if (!trainer_id) {
                throw new AppError('Thiếu trainer_id', 400, 'GYM_OWNER_TRAINER_VALIDATION_ERROR');
            }

            const link = await gymService.inviteTrainer(branchId, ownerId, trainer_id, role_at_gym);
            res.status(201).json({ success: true, link, message: 'Đã gửi lời mời' });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_INVITE_TRAINER_ERROR');
        }
    }),

    removeTrainer: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const branchId = getSingleParam(req.params.branchId);
            const linkId = getSingleParam(req.params.linkId);
            const ownerId = requireRequestUserId(req);
            await gymService.removeTrainer(branchId, ownerId, linkId);
            res.json({ success: true, message: 'Đã gỡ HLV' });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_REMOVE_TRAINER_ERROR');
        }
    }),

    getBranchTrainers: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const branchId = getSingleParam(req.params.branchId);
            const ownerId = requireRequestUserId(req);
            const links = await gymService.getBranchTrainers(branchId, ownerId);
            res.json({ success: true, trainers: links });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_BRANCH_TRAINERS_ERROR');
        }
    }),

    getStats: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const centerId = getSingleParam(req.params.centerId);
            const ownerId = requireRequestUserId(req);
            const stats = await gymService.getGymStats(centerId, ownerId);
            res.json({ success: true, stats });
        } catch (error) {
            throw gymOwnerError(error, 400, 'GYM_OWNER_STATS_ERROR');
        }
    }),

    getTrainerInvitations: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const trainerId = requireRequestUserId(req);
            const invitations = await gymService.getTrainerInvitations(trainerId);
            res.json({ success: true, invitations });
        } catch (error) {
            throw gymOwnerError(error, 500, 'TRAINER_INVITATIONS_ERROR');
        }
    }),

    acceptInvitation: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const id = getSingleParam(req.params.id);
            const trainerId = requireRequestUserId(req);
            const link = await gymService.acceptInvitation(id, trainerId);
            res.json({ success: true, link, message: 'Đã chấp nhận lời mời' });
        } catch (error) {
            throw gymOwnerError(error, 400, 'TRAINER_ACCEPT_INVITATION_ERROR');
        }
    }),

    declineInvitation: asyncHandler(async (req: Request, res: Response): Promise<void> => {
        try {
            const id = getSingleParam(req.params.id);
            const trainerId = requireRequestUserId(req);
            await gymService.declineInvitation(id, trainerId);
            res.json({ success: true, message: 'Đã từ chối lời mời' });
        } catch (error) {
            throw gymOwnerError(error, 400, 'TRAINER_DECLINE_INVITATION_ERROR');
        }
    }),
};
