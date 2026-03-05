import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

export type NotificationType =
    | 'gym_approved'
    | 'gym_rejected'
    | 'new_review'
    | 'review_reply'
    | 'new_invitation'
    | 'invitation_accepted'
    | 'invitation_declined'
    | 'subscription_active'
    | 'subscription_expired'
    | 'new_message'
    | 'system';

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string; // recipient

    @Column({ type: 'varchar', length: 50 })
    type!: NotificationType;

    @Column({ type: 'varchar', length: 200 })
    title!: string;

    @Column({ type: 'text', nullable: true })
    body!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    link!: string | null; // e.g. /gyms/:id, /messages, etc.

    @Column({ type: 'boolean', default: false })
    is_read!: boolean;

    @CreateDateColumn()
    created_at!: Date;
}
