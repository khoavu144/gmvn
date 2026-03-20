import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';

export type BillingCycle = 'per_day' | 'per_month' | 'per_quarter' | 'per_year' | 'per_session';
export type PlanType =
    | 'membership'
    | 'class_pack'
    | 'private_pt'
    | 'drop_in'
    | 'trial'
    | 'reformer_pack'
    | 'recovery_pack'
    | 'corporate';
export type AccessScope = 'single_branch' | 'all_branches' | 'selected_branches';

@Entity('gym_pricing')
export class GymPricing {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'varchar', length: 100 })
    plan_name!: string; // 'Gói tháng', 'Gói năm', 'Vé ngày'

    @Column({ type: 'decimal', precision: 12, scale: 0 })
    price!: number; // VND

    @Column({
        type: 'enum',
        enum: ['per_day', 'per_month', 'per_quarter', 'per_year', 'per_session'],
        default: 'per_month',
    })
    billing_cycle!: BillingCycle;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'boolean', default: false })
    is_highlighted!: boolean;

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    // ── Pricing semantics fields (added migration 009) ──

    @Column({ type: 'varchar', length: 30, default: 'membership' })
    plan_type!: PlanType;

    @Column({ type: 'varchar', length: 30, default: 'single_branch' })
    access_scope!: AccessScope;

    @Column({ type: 'jsonb', nullable: true })
    included_services!: string[] | null; // ['Cardio floor', 'Sauna', 'Group classes']

    @Column({ type: 'int', nullable: true })
    class_credits!: number | null;

    @Column({ type: 'int', nullable: true })
    session_count!: number | null;

    @Column({ type: 'boolean', default: false })
    trial_available!: boolean;

    @Column({ type: 'decimal', precision: 14, scale: 0, nullable: true })
    trial_price!: number | null;

    @Column({ type: 'decimal', precision: 14, scale: 0, nullable: true })
    joining_fee!: number | null;

    @Column({ type: 'decimal', precision: 14, scale: 0, nullable: true })
    deposit_amount!: number | null;

    @Column({ type: 'varchar', length: 300, nullable: true })
    freeze_policy_summary!: string | null;

    @Column({ type: 'varchar', length: 300, nullable: true })
    cancellation_policy_summary!: string | null;

    @Column({ type: 'int', nullable: true })
    validity_days!: number | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    peak_access_rule!: string | null;

    @Column({ type: 'boolean', default: false })
    supports_multi_branch!: boolean;

    @Column({ type: 'varchar', length: 200, nullable: true })
    highlighted_reason!: string | null; // 'Tiết kiệm nhất', 'Phổ biến nhất'

    // Relations
    @ManyToOne(() => GymBranch, branch => branch.pricing)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;
}
