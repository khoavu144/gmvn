import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('prohibited_keywords')
export class ProhibitedKeyword {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    keyword!: string;

    @Column({ type: 'varchar', length: 50, default: 'steroid' })
    category!: 'steroid' | 'drug' | 'weapon' | 'other';

    @Column({ type: 'varchar', length: 30, default: 'flag_for_review' })
    severity!: 'auto_reject' | 'flag_for_review';

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    created_at!: Date;
}
