import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index,
} from 'typeorm';

export type TaxonomyTermType =
    | 'venue_type'
    | 'training_style'
    | 'audience'
    | 'positioning'
    | 'service_model'
    | 'recovery_type'
    | 'atmosphere';

@Entity('gym_taxonomy_terms')
@Index(['term_type'])
@Index(['slug'], { unique: true })
export class GymTaxonomyTerm {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    slug!: string;

    @Column({ type: 'varchar', length: 200 })
    label!: string;

    @Column({ type: 'varchar', length: 50 })
    term_type!: TaxonomyTermType;

    @Column({ type: 'uuid', nullable: true })
    parent_id!: string | null;

    @Column({ type: 'int', default: 0 })
    sort_order!: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    // Self-referential relation
    @ManyToOne(() => GymTaxonomyTerm, term => term.children, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent!: GymTaxonomyTerm | null;

    @OneToMany(() => GymTaxonomyTerm, term => term.parent)
    children!: GymTaxonomyTerm[];
}
