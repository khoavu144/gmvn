import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    UpdateDateColumn,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User';

@Entity('ranking_cache')
export class RankingCache {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'uuid', unique: true })
    user_id!: string;

    @Column({ type: 'int', nullable: true })
    rank!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    composite_score!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    activity_score!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    reputation_score!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    quality_score!: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.00 })
    multiplier!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    final_score!: number;

    @Column({ type: 'varchar', length: 50 })
    season!: string; // 'all-time' or '2026-03'

    @UpdateDateColumn()
    updated_at!: Date;
}
