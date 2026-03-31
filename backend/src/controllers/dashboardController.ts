import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { MoreThanOrEqual } from 'typeorm';
import { Subscription } from '../entities/Subscription';
import { User } from '../entities/User';
import { GymCenter } from '../entities/GymCenter';
import { WorkoutLog } from '../entities/WorkoutLog';
import { subscriptionService } from '../services/subscriptionService';
import { messageService } from '../services/messageService';
import { programService } from '../services/programService';
import { adminService } from '../services/adminService';
import { gymService } from '../services/gymService';

// No global repository initialization to avoid startup crash

export const getOverview = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;

        const { active_clients, new_clients_30d } = await subscriptionService.getTrainerStats(trainerId);

        // Unread messages
        const unread_messages = await messageService.getUnreadCount(trainerId);

        // Total programs
        const programs = await programService.getProgramsByTrainer(trainerId);

        res.json({
            success: true,
            overview: {
                active_clients,
                new_clients_30d,
                unread_messages,
                total_programs: programs.length,
                published_programs: programs.filter(p => p.is_published).length,
            },
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getClients = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const subRepo = AppDataSource.getRepository(Subscription);
        const subscriptions = await subRepo.find({
            where: { trainer_id: trainerId, status: 'active' },
            relations: ['user', 'program'],
            order: { created_at: 'DESC' },
        });

        const clients = subscriptions.map(sub => ({
            subscription_id: sub.id,
            user_id: sub.user_id,
            user_name: sub.user?.full_name,
            user_avatar: sub.user?.avatar_url,
            program: {
                id: sub.program_id,
                name: sub.program?.name,
            },
            started_at: sub.started_at,
            status: sub.status,
            source: sub.source || 'legacy',
        }));

        res.json({ success: true, clients });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getPayments = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;
        const subRepo = AppDataSource.getRepository(Subscription);
        const subscriptions = await subRepo.find({
            where: { trainer_id: trainerId },
            relations: ['user', 'program'],
            order: { created_at: 'DESC' },
            take: 20,
        });

        const activeCount = subscriptions.filter(s => s.status === 'active').length;

        res.json({
            success: true,
            payments: {
                total_revenue: 0,
                active_monthly: 0,
                active_relationships: activeCount,
                transactions: subscriptions.map(s => ({
                    id: s.id,
                    user_name: s.user?.full_name,
                    program_name: s.program?.name,
                    amount: 0,
                    status: s.status,
                    date: s.created_at,
                    source: s.source || 'legacy',
                })),
            },
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

// New endpoints for dashboard refactor

export const getAthleteOverview = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;

        // Active coaching relationships
        const subRepo = AppDataSource.getRepository(Subscription);
        const activeSubscriptions = await subRepo.count({
            where: { user_id: userId, status: 'active' }
        });

        // Workout sessions completed in the last 7 days (real)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekSessions = await AppDataSource.getRepository(WorkoutLog).count({
            where: {
                user_id: userId,
                completed_at: MoreThanOrEqual(weekAgo),
            }
        });

        // Unread notifications count (real)
        let unreadNotifications = 0;
        try {
            const { notificationService } = await import('../services/notificationService');
            if (notificationService && typeof notificationService.getUnreadCount === 'function') {
                unreadNotifications = await notificationService.getUnreadCount(userId);
            }
        } catch {
            // Notification service may not export getUnreadCount — leave as 0
        }

        res.json({
            success: true,
            overview: {
                active_relationships: activeSubscriptions,
                week_sessions: weekSessions,
                unread_notifications: unreadNotifications,
            },
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        const userRepo = AppDataSource.getRepository(User);
        const gymRepo = AppDataSource.getRepository(GymCenter);
        const subscriptionRepo = AppDataSource.getRepository(Subscription);
        
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const [usersResult, trainersResult, gymsResult, newSubscriptionsResult] = await Promise.allSettled([
            userRepo.count(),
            userRepo.count({ where: { user_type: 'trainer' } }),
            gymRepo.count(),
            subscriptionRepo.count({
                where: {
                    created_at: MoreThanOrEqual(startOfMonth),
                    status: 'active',
                },
            }),
        ]);

        const totalUsers = usersResult.status === 'fulfilled' ? usersResult.value : 0;
        const totalTrainers = trainersResult.status === 'fulfilled' ? trainersResult.value : 0;
        const totalGyms = gymsResult.status === 'fulfilled' ? gymsResult.value : 0;
        const newSubscriptions30d = newSubscriptionsResult.status === 'fulfilled'
            ? Number(newSubscriptionsResult.value ?? 0)
            : 0;

        res.json({
            success: true,
            stats: {
                total_users: totalUsers,
                total_trainers: totalTrainers,
                total_gyms: totalGyms,
                new_connections_30d: newSubscriptions30d,
            },
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getAdminUsers = async (req: Request, res: Response) => {
    try {
        const { page = 1, search = '', role = '' } = req.query;
        const limit = 20;
        const offset = (Number(page) - 1) * limit;

        const userRepo = AppDataSource.getRepository(User);
        const queryBuilder = userRepo.createQueryBuilder('user')
            .orderBy('user.created_at', 'DESC')
            .limit(limit)
            .offset(offset);

        if (search) {
            queryBuilder.andWhere('user.full_name ILIKE :search OR user.email ILIKE :search', {
                search: `%${search}%`
            });
        }

        if (role) {
            queryBuilder.andWhere('user.user_type = :role', { role });
        }

        const [users, total] = await queryBuilder.getManyAndCount();

        res.json({
            success: true,
            users: users.map(user => ({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                role: user.user_type,
                created_at: user.created_at,
            })),
            pagination: {
                page: Number(page),
                limit,
                total,
                pages: Math.ceil(total / limit),
            }
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};
