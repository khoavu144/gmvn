import { Router } from 'express';
import { authenticate, proOnly } from '../middleware/auth';
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

// Trainer only routes
router.post('/', authenticate, proOnly, createProgram);
router.put('/:id', authenticate, proOnly, updateProgram);
router.delete('/:id', authenticate, proOnly, deleteProgram);
router.post('/:id/publish', authenticate, proOnly, publishProgram);
router.post('/:id/workouts', authenticate, proOnly, addWorkout);

export default router;
