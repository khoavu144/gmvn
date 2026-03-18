import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('trainer_packages')
export class TrainerPackage {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'varchar', length: 100 })
    name!: string; // e.g. "Gói Cơ Bản", "Gói Pro"

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'int', default: 1 })
    duration_months!: number; // 1 | 3 | 6 | 12

    @Column({ type: 'int', nullable: true })
    sessions_per_week!: number | null;

    @Column({ type: 'bigint' })
    price!: number; // VND

    @Column({ type: 'jsonb', default: '[]' })
    features!: string[]; // ["Tư vấn dinh dưỡng", "Theo dõi tiến độ", ...]

    @Column({ type: 'boolean', default: false })
    is_popular!: boolean; // Highlighted "Most Popular" badge

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    @CreateDateColumn()
    created_at!: Date;
}
