import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

export interface SocialLinks {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    website?: string;
    linkedin?: string;
}

export interface Certification {
    name: string;
    issuer: string;
    year: number;
    url?: string;
}

export interface Award {
    name: string;
    organization: string;
    year: number;
    description?: string;
}

export interface ProfileBadge {
    label: string;
    value?: string;
    icon_key?: string;
}

export interface ProfileMetric {
    label: string;
    value: string;
}

export interface ProfileCTAConfig {
    primary_label?: string;
    secondary_label?: string;
}

@Entity('trainer_profiles')
export class TrainerProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', unique: true })
    trainer_id!: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    // === HEADER ===
    @Column({ type: 'varchar', length: 100, nullable: true })
    slug!: string | null; // SEO-friendly URL, e.g. 'john-strength-coach'

    @Column({ type: 'varchar', length: 20, default: 'card' })
    profile_template!: 'card' | 'hero'; // Op1: 'card' | Op2: 'hero'

    @Column({ type: 'varchar', length: 500, nullable: true })
    cover_image_url!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    headline!: string | null; // "Strength Coach | 10+ Years Experience"

    @Column({ type: 'varchar', length: 500, nullable: true })
    bio_short!: string | null; // 1-2 sentence summary

    @Column({ type: 'text', nullable: true })
    bio_long!: string | null; // Detailed bio (markdown supported)

    // === PROFESSIONAL STATS ===
    @Column({ type: 'int', nullable: true })
    years_experience!: number | null;

    @Column({ type: 'int', nullable: true })
    clients_trained!: number | null;

    @Column({ type: 'int', nullable: true })
    success_stories!: number | null;

    // === CREDENTIALS ===
    @Column({ type: 'jsonb', nullable: true })
    certifications!: Certification[] | null;

    @Column({ type: 'jsonb', nullable: true })
    awards!: Award[] | null;

    // === CONTACT & SOCIAL ===
    @Column({ type: 'varchar', length: 20, nullable: true })
    phone!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location!: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    timezone!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    social_links!: SocialLinks | null;

    @Column({ type: 'jsonb', nullable: true })
    languages!: string[] | null; // ['Vietnamese', 'English']

    // === AVAILABILITY ===
    @Column({ type: 'boolean', default: true })
    is_accepting_clients!: boolean;

    // === CUSTOMIZATION ===
    @Column({ type: 'varchar', length: 7, default: '#3B82F6' })
    theme_color!: string;

    @Column({ type: 'boolean', default: true })
    is_profile_public!: boolean;

    @Column({ type: 'varchar', length: 160, nullable: true })
    profile_tagline!: string | null;

    @Column({ type: 'varchar', length: 30, nullable: true })
    profile_theme_variant!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    hero_badges!: ProfileBadge[] | null;

    @Column({ type: 'jsonb', nullable: true })
    key_metrics!: ProfileMetric[] | null;

    @Column({ type: 'jsonb', nullable: true })
    cta_config!: ProfileCTAConfig | null;

    @Column({ type: 'jsonb', nullable: true })
    section_order!: string[] | null;

    @Column({ type: 'boolean', default: false })
    is_featured_profile!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
