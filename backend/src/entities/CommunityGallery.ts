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

export type CommunityImageSource = 'admin_upload' | 'trainer_gallery';

@Entity('community_gallery')
export class CommunityGallery {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 500 })
    image_url!: string;

    @Column({ type: 'varchar', length: 300, nullable: true })
    caption!: string | null;

    @Column({
        type: 'enum',
        enum: ['workout', 'lifestyle', 'transformation', 'event', 'gym_space', 'portrait', 'other'],
        default: 'workout',
    })
    category!: 'workout' | 'lifestyle' | 'transformation' | 'event' | 'gym_space' | 'portrait' | 'other';

    @Column({
        type: 'enum',
        enum: ['admin_upload', 'trainer_gallery'],
        default: 'admin_upload',
    })
    source!: CommunityImageSource;

    /** If the image belongs to a user, link their profile */
    @Column({ type: 'uuid', nullable: true })
    linked_user_id!: string | null;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'linked_user_id' })
    linked_user!: User | null;

    /** If sourced from trainer_gallery, reference the original */
    @Column({ type: 'uuid', nullable: true })
    source_image_id!: string | null;

    /** Admin who uploaded / curated this entry */
    @Column({ type: 'uuid' })
    uploaded_by!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'uploaded_by' })
    uploader!: User;

    @Column({ type: 'boolean', default: true })
    is_featured!: boolean;

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
