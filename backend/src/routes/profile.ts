import { Router } from 'express';
import { authenticate, proOnly } from '../middleware/auth';
import {
    getPublicProfile,
    getFullPublicProfile,
    getProfileBySlug,
    getMyProfile,
    updateMyProfile,
    // Experience
    getExperience,
    addExperience,
    updateExperience,
    deleteExperience,
    // Gallery
    getGallery,
    addGalleryImage,
    updateGalleryImage,
    deleteGalleryImage,
    // FAQ
    getFAQ,
    addFAQ,
    updateFAQ,
    deleteFAQ,
} from '../controllers/profileController';

const router = Router();
const auth = authenticate;
const trainerAuth = [authenticate, proOnly];

// ── PUBLIC ────────────────────────────────────────────────────────────────────
router.get('/slug/:slug', getProfileBySlug);
router.get('/trainer/:trainerId', getPublicProfile);
router.get('/trainer/:trainerId/full', getFullPublicProfile);
router.get('/trainer/:trainerId/experience', getExperience);
router.get('/trainer/:trainerId/gallery', getGallery);
router.get('/trainer/:trainerId/faq', getFAQ);

// ── TRAINER PROTECTED ─────────────────────────────────────────────────────────
// Core profile
router.get('/me', auth, getMyProfile);
router.put('/me', ...trainerAuth, updateMyProfile);

// Experience CRUD
router.post('/me/experience', ...trainerAuth, addExperience);
router.put('/me/experience/:id', ...trainerAuth, updateExperience);
router.delete('/me/experience/:id', ...trainerAuth, deleteExperience);

// Gallery CRUD
router.post('/me/gallery', ...trainerAuth, addGalleryImage);
router.put('/me/gallery/:id', ...trainerAuth, updateGalleryImage);
router.delete('/me/gallery/:id', ...trainerAuth, deleteGalleryImage);

// FAQ CRUD
router.post('/me/faq', ...trainerAuth, addFAQ);
router.put('/me/faq/:id', ...trainerAuth, updateFAQ);
router.delete('/me/faq/:id', ...trainerAuth, deleteFAQ);

export default router;
