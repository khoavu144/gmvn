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
import { ProductOrderItem } from './ProductOrderItem';

export type OrderStatus =
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentMethod =
    | 'bank_transfer'
    | 'cod'
    | 'vnpay'
    | 'momo'
    | 'zalopay';

interface ShippingAddress {
    full_name: string;
    phone: string;
    address: string;
    district?: string;
    city: string;
    province?: string;
    note?: string;
}

@Entity('product_orders')
export class ProductOrder {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    buyer_id!: string;

    @Column({ type: 'varchar', length: 30, unique: true })
    order_number!: string;

    @Column({ type: 'varchar', length: 30, default: 'pending' })
    status!: OrderStatus;

    @Column({ type: 'numeric', precision: 18, scale: 0, default: 0 })
    total_amount!: number;

    @Column({ type: 'numeric', precision: 14, scale: 0, default: 0 })
    shipping_fee!: number;

    @Column({ type: 'numeric', precision: 14, scale: 0, default: 0 })
    discount_amount!: number;

    @Column({ type: 'varchar', length: 30, default: 'bank_transfer' })
    payment_method!: PaymentMethod;

    @Column({ type: 'varchar', length: 20, default: 'pending' })
    payment_status!: PaymentStatus;

    @Column({ type: 'jsonb', nullable: true })
    shipping_address!: ShippingAddress | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    tracking_number!: string | null;

    @Column({ type: 'text', nullable: true })
    note!: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'buyer_id' })
    buyer!: User;

    @OneToMany(() => ProductOrderItem, (item) => item.order)
    items!: ProductOrderItem[];
}
