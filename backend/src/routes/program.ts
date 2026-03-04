import { Router } from 'express';
import { authenticate, trainerOnly } from '../middleware/auth';
import {
    createProgram,
    updateProgram,
    publishProgram,
    getProgramById,
    getTrainerPrograms,
    addWorkout,
    deleteProgram,
} from '../controllers/programController';

const router = Router();

// Public (with optional auth for trainer's own programs)
router.get('/trainers/:trainerId/programs', authenticate, getTrainerPrograms);
router.get('/:id', authenticate, getProgramById);

// Trainer or verified Athlete only routes
import { canCreateProgram } from '../middleware/auth';
router.post('/', authenticate, canCreateProgram, createProgram);
router.put('/:id', authenticate, canCreateProgram, updateProgram);
router.delete('/:id', authenticate, canCreateProgram, deleteProgram);
router.post('/:id/publish', authenticate, canCreateProgram, publishProgram);
router.post('/:id/workouts', authenticate, canCreateProgram, addWorkout);

export default router;
