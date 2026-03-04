import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Workout } from './Workout';

@Entity('exercises')
export class Exercise {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    workout_id!: string;

    @ManyToOne(() => Workout, (workout) => workout.exercises)
    @JoinColumn({ name: 'workout_id' })
    workout!: Workout;

    @Column({ type: 'varchar', length: 255, nullable: true })
    exercise_name!: string | null;

    @Column({ type: 'int', nullable: true })
    sets!: number | null;

    @Column({ type: 'int', nullable: true })
    reps_min!: number | null;

    @Column({ type: 'int', nullable: true })
    reps_max!: number | null;

    @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
    weight_kg!: number | null;

    @Column({ type: 'int', nullable: true })
    rest_seconds!: number | null;

    @Column({ type: 'text', nullable: true })
    form_cues!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    video_url!: string | null;

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    @CreateDateColumn()
    created_at!: Date;
}
