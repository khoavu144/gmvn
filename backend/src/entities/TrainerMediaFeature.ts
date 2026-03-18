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

export type TrainerMediaType = 'image' | 'video';

@Entity('trainer_media_features')
export class TrainerMediaFeature {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'enum', enum: ['image', 'video'], default: 'image' })
    media_type!: TrainerMediaType;

    @Column({ type: 'varchar', length: 1000 })
    url!: string;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    thumbnail_url!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    caption!: string | null;

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    @Column({ type: 'boolean', default: false })
    is_featured!: boolean;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
