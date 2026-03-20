import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { GymBranch } from './GymBranch';

export type VisitType = 'member' | 'drop_in' | 'trial' | 'guest';

@Entity('gym_reviews')
@Index(['branch_id', 'user_id'], { unique: true })
@Index(['branch_id'])
export class GymReview {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'uuid' })
    user_id!: string; // FK → users.id (athlete/user)

    @Column({ type: 'int' })
    rating!: number; // 1-5

    @Column({ type: 'text', nullable: true })
    comment!: string | null;

    @Column({ type: 'uuid', nullable: true })
    verified_via_subscription_id!: string | null;

    @Column({ type: 'boolean', default: true })
    is_visible!: boolean;

    @Column({ type: 'text', nullable: true })
    reply_text!: string | null;

    @Column({ type: 'uuid', nullable: true })
    replied_by_id!: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    replied_at!: Date | null;

    // ── Trust dimension fields (added migration 009) ──

    @Column({ type: 'smallint', nullable: true })
    equipment_rating!: number | null; // 1-5

    @Column({ type: 'smallint', nullable: true })
    cleanliness_rating!: number | null;

    @Column({ type: 'smallint', nullable: true })
    coaching_rating!: number | null;

    @Column({ type: 'smallint', nullable: true })
    atmosphere_rating!: number | null;

    @Column({ type: 'smallint', nullable: true })
    value_rating!: number | null;

    @Column({ type: 'smallint', nullable: true })
    crowd_rating!: number | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    visit_type!: VisitType | null;

    @Column({ type: 'boolean', default: false })
    is_verified_visit!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => GymBranch, branch => branch.reviews)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;

    @ManyToOne('User')
    @JoinColumn({ name: 'user_id' })
    user!: any;

    @ManyToOne('User')
    @JoinColumn({ name: 'replied_by_id' })
    replied_by!: any;
}
