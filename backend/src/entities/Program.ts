import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('programs')
export class Program {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'int', nullable: true })
    duration_weeks!: number | null;

    @Column({
        type: 'enum',
        enum: ['beginner', 'intermediate', 'advanced'],
        nullable: true,
    })
    difficulty!: 'beginner' | 'intermediate' | 'advanced' | null;

    @Column({ type: 'jsonb', nullable: true })
    equipment_needed!: string[] | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price_monthly!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price_one_time!: number | null;

    @Column({
        type: 'enum',
        enum: ['online', 'offline_1on1', 'offline_group', 'hybrid'],
        default: 'online'
    })
    training_format!: 'online' | 'offline_1on1' | 'offline_group' | 'hybrid';

    @Column({ type: 'jsonb', nullable: true })
    included_features!: string[] | null;

    @Column({
        type: 'enum',
        enum: ['lump_sum', 'monthly', 'per_session'],
        default: 'monthly'
    })
    pricing_type!: 'lump_sum' | 'monthly' | 'per_session';

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    price_per_session!: number | null;

    @Column({ type: 'jsonb', nullable: true })
    training_goals!: string[] | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    prerequisites!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    cover_image_url!: string | null;

    @Column({ type: 'boolean', default: false })
    is_published!: boolean;

    @Column({ type: 'int', default: 100 })
    max_clients!: number;

    @Column({ type: 'int', default: 0 })
    current_clients!: number;

    // Relations defined with lazy loading to avoid circular dependency
    @OneToMany('Workout', 'program')
    workouts!: any[];

    @OneToMany('Subscription', 'program')
    subscriptions!: any[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
