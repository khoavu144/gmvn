import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    Unique,
} from 'typeorm';
import { GymCenter } from './GymCenter';
import { GymTaxonomyTerm } from './GymTaxonomyTerm';

@Entity('gym_center_taxonomy_terms')
@Unique(['gym_center_id', 'term_id'])
@Index(['gym_center_id'])
@Index(['term_id'])
export class GymCenterTaxonomyTerm {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    gym_center_id!: string;

    @Column({ type: 'uuid' })
    term_id!: string;

    @Column({ type: 'boolean', default: false })
    is_primary!: boolean;

    @Column({ type: 'int', default: 0 })
    sort_order!: number;

    // Relations
    @ManyToOne(() => GymCenter, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'gym_center_id' })
    gym_center!: GymCenter;

    @ManyToOne(() => GymTaxonomyTerm, { onDelete: 'CASCADE', eager: true })
    @JoinColumn({ name: 'term_id' })
    term!: GymTaxonomyTerm;
}
