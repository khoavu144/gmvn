import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';

@Entity('gym_events')
export class GymEvent {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({
        type: 'enum',
        enum: ['class', 'competition', 'workshop', 'promotion', 'other'],
        default: 'class',
    })
    event_type!: 'class' | 'competition' | 'workshop' | 'promotion' | 'other';

    @Column({ type: 'timestamp' })
    start_time!: Date;

    @Column({ type: 'timestamp', nullable: true })
    end_time!: Date | null;

    @Column({ type: 'boolean', default: false })
    is_recurring!: boolean;

    @Column({ type: 'varchar', length: 50, nullable: true })
    recurrence_pattern!: string | null; // 'daily', 'weekly', 'monthly'

    @Column({ type: 'varchar', length: 100, nullable: true })
    instructor_name!: string | null;

    @Column({ type: 'int', nullable: true })
    max_participants!: number | null;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    // Audit fields
    @Column({ type: 'uuid', nullable: true })
    created_by!: string | null; // FK → users.id

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null; // Soft delete

    // Relations
    @ManyToOne(() => GymBranch, branch => branch.events)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;
}
