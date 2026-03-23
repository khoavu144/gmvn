import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

export type AuthRefreshSessionStatus = 'active' | 'revoked' | 'expired';

@Entity('auth_refresh_sessions')
export class AuthRefreshSession {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'uuid', unique: true })
    session_id!: string;

    @Column({ type: 'varchar', length: 128 })
    refresh_token_hash!: string;

    @Column({ type: 'varchar', length: 20, default: 'active' })
    status!: AuthRefreshSessionStatus;

    @Column({ type: 'timestamptz' })
    issued_at!: Date;

    @Column({ type: 'timestamptz' })
    expires_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    last_rotated_at!: Date | null;

    @Column({ type: 'timestamptz', nullable: true })
    revoked_at!: Date | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
