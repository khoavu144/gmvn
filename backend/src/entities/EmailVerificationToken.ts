import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('email_verification_tokens')
export class EmailVerificationToken {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @Column({ type: 'varchar', length: 6 })
    token!: string;

    @Column({ type: 'timestamp' })
    expires_at!: Date;

    @CreateDateColumn()
    created_at!: Date;
}
