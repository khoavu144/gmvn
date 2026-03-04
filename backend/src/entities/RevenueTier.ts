import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User';

@Entity('revenue_tiers')
export class RevenueTier {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'creator_id' })
    creator!: User;

    @Column({ type: 'uuid', unique: true })
    creator_id!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    monthly_sales_threshold!: number;

    @Column({ type: 'int', default: 95 })
    split_percentage!: number; // 95, 90, 85

    @Column({ type: 'date', nullable: true })
    effective_from!: Date | null;

    @CreateDateColumn()
    created_at!: Date;
}
