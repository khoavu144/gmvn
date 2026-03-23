import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

export type EmailOutboxType = 'verify_email' | 'reset_password';
export type EmailOutboxStatus = 'pending' | 'processing' | 'sent' | 'failed';

@Entity('email_outbox')
export class EmailOutbox {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: true })
    user_id!: string | null;

    @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'user_id' })
    user!: User | null;

    @Column({ type: 'varchar', length: 50 })
    email_type!: EmailOutboxType;

    @Column({ type: 'varchar', length: 255 })
    recipient_email!: string;

    @Column({ type: 'varchar', length: 255 })
    subject!: string;

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    payload!: Record<string, unknown>;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status!: EmailOutboxStatus;

    @Column({ type: 'int', default: 0 })
    attempt_count!: number;

    @Column({ type: 'text', nullable: true })
    last_error!: string | null;

    @Column({ type: 'timestamptz', default: () => 'now()' })
    next_attempt_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    sent_at!: Date | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
