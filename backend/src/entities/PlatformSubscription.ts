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

export type PlatformPlan = 'free' | 'coach_pro' | 'coach_elite' | 'athlete_premium' | 'gym_business';
export type PlatformSubStatus = 'active' | 'expired' | 'cancelled';

@Entity('platform_subscriptions')
export class PlatformSubscription {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'varchar', length: 30, default: 'free' })
    plan!: PlatformPlan;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status!: PlatformSubStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price_paid!: number | null;

    @Column({ type: 'timestamptz' })
    started_at!: Date;

    @Column({ type: 'timestamptz' })
    expires_at!: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    sepay_transaction_id!: string | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
