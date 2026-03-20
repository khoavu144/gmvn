import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';
import { GymBranch } from './GymBranch';
import { GymZone } from './GymZone';
import { GymProgramSession } from './GymProgramSession';

export type ProgramType =
    | 'yoga'
    | 'pilates'
    | 'hiit'
    | 'cycling'
    | 'boxing'
    | 'dance'
    | 'strength'
    | 'meditation'
    | 'recovery'
    | 'mobility'
    | 'other';

export type ProgramLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';
export type BookingMode = 'walk_in' | 'pre_booking' | 'member_only';

@Entity('gym_programs')
@Index(['branch_id'])
@Index(['zone_id'])
@Index(['trainer_id'])
export class GymProgram {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'uuid', nullable: true })
    zone_id!: string | null;

    @Column({ type: 'uuid', nullable: true })
    trainer_id!: string | null; // FK → users.id

    @Column({ type: 'varchar', length: 200 })
    title!: string;

    @Column({ type: 'varchar', length: 50 })
    program_type!: ProgramType;

    @Column({ type: 'varchar', length: 20, default: 'all' })
    level!: ProgramLevel;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'int', default: 60 })
    duration_minutes!: number;

    @Column({ type: 'int', default: 20 })
    capacity!: number;

    @Column({ type: 'varchar', length: 10, nullable: true, default: 'vi' })
    language_code!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    equipment_required!: string[] | null;

    @Column({ type: 'varchar', length: 20, default: 'walk_in' })
    booking_mode!: BookingMode;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relations
    @ManyToOne(() => GymBranch, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;

    @ManyToOne(() => GymZone, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'zone_id' })
    zone!: GymZone | null;

    @OneToMany(() => GymProgramSession, session => session.program)
    sessions!: GymProgramSession[];
}
