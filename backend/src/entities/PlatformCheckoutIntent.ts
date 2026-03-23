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
import { PlatformPlan } from './PlatformSubscription';

export type PlatformCheckoutIntentStatus =
    | 'pending'
    | 'paid'
    | 'expired'
    | 'cancelled'
    | 'failed';

@Entity('platform_checkout_intents')
export class PlatformCheckoutIntent {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'varchar', length: 30 })
    plan!: Exclude<PlatformPlan, 'free'>;

    @Column({ type: 'varchar', length: 255, unique: true })
    transfer_content!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount!: number;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status!: PlatformCheckoutIntentStatus;

    @Column({ type: 'varchar', length: 255, nullable: true })
    provider_transaction_id!: string | null;

    @Column({ type: 'timestamptz' })
    expires_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    paid_at!: Date | null;

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    metadata!: Record<string, unknown>;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
