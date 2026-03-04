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

// Trainer only routes
router.post('/', authenticate, trainerOnly, createProgram);
router.put('/:id', authenticate, trainerOnly, updateProgram);
router.delete('/:id', authenticate, trainerOnly, deleteProgram);
router.post('/:id/publish', authenticate, trainerOnly, publishProgram);
router.post('/:id/workouts', authenticate, trainerOnly, addWorkout);

export default router;
