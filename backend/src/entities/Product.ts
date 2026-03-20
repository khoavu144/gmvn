import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { ProductCategory } from './ProductCategory';
import { ProductVariant } from './ProductVariant';
import { ProductReview } from './ProductReview';
import { TrainingPackage } from './TrainingPackage';
import { User } from './User';

export type ProductStatus =
    | 'draft'
    | 'pending_review'
    | 'active'
    | 'rejected'
    | 'suspended'
    | 'sold_out'
    | 'archived';

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    seller_id!: string;

    @Column({ type: 'uuid', nullable: true, name: 'seller_profile_id' })
    seller_profile_id!: string | null;

    @Column({ type: 'uuid' })
    category_id!: string;

    @Column({ type: 'varchar', length: 300 })
    title!: string;

    @Column({ type: 'varchar', length: 350, unique: true })
    slug!: string;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'varchar', length: 20, default: 'physical' })
    product_type!: 'digital' | 'physical' | 'service';

    @Column({ type: 'varchar', length: 30, default: 'draft' })
    status!: ProductStatus;

    // Pricing
    @Column({ type: 'numeric', precision: 14, scale: 0, default: 0 })
    price!: number;

    @Column({ type: 'numeric', precision: 14, scale: 0, nullable: true })
    compare_at_price!: number | null;

    @Column({ type: 'varchar', length: 10, default: 'VND' })
    currency!: string;

    // Inventory
    @Column({ type: 'int', nullable: true })
    stock_quantity!: number | null;

    @Column({ type: 'boolean', default: false })
    track_inventory!: boolean;

    @Column({ type: 'varchar', length: 100, nullable: true })
    sku!: string | null;

    // Digital delivery
    @Column({ type: 'varchar', length: 1000, nullable: true })
    digital_file_url!: string | null;

    @Column({ type: 'text', nullable: true })
    preview_content!: string | null;

    // Media
    @Column({ type: 'varchar', length: 500, nullable: true })
    thumbnail_url!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    gallery!: string[] | null;

    // Flexible attributes per category
    @Column({ type: 'jsonb', nullable: true })
    attributes!: Record<string, unknown> | null;

    @Column({ type: 'jsonb', nullable: true })
    tags!: string[] | null;

    // Stats
    @Column({ type: 'int', default: 0 })
    view_count!: number;

    @Column({ type: 'int', default: 0 })
    sale_count!: number;

    @Column({ type: 'int', default: 0 })
    wishlist_count!: number;

    @Column({ type: 'numeric', precision: 3, scale: 2, nullable: true })
    avg_rating!: number | null;

    @Column({ type: 'int', default: 0 })
    review_count!: number;

    @Column({ type: 'smallint', default: 0 })
    featured_weight!: number;

    // Moderation
    @Column({ type: 'text', nullable: true })
    moderation_note!: string | null;

    @Column({ type: 'uuid', nullable: true })
    moderated_by!: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    moderated_at!: Date | null;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deleted_at!: Date | null;

    // Relations
    @ManyToOne(() => User)
    @JoinColumn({ name: 'seller_id' })
    seller!: User;

    @ManyToOne(() => ProductCategory)
    @JoinColumn({ name: 'category_id' })
    category!: ProductCategory;

    @OneToMany(() => ProductVariant, (v) => v.product)
    variants!: ProductVariant[];

    @OneToMany(() => ProductReview, (r) => r.product)
    reviews!: ProductReview[];

    @OneToOne(() => TrainingPackage, (tp) => tp.product)
    training_package!: TrainingPackage | null;
}
