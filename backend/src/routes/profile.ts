import { Router } from 'express';
import { authenticate, proOnly } from '../middleware/auth';
import {
    getPublicProfile,
    getFullPublicProfile,
    getProfileBySlug,
    getMyProfile,
    updateMyProfile,
    getExperience, addExperience, updateExperience, deleteExperience,
    getGallery, addGalleryImage, updateGalleryImage, deleteGalleryImage,
    getFAQ, addFAQ, updateFAQ, deleteFAQ,
    getSkills, addSkill, updateSkill, deleteSkill,
    getPackages, addPackage, updatePackage, deletePackage,
    getTestimonials, addTestimonial, updateTestimonial, deleteTestimonial,
} from '../controllers/profileController';
import { getProgressPhotos, addProgressPhoto, deleteProgressPhoto } from '../controllers/progressPhotoController';

const router = Router();
const trainerAuth = [authenticate, proOnly];

// PUBLIC
router.get('/slug/:slug', getProfileBySlug);
router.get('/trainer/:trainerId', getPublicProfile);
router.get('/trainer/:trainerId/full', getFullPublicProfile);
router.get('/trainer/:trainerId/experience', getExperience);
router.get('/trainer/:trainerId/gallery', getGallery);
router.get('/trainer/:trainerId/faq', getFAQ);
router.get('/trainer/:trainerId/skills', getSkills);
router.get('/trainer/:trainerId/packages', getPackages);
router.get('/trainer/:trainerId/testimonials', getTestimonials);

// PROTECTED - core
router.get('/me', authenticate, getMyProfile);
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

// Skills CRUD
router.post('/me/skills', ...trainerAuth, addSkill);
router.put('/me/skills/:id', ...trainerAuth, updateSkill);
router.delete('/me/skills/:id', ...trainerAuth, deleteSkill);

// Packages CRUD
router.post('/me/packages', ...trainerAuth, addPackage);
router.put('/me/packages/:id', ...trainerAuth, updatePackage);
router.delete('/me/packages/:id', ...trainerAuth, deletePackage);

// Testimonials CRUD
router.post('/me/testimonials', ...trainerAuth, addTestimonial);
router.put('/me/testimonials/:id', ...trainerAuth, updateTestimonial);
router.delete('/me/testimonials/:id', ...trainerAuth, deleteTestimonial);

// Progress Photos
router.get('/progress-photos', authenticate, getProgressPhotos);
router.post('/progress-photos', authenticate, addProgressPhoto);
router.delete('/progress-photos/:id', authenticate, deleteProgressPhoto);

export default router;
