import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Subscription } from '../entities/Subscription';
import { subscriptionService } from '../services/subscriptionService';
import { messageService } from '../services/messageService';
import { programService } from '../services/programService';

const subRepo = AppDataSource.getRepository(Subscription);

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
