import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('testimonials')
export class Testimonial {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'varchar', length: 255 })
    client_name!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    client_avatar!: string | null;

    @Column({ type: 'int', default: 5 })
    rating!: number; // 1-5 stars

    @Column({ type: 'text' })
    comment!: string;

    @Column({ type: 'boolean', default: true })
    is_approved!: boolean;

    @CreateDateColumn()
    created_at!: Date;
}
