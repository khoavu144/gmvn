import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('trainer_faq')
export class TrainerFAQ {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'varchar', length: 500 })
    question!: string;

    @Column({ type: 'text' })
    answer!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    category!: string | null; // 'pricing', 'training', 'nutrition', 'general'

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    @CreateDateColumn()
    created_at!: Date;
}
