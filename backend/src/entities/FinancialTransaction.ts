import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User';
import { Program } from './Program';
import { Subscription } from './Subscription';

/**
 * @deprecated Legacy payment entity — kept for existing data compatibility.
 * No new records are created since payment processing was removed.
 * Will be dropped in a future migration once data is archived.
 */
@Entity('financial_transactions')
export class FinancialTransaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Program)
    @JoinColumn({ name: 'program_id' })
    program!: Program;

    @Column({ type: 'uuid' })
    program_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'creator_id' })
    creator!: User;

    @Column({ type: 'uuid' })
    creator_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'buyer_id' })
    buyer!: User;

    @Column({ type: 'uuid' })
    buyer_id!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    gross_amount!: number;

    @Column({ type: 'int' })
    split_percentage!: number; // 95, 90, 85

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    platform_fee!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    stripe_fee!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    creator_amount!: number;

    @Column({ type: 'varchar', length: 50, default: 'pending' })
    status!: string; // pending, completed, refunded

    @Column({ type: 'varchar', length: 255, nullable: true })
    refund_reason!: string | null;

    @ManyToOne(() => Subscription, { nullable: true })
    @JoinColumn({ name: 'subscription_id' })
    subscription!: Subscription | null;

    @Column({ type: 'uuid', nullable: true })
    subscription_id!: string | null;

    @CreateDateColumn()
    transaction_date!: Date;
}
