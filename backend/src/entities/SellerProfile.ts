import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity('seller_profiles')
export class SellerProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', unique: true })
    user_id!: string;

    @Column({ type: 'varchar', length: 200 })
    shop_name!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    shop_slug!: string;

    @Column({ type: 'text', nullable: true })
    shop_description!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    shop_logo_url!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    shop_cover_url!: string | null;

    @Column({ type: 'varchar', length: 30, default: 'individual' })
    business_type!: 'individual' | 'brand' | 'gym' | 'coach';

    @Column({ type: 'varchar', length: 30, nullable: true })
    contact_phone!: string | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    contact_email!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    bank_info!: Record<string, unknown> | null;

    @Column({ type: 'numeric', precision: 5, scale: 2, default: 10 })
    commission_rate!: number;

    @Column({ type: 'boolean', default: false })
    is_verified!: boolean;

    @Column({ type: 'numeric', precision: 18, scale: 0, default: 0 })
    total_revenue!: number;

    @Column({ type: 'int', default: 0 })
    total_orders!: number;

    @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
    avg_rating!: number | null;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    status!: 'pending' | 'active' | 'suspended';

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;

    // Relations
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;
}
