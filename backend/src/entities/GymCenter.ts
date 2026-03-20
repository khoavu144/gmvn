import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { GymBranch } from './GymBranch';

export type PositioningTier = 'budget' | 'mid' | 'premium' | 'luxury';
export type PriceBillingCycle = 'per_day' | 'per_month' | 'per_quarter' | 'per_year' | 'per_session';
export type CtaType = 'consultation' | 'visit_booking' | 'class_trial' | 'membership' | 'private_training' | 'corporate';

@Entity('gym_centers')
@Index(['owner_id'])
@Index(['slug'])
@Index(['featured_weight'])
@Index(['primary_venue_type_slug'])
export class GymCenter {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    owner_id!: string; // FK → users.id (gym_owner)

    @Column({ type: 'varchar', length: 255 })
    name!: string; // Validated: 3-255 chars

    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    slug!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    logo_url!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    cover_image_url!: string | null;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    tagline!: string | null;

    @Column({ type: 'int', nullable: true })
    founded_year!: number | null;

    @Column({ type: 'int', nullable: true })
    total_area_sqm!: number | null;

    @Column({ type: 'int', nullable: true })
    total_equipment_count!: number | null;

    @Column({ type: 'jsonb', nullable: true })
    highlights!: string[] | null;

    @Column({ type: 'jsonb', nullable: true })
    social_links!: {
        facebook?: string;
        instagram?: string;
        tiktok?: string;
        youtube?: string;
        website?: string;
    } | null;

    @Column({ type: 'boolean', default: false })
    is_verified!: boolean;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @Column({ type: 'int', default: 0 })
    view_count!: number;

    // ── Marketplace discovery fields (added migration 009) ──

    @Column({ type: 'varchar', length: 100, nullable: true })
    primary_venue_type_slug!: string | null; // e.g. 'gym' | 'yoga_studio' | 'pilates_studio'

    @Column({ type: 'decimal', precision: 14, scale: 0, nullable: true })
    price_from_amount!: number | null; // VND – denormalised from lowest branch pricing

    @Column({ type: 'varchar', length: 30, nullable: true })
    price_from_billing_cycle!: PriceBillingCycle | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    positioning_tier!: PositioningTier | null;

    @Column({ type: 'boolean', nullable: true })
    beginner_friendly!: boolean | null;

    @Column({ type: 'boolean', nullable: true })
    women_friendly!: boolean | null;

    @Column({ type: 'boolean', nullable: true })
    family_friendly!: boolean | null;

    @Column({ type: 'boolean', nullable: true })
    athlete_friendly!: boolean | null;

    @Column({ type: 'boolean', nullable: true })
    recovery_focused!: boolean | null;

    @Column({ type: 'varchar', length: 300, nullable: true })
    discovery_blurb!: string | null; // ≤ 2 sentence card summary

    @Column({ type: 'jsonb', nullable: true })
    hero_value_props!: string[] | null; // ['Pool Olympic', 'Open 24h', ...]

    @Column({ type: 'smallint', default: 0 })
    profile_completeness_score!: number; // 0–100

    @Column({ type: 'varchar', length: 100, nullable: true })
    response_sla_text!: string | null; // 'Phản hồi trong 2 giờ'

    @Column({ type: 'varchar', length: 50, nullable: true })
    default_primary_cta!: CtaType | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    default_secondary_cta!: CtaType | null;

    @Column({ type: 'smallint', default: 0 })
    featured_weight!: number; // 0 = organic, higher = editorial boost

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null; // Soft delete

    // Relations
    @OneToMany(() => GymBranch, branch => branch.gym_center)
    branches!: GymBranch[];
}
