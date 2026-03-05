import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
} from 'typeorm';
import { GymBranch } from './GymBranch';

@Entity('gym_centers')
@Index(['owner_id'])
@Index(['slug'])
export class GymCenter {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    owner_id!: string; // FK → users.id (gym_owner)

    @Column({ type: 'varchar', length: 255 })
    name!: string; // Validated: 3-255 chars

    @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
    slug!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    logo_url!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    cover_image_url!: string | null;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'varchar', length: 200, nullable: true })
    tagline!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    social_links!: {
        facebook?: string;
        instagram?: string;
        tiktok?: string;
        youtube?: string;
        website?: string;
    } | null;

    @Column({ type: 'boolean', default: false })
    is_verified!: boolean;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @Column({ type: 'int', default: 0 })
    view_count!: number;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column({ type: 'timestamp', nullable: true })
    deleted_at!: Date | null; // Soft delete

    // Relations
    @OneToMany(() => GymBranch, branch => branch.gym_center)
    branches!: GymBranch[];
}
