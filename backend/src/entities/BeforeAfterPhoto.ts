import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('before_after_photos')
export class BeforeAfterPhoto {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'varchar', length: 255 })
    before_url!: string;

    @Column({ type: 'varchar', length: 255 })
    after_url!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    client_name!: string | null;

    @Column({ type: 'text', nullable: true })
    story!: string | null; // Transformation story

    @Column({ type: 'int', nullable: true })
    duration_weeks!: number | null; // How many weeks to achieve this

    @Column({ type: 'boolean', default: true })
    is_approved!: boolean;

    @CreateDateColumn()
    created_at!: Date;
}
