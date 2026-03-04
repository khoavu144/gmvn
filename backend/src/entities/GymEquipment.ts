import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';

@Entity('gym_equipment')
export class GymEquipment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'varchar', length: 100 })
    category!: string;
    // 'cardio' | 'strength' | 'free_weights' | 'functional' | 'studio' | 'other'

    @Column({ type: 'varchar', length: 150 })
    name!: string; // "Máy chạy bộ Life Fitness"

    @Column({ type: 'int', nullable: true })
    quantity!: number | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    brand!: string | null;

    @Column({ type: 'boolean', default: true })
    is_available!: boolean;

    // Relations
    @ManyToOne(() => GymBranch, branch => branch.equipment)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;
}
