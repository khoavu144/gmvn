import {
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './Product';

interface ExerciseItem {
    name: string;
    sets: number;
    reps: string;
    rest_seconds?: number;
    note?: string;
    video_url?: string;
}

interface DayPlan {
    title: string;
    exercises: ExerciseItem[];
    warmup?: string;
    cooldown?: string;
}

interface WeekPlan {
    [dayKey: string]: DayPlan;
}

interface ProgramStructure {
    [weekKey: string]: WeekPlan;
}

@Entity('training_packages')
export class TrainingPackage {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', unique: true })
    product_id!: string;

    @Column({ type: 'varchar', length: 50, default: 'general_fitness' })
    goal!:
        | 'fat_loss'
        | 'muscle_gain'
        | 'endurance'
        | 'flexibility'
        | 'rehabilitation'
        | 'competition_prep'
        | 'general_fitness';

    @Column({ type: 'varchar', length: 20, default: 'all' })
    level!: 'beginner' | 'intermediate' | 'advanced' | 'all';

    @Column({ type: 'int', default: 8 })
    duration_weeks!: number;

    @Column({ type: 'int', default: 4 })
    sessions_per_week!: number;

    @Column({ type: 'jsonb', nullable: true })
    equipment_required!: string[] | null;

    @Column({ type: 'boolean', default: false })
    includes_nutrition!: boolean;

    @Column({ type: 'boolean', default: false })
    includes_video!: boolean;

    @Column({ type: 'jsonb', nullable: true })
    program_structure!: ProgramStructure | null;

    @Column({ type: 'int', default: 1 })
    preview_weeks!: number;

    @Column({ type: 'jsonb', nullable: true })
    nutrition_guide!: Record<string, unknown> | null;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;

    @OneToOne(() => Product, (p) => p.training_package, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product!: Product;
}
