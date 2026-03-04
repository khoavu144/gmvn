import { AppDataSource } from '../config/database';
import { Subscription } from '../entities/Subscription';
import { Program } from '../entities/Program';
import { FinancialTransaction } from '../entities/FinancialTransaction';
import { RevenueTier } from '../entities/RevenueTier';

class SubscriptionService {
    private get subRepo() {
        return AppDataSource.getRepository(Subscription);
    }

    private get programRepo() {
        return AppDataSource.getRepository(Program);
    }

    private get ftRepo() {
        return AppDataSource.getRepository(FinancialTransaction);
    }

    private get tierRepo() {
        return AppDataSource.getRepository(RevenueTier);
    }

    async createCheckoutSession(userId: string, programId: string) {
        const program = await this.programRepo.findOneBy({ id: programId, is_published: true });
        if (!program) throw new Error('Program not found');
        if (!program.trainer_id) throw new Error('Invalid program');

        const amount = program.price_monthly
            ? Number(program.price_monthly)
            : 50000; // Default 50,000 VND

        // Syntax: GV userId programId
        const transferContent = `GV ${userId.substring(0, 8)} ${programId.substring(0, 8)}`.toUpperCase();

        return {
            amount,
            transfer_content: transferContent,
            program: {
                id: program.id,
                name: program.name,
                price_monthly: program.price_monthly,
            },
        };
    }

    async handleSepayWebhook(transactionData: any) {
        // transactionData from Sepay typically looks like:
        // { id, gateway, transactionDate, accountNumber, code, content, transferType, transferAmount, accumulated, subAccount, referenceCode }
        const { content, transferAmount, id, transferType } = transactionData;

        if (transferType !== 'in' || !content) return { success: true };

        const contentStr = String(content).toUpperCase();

        if (!contentStr.includes('GV ')) return { success: true }; // Not our transaction

        // Extract ids from GV <user_id_prefix> <program_id_prefix>
        const parts = contentStr.match(/GV\s+([A-Z0-9]+)\s+([A-Z0-9]+)/);
        if (!parts) return { success: true };

        const userIdPrefix = parts[1].toLowerCase();
        const programIdPrefix = parts[2].toLowerCase();

        // 1. Find user and program by prefix
        const users = await AppDataSource.query(`SELECT id FROM users WHERE id::text LIKE $1`, [`${userIdPrefix}%`]);
        const programs = await AppDataSource.query(`SELECT id, trainer_id, price_monthly FROM programs WHERE id::text LIKE $1`, [`${programIdPrefix}%`]);

        if (!users.length || !programs.length) return { success: true };

        const userId = users[0].id;
        const programId = programs[0].id;
        const trainerId = programs[0].trainer_id;
        const programAmount = Number(programs[0].price_monthly) || 50000;

        // Tolerant verification for amount (>= programAmount)
        if (Number(transferAmount) < programAmount) {
            console.log(`Sepay: Amount ${transferAmount} is less than required ${programAmount}`);
            return { success: true };
        }

        // Check if subscription already exists
        const existing = await this.subRepo.findOneBy({
            user_id: userId,
            program_id: programId,
            status: 'active',
        });

        if (existing) return { success: true }; // Already subbed

        const sub = this.subRepo.create({
            user_id: userId,
            trainer_id: trainerId,
            program_id: programId,
            subscription_type: 'monthly',
            price_paid: Number(transferAmount),
            sepay_transaction_id: String(id),
            status: 'active',
            started_at: new Date(),
            next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });

        await this.programRepo.increment({ id: programId }, 'current_clients', 1);
        await this.subRepo.save(sub);

        // --- Handle Financial Transaction and Tiered Split ---
        // Get creator's revenue tier (default 95%)
        let tier = await this.tierRepo.findOneBy({ creator_id: trainerId });
        const splitPercentage = tier ? tier.split_percentage : 95;

        const grossAmount = Number(transferAmount);
        const stripeFee = 0; // Sepay doesn't use Stripe, but keeping field for future. Can estimate platform fee instead.
        const platformFeePercentage = 100 - splitPercentage;
        const platformFee = grossAmount * (platformFeePercentage / 100);
        const creatorAmount = grossAmount - platformFee - stripeFee;

        await this.ftRepo.save(
            this.ftRepo.create({
                program_id: programId,
                creator_id: trainerId,
                buyer_id: userId,
                gross_amount: grossAmount,
                split_percentage: splitPercentage,
                platform_fee: platformFee,
                stripe_fee: stripeFee,
                creator_amount: creatorAmount,
                status: 'completed',
            })
        );

        return { success: true };
    }

    async getUserSubscriptions(userId: string) {
        return this.subRepo.find({
            where: { user_id: userId },
            relations: ['program', 'trainer'],
            order: { created_at: 'DESC' },
        });
    }

    async cancelSubscription(userId: string, subscriptionId: string) {
        const sub = await this.subRepo.findOneBy({ id: subscriptionId, user_id: userId });
        if (!sub) throw new Error('Subscription not found');
        if (sub.status === 'cancelled') throw new Error('Already cancelled');

        sub.status = 'cancelled';
        sub.ended_at = new Date();

        // Decrement program client count
        await this.programRepo.decrement({ id: sub.program_id }, 'current_clients', 1);

        return this.subRepo.save(sub);
    }

    async getTrainerStats(trainerId: string) {
        const activeCount = await this.subRepo.count({
            where: { trainer_id: trainerId, status: 'active' },
        });

        // Use the new FinancialTransaction table to calculate exact revenue
        const result = await this.ftRepo
            .createQueryBuilder('ft')
            .select('SUM(ft.creator_amount)', 'totalRevenue')
            .where('ft.creator_id = :trainerId', { trainerId })
            .andWhere('ft.status = :status', { status: 'completed' })
            .getRawOne();

        const trainerRevenue = result?.totalRevenue ? Number(result.totalRevenue) : 0;

        return {
            active_clients: activeCount,
            monthly_revenue: trainerRevenue,
        };
    }
}

export const subscriptionService = new SubscriptionService();
