import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('trainer_skills')
export class TrainerSkill {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'varchar', length: 100 })
    name!: string; // e.g. "Powerlifting", "Nutrition Planning"

    @Column({ type: 'int', default: 80 })
    level!: number; // 0-100 percentage

    @Column({ type: 'varchar', length: 50, nullable: true })
    category!: string | null; // 'fitness' | 'nutrition' | 'mindset' | 'sport'

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    @CreateDateColumn()
    created_at!: Date;
}
