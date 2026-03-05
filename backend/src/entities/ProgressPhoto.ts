import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User';

@Entity('progress_photos')
export class ProgressPhoto {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'varchar', length: 255 })
    image_url!: string;

    @Column({ type: 'text', nullable: true })
    caption?: string;

    @Column({ type: 'date', nullable: true })
    taken_at?: Date;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    weight_kg?: number;

    @CreateDateColumn()
    created_at!: Date;
}
