import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

export type ExperienceType = 'work' | 'education' | 'certification' | 'achievement';

@Entity('trainer_experience')
export class TrainerExperience {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'trainer_id' })
    trainer!: User;

    @Column({ type: 'varchar', length: 255 })
    title!: string;

    @Column({ type: 'varchar', length: 255 })
    organization!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    location!: string | null;

    @Column({
        type: 'enum',
        enum: ['work', 'education', 'certification', 'achievement'],
        default: 'work',
    })
    experience_type!: ExperienceType;

    @Column({ type: 'date' })
    start_date!: Date;

    @Column({ type: 'date', nullable: true })
    end_date!: Date | null;

    @Column({ type: 'boolean', default: false })
    is_current!: boolean;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @Column({ type: 'jsonb', nullable: true })
    achievements!: string[] | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
