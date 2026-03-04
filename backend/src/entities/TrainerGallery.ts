import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

export type ImageType = 'transformation' | 'workout' | 'event' | 'certificate' | 'other';

@Entity('trainer_gallery')
export class TrainerGallery {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'varchar', length: 500 })
    image_url!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    caption!: string | null;

    @Column({
        type: 'enum',
        enum: ['transformation', 'workout', 'event', 'certificate', 'other'],
        default: 'workout',
    })
    image_type!: ImageType;

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    @CreateDateColumn()
    created_at!: Date;
}
