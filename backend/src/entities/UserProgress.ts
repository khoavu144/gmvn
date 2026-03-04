import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('user_progress')
export class UserProgress {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    weight_kg!: number | null;

    @Column({ type: 'int', nullable: true })
    chest_cm!: number | null;

    @Column({ type: 'int', nullable: true })
    waist_cm!: number | null;

    @Column({ type: 'int', nullable: true })
    hip_cm!: number | null;

    @Column({ type: 'int', nullable: true })
    arm_cm!: number | null;

    @Column({ type: 'timestamp', nullable: true })
    logged_at!: Date | null;

    @CreateDateColumn()
    created_at!: Date;
}
