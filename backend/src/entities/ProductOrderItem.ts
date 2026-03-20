import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './Product';
import { ProductOrder } from './ProductOrder';
import { ProductVariant } from './ProductVariant';

@Entity('product_order_items')
export class ProductOrderItem {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    order_id!: string;

    @Column({ type: 'uuid' })
    product_id!: string;

    @Column({ type: 'uuid', nullable: true })
    variant_id!: string | null;

    @Column({ type: 'int', default: 1 })
    quantity!: number;

    @Column({ type: 'numeric', precision: 14, scale: 0 })
    unit_price!: number;

    @Column({ type: 'numeric', precision: 18, scale: 0 })
    subtotal!: number;

    @Column({ type: 'varchar', length: 1000, nullable: true })
    digital_download_url!: string | null;

    @Column({ type: 'int', default: 0 })
    digital_download_count!: number;

    @Column({ type: 'int', default: 5 })
    digital_download_limit!: number;

    @Column({ type: 'varchar', length: 300, nullable: true })
    product_title_snapshot!: string | null;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @ManyToOne(() => ProductOrder, (o) => o.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'order_id' })
    order!: ProductOrder;

    @ManyToOne(() => Product)
    @JoinColumn({ name: 'product_id' })
    product!: Product;

    @ManyToOne(() => ProductVariant, { nullable: true })
    @JoinColumn({ name: 'variant_id' })
    variant!: ProductVariant | null;
}
