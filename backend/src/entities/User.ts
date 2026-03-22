import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @Column({ type: 'varchar', length: 255 })
    full_name!: string;

    @Column({ type: 'boolean', default: false })
    is_email_verified!: boolean;

    @Column({ type: 'boolean', default: false })
    onboarding_completed!: boolean;

    @Column({
        type: 'enum',
        enum: ['user', 'athlete', 'trainer', 'gym_owner', 'admin'],
        default: 'user',
    })
    user_type!: 'user' | 'athlete' | 'trainer' | 'gym_owner' | 'admin';

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @Column({
        type: 'enum',
        enum: ['pending_review', 'approved', 'rejected'],
        nullable: true,
        default: null,
    })
    gym_owner_status!: 'pending_review' | 'approved' | 'rejected' | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    avatar_url!: string | null;

    @Column({ type: 'text', nullable: true })
    bio!: string | null;

    // For Athletes
    @Column({ type: 'int', nullable: true })
    height_cm!: number | null;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    current_weight_kg!: number | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    experience_level!: string | null; // 'beginner', 'intermediate', 'advanced'

    // For Trainers
    @Column({ type: 'jsonb', nullable: true })
    specialties!: string[] | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    base_price_monthly!: number | null;

    @Column({ type: 'boolean', default: false })
    is_verified!: boolean;

    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    slug!: string | null; // SEO-friendly URL slug for trainers (e.g., "nguyen-dieu-nhi")

    @Column({ type: 'varchar', length: 120, nullable: true })
    city!: string | null;

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
    avg_rating!: number | null;

    @Column({ type: 'int', default: 0 })
    profile_view_count!: number;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
