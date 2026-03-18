import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Subscription } from '../entities/Subscription';
import { User } from '../entities/User';
import { GymCenter } from '../entities/GymCenter';
import { FinancialTransaction } from '../entities/FinancialTransaction';
import { subscriptionService } from '../services/subscriptionService';
import { messageService } from '../services/messageService';
import { programService } from '../services/programService';
import { adminService } from '../services/adminService';
import { gymService } from '../services/gymService';

// No global repository initialization to avoid startup crash

export const getOverview = async (req: Request, res: Response) => {
    try {
        const trainerId = req.user!.user_id;

        // Active clients count + revenue
        const { active_clients, monthly_revenue } = await subscriptionService.getTrainerStats(trainerId);

        // Unread messages
        const unread_messages = await messageService.getUnreadCount(trainerId);

        // Total programs
        const programs = await programService.getProgramsByTrainer(trainerId);

        res.json({
            success: true,
            overview: {
                active_clients,
                monthly_revenue,
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
            next_billing_date: sub.next_billing_date,
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

        const allRevenue = subscriptions.reduce((sum, s) => sum + (Number(s.price_paid) || 0), 0);
        const activeRevenue = subscriptions
            .filter(s => s.status === 'active')
            .reduce((sum, s) => sum + (Number(s.price_paid) || 0), 0);

        res.json({
            success: true,
            payments: {
                total_revenue: allRevenue * 0.8, // 80% after platform fee
                active_monthly: activeRevenue * 0.8,
                transactions: subscriptions.map(s => ({
                    id: s.id,
                    user_name: s.user?.full_name,
                    program_name: s.program?.name,
                    amount: (Number(s.price_paid) || 0) * 0.8,
                    status: s.status,
                    date: s.created_at,
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

        // Get active subscription count
        const subRepo = AppDataSource.getRepository(Subscription);
        const activeSubscriptions = await subRepo.count({
            where: { user_id: userId, status: 'active' }
        });

        // Get recent workout sessions (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        // Note: We would need to implement workout session tracking
        // This is a placeholder implementation
        const recentSessions = 0; // To be implemented with actual workout tracking

        // Get unread notifications
        // Note: We would need to implement notification service
        const unreadNotifications = 0; // To be implemented

        res.json({
            success: true,
            overview: {
                active_subscriptions: activeSubscriptions,
                week_sessions: recentSessions,
                unread_notifications: unreadNotifications,
            },
        });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getAdminStats = async (req: Request, res: Response) => {
    try {
        // Get system KPIs: users, trainers, gyms, revenue
        const userRepo = AppDataSource.getRepository(User);
        const gymRepo = AppDataSource.getRepository(GymCenter);
        const financialRepo = AppDataSource.getRepository(FinancialTransaction);

        const totalUsers = await userRepo.count();
        const totalTrainers = await userRepo.count({ where: { user_type: 'trainer' } });
        const totalGyms = await gymRepo.count();
        
        // Get revenue for current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        
        const monthlyRevenue = await financialRepo
            .createQueryBuilder('transaction')
            .select('SUM(transaction.amount)', 'total')
            .where('transaction.created_at >= :startOfMonth', { startOfMonth })
            .andWhere('transaction.status = :status', { status: 'completed' })
            .getRawOne() || { total: 0 };

        res.json({
            success: true,
            stats: {
                total_users: totalUsers,
                total_trainers: totalTrainers,
                total_gyms: totalGyms,
                monthly_revenue: monthlyRevenue.total || 0,
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
