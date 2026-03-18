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

@Entity('trainer_profile_highlights')
export class TrainerProfileHighlight {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'varchar', length: 120 })
    title!: string;

    @Column({ type: 'varchar', length: 255 })
    value!: string;

    @Column({ type: 'varchar', length: 60, nullable: true })
    icon_key!: string | null;

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
