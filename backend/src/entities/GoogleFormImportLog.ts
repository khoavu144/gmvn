import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity('google_form_import_logs')
export class GoogleFormImportLog {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ type: 'varchar', length: 255 })
    response_id!: string;

    @Column({ type: 'varchar', length: 32 })
    schema_version!: string;

    @Column({ type: 'varchar', length: 64 })
    flow!: string;

    @Index()
    @Column({ type: 'varchar', length: 255 })
    email!: string;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'user_id' })
    user!: User | null;

    @Column({ type: 'uuid', nullable: true })
    user_id!: string | null;

    /** processed | duplicate | failed | no_user | contact_only */
    @Column({ type: 'varchar', length: 32 })
    status!: string;

    @Column({ type: 'text', nullable: true })
    outcome_detail!: string | null;

    @Column({ type: 'jsonb' })
    payload!: Record<string, unknown>;

    @Column({ type: 'varchar', length: 64 })
    payload_hash!: string;

    @Column({ type: 'text', nullable: true })
    error_message!: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;
}
