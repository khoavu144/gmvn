import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';
import { GymTrainerAvailability } from './GymTrainerAvailability';

export type TrainerLinkStatus = 'pending' | 'active' | 'inactive' | 'removed';

@Entity('gym_trainer_links')
export class GymTrainerLink {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'uuid' })
    gym_center_id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @Column({
        type: 'enum',
        enum: ['pending', 'active', 'inactive', 'removed'],
        default: 'pending',
    })
    status!: TrainerLinkStatus;

    @Column({ type: 'varchar', length: 100, nullable: true })
    role_at_gym!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    linked_at!: Date | null;

    // ── Branch-specific context fields (added migration 009) ──

    @Column({ type: 'varchar', length: 200, nullable: true })
    specialization_summary!: string | null;

    @Column({ type: 'boolean', default: false })
    featured_at_branch!: boolean;

    @Column({ type: 'boolean', default: true })
    accepts_private_clients!: boolean;

    @Column({ type: 'text', nullable: true })
    branch_intro!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    languages!: string[] | null; // ['vi', 'en']

    @Column({ type: 'int', default: 0 })
    visible_order!: number;

    @CreateDateColumn()
    created_at!: Date;

    // Relations
    @ManyToOne(() => GymBranch, branch => branch.trainer_links)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;

    @ManyToOne('User')
    @JoinColumn({ name: 'trainer_id' })
    trainer!: any;

    @OneToMany(() => GymTrainerAvailability, av => av.trainer_link)
    availability!: GymTrainerAvailability[];
}
