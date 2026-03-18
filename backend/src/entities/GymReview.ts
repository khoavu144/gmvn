import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';
import { Index } from 'typeorm';

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

    // Điều kiện review: user phải có subscription với trainer thuộc gym này
    @Column({ type: 'uuid', nullable: true })
    verified_via_subscription_id!: string | null;

    @Column({ type: 'boolean', default: true })
    is_visible!: boolean; // Admin có thể ẩn

    // ── Sprint 3: Review Reply (Gym Owner / Trainer can reply) ──
    @Column({ type: 'text', nullable: true })
    reply_text!: string | null;

    @Column({ type: 'uuid', nullable: true })
    replied_by_id!: string | null; // FK → users.id (gym_owner / trainer)

    @Column({ type: 'timestamptz', nullable: true })
    replied_at!: Date | null;

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
