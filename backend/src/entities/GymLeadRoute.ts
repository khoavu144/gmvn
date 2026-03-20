import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { GymBranch } from './GymBranch';

export type InquiryType =
    | 'consultation'
    | 'visit_booking'
    | 'class_trial'
    | 'membership'
    | 'private_training'
    | 'corporate';

export type ContactChannel = 'whatsapp' | 'phone' | 'messenger' | 'email' | 'in_app';

@Entity('gym_lead_routes')
@Index(['branch_id'])
@Index(['branch_id', 'inquiry_type'])
export class GymLeadRoute {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'varchar', length: 30 })
    inquiry_type!: InquiryType;

    @Column({ type: 'varchar', length: 20 })
    primary_channel!: ContactChannel;

    @Column({ type: 'varchar', length: 20, nullable: true })
    fallback_channel!: ContactChannel | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    phone!: string | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    whatsapp!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    messenger_url!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email!: string | null;

    @Column({ type: 'uuid', nullable: true })
    owner_user_id!: string | null; // FK → users.id

    @Column({ type: 'jsonb', nullable: true })
    active_hours!: Record<string, { from: string; to: string }> | null;

    @Column({ type: 'text', nullable: true })
    auto_prefill_message!: string | null;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relations
    @ManyToOne(() => GymBranch, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;
}
