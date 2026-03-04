import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User';

@Entity('user_points_history')
export class UserPointsHistory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'uuid' })
    user_id!: string;

    @Column({ type: 'int' })
    points_change!: number;

    @Column({ type: 'varchar', length: 50 })
    reason!: string; // daily_checkin, penalty, decay, award

    @CreateDateColumn()
    timestamp!: Date;
}
