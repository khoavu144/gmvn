import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User';

@Entity('admin_audit_log')
export class AdminAuditLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'admin_id' })
    admin!: User;

    @Column({ type: 'uuid' })
    admin_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'approver_id' })
    approver!: User;

    @Column({ type: 'uuid', nullable: true })
    approver_id!: string | null;

    @Column({ type: 'varchar', length: 50 })
    action!: string; // ban_user, approve_cert, etc

    @Column({ type: 'varchar', length: 20 })
    action_category!: string; // high, medium, low

    @ManyToOne(() => User)
    @JoinColumn({ name: 'target_user_id' })
    target_user!: User;

    @Column({ type: 'uuid', nullable: true })
    target_user_id!: string | null;

    @Column({ type: 'uuid', nullable: true })
    target_resource_id!: string | null;

    @Column({ type: 'text', nullable: true })
    old_value!: string | null;

    @Column({ type: 'text', nullable: true })
    new_value!: string | null;

    @Column({ type: 'inet', nullable: true })
    ip_address!: string | null;

    @Column({ type: 'text', nullable: true })
    user_agent!: string | null;

    @CreateDateColumn()
    timestamp!: Date;

    @Column({ type: 'text' })
    reason!: string;

    @Column({ type: 'varchar', length: 50, default: 'pending' })
    result!: string; // approved, rejected, executed, pending (for double auth)
}
