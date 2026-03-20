import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { GymProgram } from './GymProgram';

@Entity('gym_program_sessions')
@Index(['program_id'])
@Index(['starts_at'])
export class GymProgramSession {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    program_id!: string;

    @Column({ type: 'timestamptz' })
    starts_at!: Date;

    @Column({ type: 'timestamptz' })
    ends_at!: Date;

    @Column({ type: 'int', default: 20 })
    seats_total!: number;

    @Column({ type: 'int', default: 20 })
    seats_remaining!: number;

    @Column({ type: 'boolean', default: false })
    waitlist_enabled!: boolean;

    @Column({ type: 'boolean', default: false })
    is_cancelled!: boolean;

    @Column({ type: 'text', nullable: true })
    session_note!: string | null;

    @CreateDateColumn()
    created_at!: Date;

    // Relations
    @ManyToOne(() => GymProgram, program => program.sessions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'program_id' })
    program!: GymProgram;
}
