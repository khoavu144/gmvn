import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';

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
    image_type!: 'exterior' | 'interior' | 'equipment' | 'pool' | 'class' | 'other';

    @Column({ type: 'int', default: 0 })
    order_number!: number;

    @CreateDateColumn()
    created_at!: Date;

    // Relations
    @ManyToOne(() => GymBranch, branch => branch.gallery)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;
}
