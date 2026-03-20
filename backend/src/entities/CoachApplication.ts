import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('coach_applications')
export class CoachApplication {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({
        type: 'varchar',
        length: 20,
        default: 'pending',
    })
    status!: 'pending' | 'approved' | 'rejected';

    @Column({ type: 'jsonb', nullable: true })
    specialties!: string[] | null;

    @Column({ type: 'varchar', length: 255 })
    headline!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    base_price_monthly!: number | null;

    @Column({ type: 'text' })
    motivation!: string;

    @Column({ type: 'text', nullable: true })
    certifications_note!: string | null;

    /** Admin who reviewed */
    @Column({ type: 'uuid', nullable: true })
    reviewed_by!: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    reviewed_at!: Date | null;

    @Column({ type: 'text', nullable: true })
    rejection_reason!: string | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
