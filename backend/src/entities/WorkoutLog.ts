import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Workout } from './Workout';

@Entity('workout_logs')
export class WorkoutLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'uuid' })
    workout_id!: string;

    @ManyToOne(() => Workout, (workout) => workout.logs)
    @JoinColumn({ name: 'workout_id' })
    workout!: Workout;

    @Column({ type: 'timestamp', nullable: true })
    completed_at!: Date | null;

    @Column({ type: 'text', nullable: true })
    notes!: string | null;

    @CreateDateColumn()
    created_at!: Date;
}
