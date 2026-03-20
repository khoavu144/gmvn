import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';
import { GymZone } from './GymZone';

export type GymImageType = 'exterior' | 'interior' | 'equipment' | 'pool' | 'class' | 'other';
export type MediaRole =
    | 'hero'
    | 'exterior'
    | 'reception'
    | 'open_gym'
    | 'class_in_action'
    | 'trainer_in_action'
    | 'equipment_detail'
    | 'zone_overview'
    | 'amenity'
    | 'recovery'
    | 'community'
    | 'before_after'
    | 'other';

export type Orientation = 'landscape' | 'portrait' | 'square';

@Entity('gym_gallery')
export class GymGallery {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'varchar', length: 500 })
    image_url!: string;

    @Column({ type: 'varchar', length: 200, nullable: true })
    caption!: string | null;

    @Column({
        type: 'enum',
        enum: ['exterior', 'interior', 'equipment', 'pool', 'class', 'other'],
        default: 'other',
    })
    image_type!: GymImageType;

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    // ── Media semantics fields (added migration 009) ──

    @Column({ type: 'varchar', length: 50, default: 'other' })
    media_role!: MediaRole;

    @Column({ type: 'uuid', nullable: true })
    zone_id!: string | null;

    @Column({ type: 'varchar', length: 300, nullable: true })
    alt_text!: string | null;

    @Column({ type: 'boolean', default: false })
    is_hero!: boolean;

    @Column({ type: 'boolean', default: false })
    is_listing_thumb!: boolean;

    @Column({ type: 'boolean', default: false })
    is_featured!: boolean;

    @Column({ type: 'varchar', length: 20, nullable: true })
    orientation!: Orientation | null;

    @CreateDateColumn()
    created_at!: Date;

    // Relations
    @ManyToOne(() => GymBranch, branch => branch.gallery)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;

    @ManyToOne(() => GymZone, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'zone_id' })
    zone!: GymZone | null;
}
