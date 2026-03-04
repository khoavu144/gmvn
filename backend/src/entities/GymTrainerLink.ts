import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { GymBranch } from './GymBranch';

@Entity('gym_trainer_links')
export class GymTrainerLink {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    branch_id!: string; // Chi nhánh cụ thể

    @Column({ type: 'uuid' })
    gym_center_id!: string; // Chuỗi gym (để query nhanh)

    @Column({ type: 'uuid' })
    trainer_id!: string; // FK → users.id (trainer)

    @Column({
        type: 'enum',
        enum: ['pending', 'active', 'inactive', 'removed'],
        default: 'pending'
    })
    status!: 'pending' | 'active' | 'inactive' | 'removed';
    // 'pending': Gym gửi lời mời, trainer chưa confirm
    // 'active':  Đã liên kết, hiển thị public
    // 'removed': Đã gỡ liên kết

    @Column({ type: 'varchar', length: 100, nullable: true })
    role_at_gym!: string | null; // "PT chính thức", "PT cộng tác"

    @Column({ type: 'timestamp', nullable: true })
    linked_at!: Date | null;

    @CreateDateColumn()
    created_at!: Date;

    // Relations
    @ManyToOne(() => GymBranch, branch => branch.trainer_links)
    @JoinColumn({ name: 'branch_id' })
    branch!: GymBranch;

    @ManyToOne('User')
    @JoinColumn({ name: 'trainer_id' })
    trainer!: any;
}
