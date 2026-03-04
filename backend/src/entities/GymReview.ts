import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';

@Entity('gym_reviews')
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

    @CreateDateColumn()
    created_at!: Date;

    @ManyToOne(() => GymBranch, branch => branch.reviews)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;

    @ManyToOne('User')
    @JoinColumn({ name: 'user_id' })
    user!: any;
}
