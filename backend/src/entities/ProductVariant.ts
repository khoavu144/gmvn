import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from './Product';

@Entity('product_variants')
export class ProductVariant {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    product_id!: string;

    @Column({ type: 'varchar', length: 200 })
    variant_label!: string;

    @Column({ type: 'jsonb', nullable: true })
    variant_attributes!: Record<string, string> | null;

    @Column({ type: 'numeric', precision: 14, scale: 0, nullable: true })
    price!: number | null;

    @Column({ type: 'numeric', precision: 14, scale: 0, nullable: true })
    compare_at_price!: number | null;

    @Column({ type: 'int', nullable: true })
    stock_quantity!: number | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    sku!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    image_url!: string | null;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @Column({ type: 'int', default: 0 })
    sort_order!: number;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @ManyToOne(() => Product, (p) => p.variants, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product!: Product;
}
