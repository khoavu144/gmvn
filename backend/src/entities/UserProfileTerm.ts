import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserProfileSection } from './UserProfileSection';

@Entity('user_profile_terms')
export class UserProfileTerm {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    section_id!: string;

    @ManyToOne(() => UserProfileSection, (s) => s.terms, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'section_id' })
    section!: UserProfileSection;

    @Column({ type: 'varchar', length: 120 })
    slug!: string;

    @Column({ type: 'varchar', length: 200 })
    label_vi!: string;

    @Column({ type: 'int', default: 0 })
    sort_order!: number;

    /**
     * Optional link to gym taxonomy for alignment (same concept, one vocabulary).
     * Populate when a GymTaxonomyTerm row exists for the same business meaning.
     */
    @Column({ type: 'uuid', nullable: true })
    maps_to_gym_taxonomy_term_id!: string | null;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;
}
