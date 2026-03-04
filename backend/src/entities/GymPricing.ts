import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';

@Entity('gym_pricing')
export class GymPricing {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'varchar', length: 100 })
    plan_name!: string; // "Gói tháng", "Gói năm", "Vé ngày"

    @Column({ type: 'decimal', precision: 12, scale: 0 })
    price!: number; // VND

    @Column({
        type: 'enum',
        enum: ['per_day', 'per_month', 'per_quarter', 'per_year', 'per_session'],
        default: 'per_month',
    })
    billing_cycle!: 'per_day' | 'per_month' | 'per_quarter' | 'per_year' | 'per_session';

    @Column({ type: 'text', nullable: true })
    description!: string | null; // Mô tả gói, những gì bao gồm

    @Column({ type: 'boolean', default: false })
    is_highlighted!: boolean; // Gói nổi bật

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    // Relations
    @ManyToOne(() => GymBranch, branch => branch.pricing)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;
}
