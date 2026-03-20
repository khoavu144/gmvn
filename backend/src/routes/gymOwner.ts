import { Router } from 'express';
import { gymOwnerController } from '../controllers/gymOwnerController';
import { authenticate, trainerOnly } from '../middleware/auth';
import { gymOwnerOnly } from '../middleware/requireGymOwner';
import { requireBranchLimit } from '../middleware/requirePlatformPlan';

const router = Router();

// Tất cả routes trong đây đều cần: login + gym_owner_status=approved
// Ngoại trừ register (ai cũng đăng ký được)
router.use(authenticate);

// Gym Owner registration (cần login nhưng chưa cần approved)
router.post('/register', gymOwnerController.registerGym);

// Các routes sau cần gymOwnerOnly
router.get('/my-gyms', gymOwnerOnly, gymOwnerController.getMyGyms);
router.put('/centers/:centerId', gymOwnerOnly, gymOwnerController.updateGymCenter);
router.post('/branches', gymOwnerOnly, requireBranchLimit, gymOwnerController.createBranch);
router.put('/branches/:branchId', gymOwnerOnly, gymOwnerController.updateBranch);
router.put('/branches/:branchId/amenities', gymOwnerOnly, gymOwnerController.updateAmenities);
router.put('/branches/:branchId/equipment', gymOwnerOnly, gymOwnerController.updateEquipment);
router.put('/branches/:branchId/pricing', gymOwnerOnly, gymOwnerController.updatePricing);
router.post('/branches/:branchId/gallery', gymOwnerOnly, gymOwnerController.addGalleryImage);
router.delete('/branches/:branchId/gallery/:imageId', gymOwnerOnly, gymOwnerController.deleteGalleryImage);
router.post('/branches/:branchId/events', gymOwnerOnly, gymOwnerController.createEvent);
router.put('/branches/:branchId/events/:eventId', gymOwnerOnly, gymOwnerController.updateEvent);
router.delete('/branches/:branchId/events/:eventId', gymOwnerOnly, gymOwnerController.deleteEvent);
router.post('/branches/:branchId/trainers/invite', gymOwnerOnly, gymOwnerController.inviteTrainer);
router.get('/branches/:branchId/trainers', gymOwnerOnly, gymOwnerController.getBranchTrainers);
router.delete('/branches/:branchId/trainers/:linkId', gymOwnerOnly, gymOwnerController.removeTrainer);
router.get('/stats/:centerId', gymOwnerOnly, gymOwnerController.getStats);

// Trainer invitation routes — trainer-only (không cần gymOwnerOnly, nhưng phải là trainer)
router.get('/trainer/invitations', trainerOnly, gymOwnerController.getTrainerInvitations);
router.post('/trainer/invitations/:id/accept', trainerOnly, gymOwnerController.acceptInvitation);
router.post('/trainer/invitations/:id/decline', trainerOnly, gymOwnerController.declineInvitation);

export default router;
