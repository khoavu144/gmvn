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

export type GymZoneType =
    | 'cardio_floor'
    | 'strength_floor'
    | 'free_weight_zone'
    | 'functional_zone'
    | 'yoga_room'
    | 'pilates_reformer_room'
    | 'pilates_mat_room'
    | 'cycling_room'
    | 'boxing_zone'
    | 'dance_room'
    | 'recovery_zone'
    | 'locker_zone'
    | 'pool_zone'
    | 'sauna_zone'
    | 'outdoor_zone'
    | 'other';

export type TemperatureMode = 'heated' | 'cooled' | 'ambient' | 'infrared' | 'outdoor';
export type SoundProfile = 'silent' | 'ambient_music' | 'energetic' | 'instructor_led';

@Entity('gym_zones')
@Index(['branch_id'])
@Index(['zone_type'])
export class GymZone {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'varchar', length: 50 })
    zone_type!: GymZoneType;

    @Column({ type: 'varchar', length: 200 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'int', nullable: true })
    capacity!: number | null; // persons

    @Column({ type: 'decimal', precision: 8, scale: 1, nullable: true })
    area_sqm!: number | null;

    @Column({ type: 'boolean', default: false })
    booking_required!: boolean;

    @Column({ type: 'varchar', length: 50, nullable: true })
    temperature_mode!: TemperatureMode | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    sound_profile!: SoundProfile | null;

    @Column({ type: 'smallint', nullable: true })
    natural_light_score!: number | null; // 1-5

    @Column({ type: 'boolean', default: false })
    is_signature_zone!: boolean;

    @Column({ type: 'int', default: 0 })
    sort_order!: number;

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
