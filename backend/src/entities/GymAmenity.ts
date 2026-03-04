import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';

@Entity('gym_amenities')
export class GymAmenity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;
    // Ví dụ: 'Hồ bơi', 'Phòng xông hơi', 'Bãi đỗ xe', 'Phòng thay đồ'

    @Column({ type: 'boolean', default: true })
    is_available!: boolean;

    @Column({ type: 'varchar', length: 200, nullable: true })
    note!: string | null; // "Hồ bơi 25m, mở 6:00-22:00"

    // Relations
    @ManyToOne(() => GymBranch, branch => branch.amenities)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;
}
