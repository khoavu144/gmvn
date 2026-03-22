import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { UserProfileTerm } from './UserProfileTerm';

@Entity('user_profile_sections')
export class UserProfileSection {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 80, unique: true })
    slug!: string;

    @Column({ type: 'varchar', length: 200 })
    title_vi!: string;

    @Column({ type: 'text', nullable: true })
    description_vi!: string | null;

    @Column({ type: 'int', default: 0 })
    sort_order!: number;

    /** JSON array of user_type strings this section applies to */
    @Column({ type: 'jsonb', default: ['user', 'athlete', 'trainer', 'gym_owner'] })
    applies_to!: string[];

    @Column({ type: 'int', default: 0 })
    min_select!: number;

    @Column({ type: 'int', default: 20 })
    max_select!: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;

    @OneToMany(() => UserProfileTerm, (t) => t.section)
    terms!: UserProfileTerm[];
}
