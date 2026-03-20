import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('product_categories')
export class ProductCategory {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    slug!: string;

    @Column({ type: 'varchar', length: 200 })
    label!: string;

    @Column({ type: 'uuid', nullable: true, name: 'parent_id' })
    parent_id!: string | null;

    @Column({ type: 'varchar', length: 10, nullable: true })
    icon_emoji!: string | null;

    @Column({ type: 'varchar', length: 20, default: 'physical' })
    product_type!: 'digital' | 'physical' | 'service';

    @Column({ type: 'boolean', default: false })
    requires_moderation!: boolean;

    @Column({ type: 'int', default: 0 })
    sort_order!: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    // Relations
    @ManyToOne(() => ProductCategory, (cat) => cat.children, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent!: ProductCategory | null;

    @OneToMany(() => ProductCategory, (cat) => cat.parent)
    children!: ProductCategory[];
}
