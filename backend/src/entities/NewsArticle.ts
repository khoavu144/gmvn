import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
} from 'typeorm';

@Entity('news_articles')
export class NewsArticle {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    // ── Core Content ──────────────────────────────────────────────────────────

    @Column({ type: 'varchar', length: 512 })
    title!: string;

    @Column({ type: 'varchar', length: 512, unique: true })
    @Index()
    slug!: string;

    @Column({ type: 'text', nullable: true })
    excerpt!: string | null;

    @Column({ type: 'text' })
    content!: string; // Full HTML body with CDN image URLs

    @Column({ type: 'varchar', length: 1024, nullable: true })
    thumbnail_url!: string | null;

    // ── Categorisation ────────────────────────────────────────────────────────

    @Column({ type: 'varchar', length: 128, default: 'general' })
    @Index()
    category!: string;

    @Column({ type: 'simple-array', nullable: true })
    tags!: string[] | null;

    // ── SEO Metadata (AI-generated) ───────────────────────────────────────────

    @Column({ type: 'varchar', length: 512, nullable: true })
    seo_title!: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true })
    seo_description!: string | null;

    @Column({ type: 'varchar', length: 1024, nullable: true })
    og_image_url!: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true })
    og_image_alt!: string | null;

    // ── Source Tracking ───────────────────────────────────────────────────────

    @Column({ type: 'varchar', length: 1024, nullable: true, unique: true })
    source_url!: string | null;

    @Column({ type: 'varchar', length: 256, nullable: true })
    source_domain!: string | null;

    @Column({ type: 'varchar', length: 8, default: 'en' })
    source_language!: string;

    // ── Publishing Workflow ───────────────────────────────────────────────────

    @Column({
        type: 'varchar',
        length: 32,
        default: 'draft',
    })
    @Index()
    status!: 'draft' | 'published' | 'archived';

    @Column({ type: 'timestamptz', nullable: true })
    published_at!: Date | null;

    @Column({ type: 'boolean', default: false })
    ai_processed!: boolean;

    // ── Stats ─────────────────────────────────────────────────────────────────

    @Column({ type: 'int', default: 0 })
    view_count!: number;

    @Column({ type: 'smallint', nullable: true })
    read_time_min!: number | null;

    // ── Timestamps ────────────────────────────────────────────────────────────

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updated_at!: Date;
}
