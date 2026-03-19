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
import { Program } from './Program';
import { Index } from 'typeorm';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';
export type SubscriptionType = 'monthly' | 'one_time';

@Entity('subscriptions')
@Index('unique_active_subscription', ['user_id', 'program_id'], { unique: true, where: "status = 'active'" })
@Index(['user_id'])
@Index(['trainer_id'])
export class Subscription {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'uuid' })
    program_id!: string;

    @ManyToOne(() => Program, (program) => program.subscriptions)
    @JoinColumn({ name: 'program_id' })
    program!: Program;

    @Column({
        type: 'enum',
        enum: ['monthly', 'one_time'],
        default: 'monthly',
    })
    subscription_type!: SubscriptionType;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price_paid!: number | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    sepay_transaction_id!: string | null;

    @Column({
        type: 'enum',
        enum: ['active', 'paused', 'cancelled'],
        default: 'active',
    })
    status!: SubscriptionStatus;

    @Column({ type: 'timestamp', nullable: true })
    started_at!: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    ended_at!: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    next_billing_date!: Date | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
