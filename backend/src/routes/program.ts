import { Router } from 'express';
import { authenticate, optionalAuthenticate, trainerOnly } from '../middleware/auth';
import {
    createProgram,
    updateProgram,
    publishProgram,
    getProgramById,
    getAllPrograms,
    getTrainerPrograms,
    addWorkout,
    deleteProgram,
} from '../controllers/programController';
import { requireProgramLimit } from '../middleware/requirePlatformPlan';

const router = Router();

// Public (with optional auth for trainer's own programs)
router.get('/', getAllPrograms);
router.get('/trainers/:trainerId/programs', optionalAuthenticate, getTrainerPrograms);
router.get('/:id', optionalAuthenticate, getProgramById);

// Trainer or verified Athlete only routes
import { canCreateProgram } from '../middleware/auth';
router.post('/', authenticate, canCreateProgram, requireProgramLimit, createProgram);
router.put('/:id', authenticate, canCreateProgram, updateProgram);
router.delete('/:id', authenticate, canCreateProgram, deleteProgram);
router.post('/:id/publish', authenticate, canCreateProgram, publishProgram);
router.post('/:id/workouts', authenticate, canCreateProgram, addWorkout);

export default router;
