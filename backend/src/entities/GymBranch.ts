import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { GymCenter } from './GymCenter';
import { GymGallery } from './GymGallery';
import { GymTrainerLink } from './GymTrainerLink';
import { GymAmenity } from './GymAmenity';
import { GymEquipment } from './GymEquipment';
import { GymPricing } from './GymPricing';
import { GymEvent } from './GymEvent';
import { GymReview } from './GymReview';
import { GymZone } from './GymZone';
import { GymProgram } from './GymProgram';
import { GymLeadRoute } from './GymLeadRoute';

@Entity('gym_branches')
@Index(['gym_center_id'])
export class GymBranch {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    gym_center_id!: string;

    @Column({ type: 'varchar', length: 255 })
    branch_name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    manager_name!: string | null;

    @Column({ type: 'varchar', length: 500 })
    address!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    district!: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city!: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email!: string | null;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitude!: number | null;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitude!: number | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    google_maps_embed_url!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    opening_hours!: {
        mon?: { open: string; close: string; is_closed?: boolean };
        tue?: { open: string; close: string; is_closed?: boolean };
        wed?: { open: string; close: string; is_closed?: boolean };
        thu?: { open: string; close: string; is_closed?: boolean };
        fri?: { open: string; close: string; is_closed?: boolean };
        sat?: { open: string; close: string; is_closed?: boolean };
        sun?: { open: string; close: string; is_closed?: boolean };
    } | null;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @Column({ type: 'int', default: 0 })
    view_count!: number;

    // ── Decision-making fields (added migration 009) ──

    @Column({ type: 'varchar', length: 150, nullable: true })
    neighborhood_label!: string | null; // 'Quận 7, gần Phú Mỹ Hưng'

    @Column({ type: 'varchar', length: 200, nullable: true })
    parking_summary!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    locker_summary!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    shower_summary!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    towel_service_summary!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    crowd_level_summary!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    best_visit_time_summary!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    accessibility_summary!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    women_only_summary!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    child_friendly_summary!: string | null;

    @Column({ type: 'text', nullable: true })
    check_in_instructions!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    branch_tagline!: string | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    whatsapp_number!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    messenger_url!: string | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    consultation_phone!: string | null;

    @Column({ type: 'uuid', nullable: true })
    cover_media_id!: string | null; // FK → gym_gallery.id (set after gallery exists)

    @Column({ type: 'jsonb', nullable: true })
    branch_status_badges!: string[] | null; // ['New', 'Popular', 'Renovated']

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relations
    @ManyToOne(() => GymCenter, center => center.branches)
    @JoinColumn({ name: 'gym_center_id' })
    gym_center!: GymCenter;

    @OneToMany(() => GymGallery, g => g.branch)
    gallery!: GymGallery[];

    @OneToMany(() => GymTrainerLink, l => l.branch)
    trainer_links!: GymTrainerLink[];

    @OneToMany(() => GymAmenity, a => a.branch)
    amenities!: GymAmenity[];

    @OneToMany(() => GymEquipment, e => e.branch)
    equipment!: GymEquipment[];

    @OneToMany(() => GymPricing, p => p.branch)
    pricing!: GymPricing[];

    @OneToMany(() => GymEvent, ev => ev.branch)
    events!: GymEvent[];

    @OneToMany(() => GymReview, r => r.branch)
    reviews!: GymReview[];

    @OneToMany(() => GymZone, z => z.branch)
    zones!: GymZone[];

    @OneToMany(() => GymProgram, prog => prog.branch)
    programs!: GymProgram[];

    @OneToMany(() => GymLeadRoute, lr => lr.branch)
    lead_routes!: GymLeadRoute[];
}
