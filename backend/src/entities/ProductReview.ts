import {
    Check,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';
import { Product } from './Product';
import { User } from './User';

@Entity('product_reviews')
@Unique(['product_id', 'user_id'])
export class ProductReview {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    product_id!: string;

    @Column({ type: 'uuid' })
    user_id!: string;

    @Column({ type: 'uuid', nullable: true })
    order_item_id!: string | null;

    @Column({ type: 'smallint' })
    @Check('"rating" BETWEEN 1 AND 5')
    rating!: number;

    @Column({ type: 'text', nullable: true })
    comment!: string | null;

    @Column({ type: 'smallint', nullable: true })
    quality_rating!: number | null;

    @Column({ type: 'smallint', nullable: true })
    value_rating!: number | null;

    @Column({ type: 'smallint', nullable: true })
    delivery_rating!: number | null;

    @Column({ type: 'boolean', default: false })
    is_verified_purchase!: boolean;

    @Column({ type: 'boolean', default: true })
    is_visible!: boolean;

    @Column({ type: 'text', nullable: true })
    reply_text!: string | null;

    @Column({ type: 'uuid', nullable: true })
    replied_by_id!: string | null;

    @Column({ type: 'timestamptz', nullable: true })
    replied_at!: Date | null;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;

    @ManyToOne(() => Product, (p) => p.reviews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product!: Product;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;
}
