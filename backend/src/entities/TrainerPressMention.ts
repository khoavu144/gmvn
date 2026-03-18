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

@Entity('trainer_press_mentions')
export class TrainerPressMention {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'varchar', length: 150 })
    source_name!: string;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    mention_url!: string | null;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    logo_url!: string | null;

    @Column({ type: 'text', nullable: true })
    excerpt!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    published_at!: Date | null;

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
