import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Unique,
} from 'typeorm';

@Entity('workouts')
@Unique(['program_id', 'week_number', 'day_number'])
export class Workout {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    program_id!: string;

    @ManyToOne('Program', 'workouts')
    @JoinColumn({ name: 'program_id' })
    program!: any;

    @Column({ type: 'int', nullable: true })
    week_number!: number | null;

    @Column({ type: 'int', nullable: true })
    day_number!: number | null; // 1-7

    @Column({ type: 'varchar', length: 255, nullable: true })
    name!: string | null;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'int', nullable: true })
    duration_minutes!: number | null;

    // String-based relations to avoid circular imports
    @OneToMany('Exercise', 'workout')
    exercises!: any[];

    @OneToMany('WorkoutLog', 'workout')
    logs!: any[];

    @CreateDateColumn()
    created_at!: Date;
}
