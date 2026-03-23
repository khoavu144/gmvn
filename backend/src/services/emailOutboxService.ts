import { EntityManager, LessThanOrEqual, In } from 'typeorm';
import { AppDataSource } from '../config/database';
import { EmailOutbox, EmailOutboxType } from '../entities/EmailOutbox';
import { emailService } from './emailService';

type EnqueueEmailInput = {
    userId?: string | null;
    recipientEmail: string;
    emailType: EmailOutboxType;
    subject: string;
    payload: Record<string, unknown>;
};

class EmailOutboxService {
    private getRepo(manager?: EntityManager) {
        return (manager ?? AppDataSource.manager).getRepository(EmailOutbox);
    }

    async enqueue(input: EnqueueEmailInput, manager?: EntityManager) {
        const repo = this.getRepo(manager);
        const record = repo.create({
            user_id: input.userId ?? null,
            recipient_email: input.recipientEmail,
            email_type: input.emailType,
            subject: input.subject,
            payload: input.payload,
            status: 'pending',
            next_attempt_at: new Date(),
        });

        return repo.save(record);
    }

    private getBackoffDelayMs(attemptCount: number) {
        return Math.min(15 * 60_000, Math.max(60_000, attemptCount * 60_000));
    }

    async processRecord(id: string) {
        const repo = this.getRepo();
        const record = await repo.findOne({ where: { id } });

        if (!record || record.status === 'sent') {
            return null;
        }

        record.status = 'processing';
        record.attempt_count += 1;
        record.last_error = null;
        await repo.save(record);

        try {
            if (record.email_type === 'verify_email') {
                const code = String(record.payload.code ?? '');
                await emailService.sendVerificationEmail(record.recipient_email, code);
            } else if (record.email_type === 'reset_password') {
                const code = String(record.payload.code ?? '');
                await emailService.sendPasswordResetEmail(record.recipient_email, code);
            } else {
                throw new Error(`Unsupported email type: ${record.email_type}`);
            }

            record.status = 'sent';
            record.sent_at = new Date();
            record.next_attempt_at = new Date();
            record.last_error = null;
            return await repo.save(record);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            record.status = 'failed';
            record.last_error = message;
            record.next_attempt_at = new Date(Date.now() + this.getBackoffDelayMs(record.attempt_count));
            return await repo.save(record);
        }
    }

    async processPending(limit: number = 25) {
        const repo = this.getRepo();
        const pending = await repo.find({
            where: {
                status: In(['pending', 'failed']),
                next_attempt_at: LessThanOrEqual(new Date()),
            },
            order: {
                next_attempt_at: 'ASC',
                created_at: 'ASC',
            },
            take: limit,
        });

        const results: EmailOutbox[] = [];
        for (const record of pending) {
            const processed = await this.processRecord(record.id);
            if (processed) {
                results.push(processed);
            }
        }

        return results;
    }

    async getPendingCount() {
        return this.getRepo().count({
            where: {
                status: In(['pending', 'failed']),
                next_attempt_at: LessThanOrEqual(new Date()),
            },
        });
    }

    async list(page: number = 1, limit: number = 50, filters?: { status?: string; emailType?: string }) {
        const repo = this.getRepo();
        const qb = repo.createQueryBuilder('email')
            .leftJoinAndSelect('email.user', 'user')
            .orderBy('email.created_at', 'DESC')
            .skip((page - 1) * limit)
            .take(limit);

        if (filters?.status) {
            qb.andWhere('email.status = :status', { status: filters.status });
        }

        if (filters?.emailType) {
            qb.andWhere('email.email_type = :emailType', { emailType: filters.emailType });
        }

        const [items, total] = await qb.getManyAndCount();
        return {
            items,
            total,
            page,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }

    async retryRecord(id: string) {
        const repo = this.getRepo();
        const record = await repo.findOne({ where: { id } });
        if (!record) {
            return null;
        }

        record.status = 'pending';
        record.next_attempt_at = new Date();
        record.last_error = null;
        await repo.save(record);
        return this.processRecord(record.id);
    }
}

export const emailOutboxService = new EmailOutboxService();
