import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

export type PlatformWebhookEventStatus = 'received' | 'processed' | 'ignored' | 'failed';

@Entity('platform_webhook_events')
export class PlatformWebhookEvent {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 50, default: 'sepay' })
    provider!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    provider_transaction_id!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    transfer_content!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    signature!: string | null;

    @Column({ type: 'varchar', length: 20, default: 'received' })
    status!: PlatformWebhookEventStatus;

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    payload!: Record<string, unknown>;

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    metadata!: Record<string, unknown>;

    @Column({ type: 'text', nullable: true })
    error_message!: string | null;

    @Column({ type: 'timestamptz', default: () => 'now()' })
    received_at!: Date;

    @Column({ type: 'timestamptz', nullable: true })
    processed_at!: Date | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
