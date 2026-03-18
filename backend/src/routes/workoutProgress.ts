import { Router } from 'express';
import { Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { AppDataSource } from '../config/database';
import { WorkoutLog } from '../entities/WorkoutLog';
import { UserProgress } from '../entities/UserProgress';
import { Subscription } from '../entities/Subscription';
import { Workout } from '../entities/Workout';

const router = Router();

// GET /api/v1/subscriptions/:subscriptionId/workouts?week=1
router.get('/subscriptions/:subscriptionId/workouts', authenticate, async (req: Request, res: Response) => {
    try {
        const subRepo = AppDataSource.getRepository(Subscription);
        const workoutRepo = AppDataSource.getRepository(Workout);

        const userId = req.user!.user_id;
        const { subscriptionId } = req.params;
        const week = req.query.week ? parseInt(req.query.week as string) : undefined;

        const sub = await subRepo.findOneBy({ id: String(subscriptionId), user_id: userId });
        if (!sub) return res.status(404).json({ error: 'Subscription not found' });

        const queryBuilder = workoutRepo
            .createQueryBuilder('workout')
            .leftJoinAndSelect('workout.exercises', 'exercise')
            .where('workout.program_id = :programId', { programId: sub.program_id });

        if (week) queryBuilder.andWhere('workout.week_number = :week', { week });

        const workouts = await queryBuilder
            .orderBy('workout.week_number', 'ASC')
            .addOrderBy('workout.day_number', 'ASC')
            .addOrderBy('exercise.order_number', 'ASC')
            .getMany();

        res.json({ success: true, workouts });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/v1/workouts/:workoutId/log
router.post('/workouts/:workoutId/log', authenticate, async (req: Request, res: Response) => {
    try {
        const workoutLogRepo = AppDataSource.getRepository(WorkoutLog);
        const workoutRepo = AppDataSource.getRepository(Workout);
        const subscriptionRepo = AppDataSource.getRepository(Subscription);
        const userId = req.user!.user_id;
        const { workoutId } = req.params;
        const { notes } = req.body;

        const workout = await workoutRepo.findOneBy({ id: String(workoutId) });
        if (!workout) {
            return res.status(404).json({ error: 'Workout not found' });
        }

        const activeSubscription = await subscriptionRepo.findOneBy({
            user_id: userId,
            program_id: workout.program_id,
            status: 'active',
        });

        if (!activeSubscription) {
            return res.status(403).json({ error: 'You do not have access to this workout' });
        }

        const existingLog = await workoutLogRepo.findOneBy({
            user_id: userId,
            workout_id: String(workoutId),
        });

        if (existingLog) {
            existingLog.completed_at = existingLog.completed_at || new Date();
            existingLog.notes = notes ?? existingLog.notes;
            const saved = await workoutLogRepo.save(existingLog);
            return res.json({ success: true, log: saved, already_logged: true });
        }

        const log = workoutLogRepo.create();
        log.user_id = userId;
        log.workout_id = String(workoutId);
        log.completed_at = new Date();
        log.notes = notes || null;

        const saved = await workoutLogRepo.save(log);
        res.status(201).json({ success: true, log: saved });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// GET /api/v1/users/me/progress
router.get('/users/me/progress', authenticate, async (req: Request, res: Response) => {
    try {
        const progressRepo = AppDataSource.getRepository(UserProgress);
        const userId = req.user!.user_id;
        const from = req.query.from ? new Date(req.query.from as string) : undefined;
        const to = req.query.to ? new Date(req.query.to as string) : undefined;

        const queryBuilder = progressRepo
            .createQueryBuilder('progress')
            .where('progress.user_id = :userId', { userId });

        if (from) queryBuilder.andWhere('progress.logged_at >= :from', { from });
        if (to) queryBuilder.andWhere('progress.logged_at <= :to', { to });

        const progress = await queryBuilder
            .orderBy('progress.logged_at', 'DESC')
            .take(50)
            .getMany();

        res.json({ success: true, progress });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/v1/users/me/progress
router.post('/users/me/progress', authenticate, async (req: Request, res: Response) => {
    try {
        const progressRepo = AppDataSource.getRepository(UserProgress);
        const userId = req.user!.user_id;
        const { weight_kg, chest_cm, waist_cm, hip_cm, arm_cm } = req.body;

        const entry = progressRepo.create({
            user_id: userId,
            weight_kg,
            chest_cm,
            waist_cm,
            hip_cm,
            arm_cm,
            logged_at: new Date(),
        });

        const saved = await progressRepo.save(entry);
        res.status(201).json({ success: true, progress: saved });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});


export default router;
