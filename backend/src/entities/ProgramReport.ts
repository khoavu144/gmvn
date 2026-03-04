import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User';
import { Program } from './Program';

@Entity('program_reports')
export class ProgramReport {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Program)
    @JoinColumn({ name: 'program_id' })
    program!: Program;

    @Column({ type: 'uuid' })
    program_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'reporter_id' })
    reporter!: User;

    @Column({ type: 'uuid' })
    reporter_id!: string;

    @Column({ type: 'varchar', length: 50 })
    reason!: string; // low_quality, dangerous, fake, spam

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'varchar', length: 50, default: 'open' })
    status!: string; // open, investigating, resolved, dismissed

    @Column({ type: 'text', nullable: true })
    resolution!: string | null;

    @Column({ type: 'int', default: 1 })
    report_count!: number;

    @CreateDateColumn()
    reported_at!: Date;
}
