import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
} from 'typeorm';
import { GymTrainerLink } from './GymTrainerLink';

export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type AvailabilityType = 'group' | 'private' | 'both';

@Entity('gym_trainer_availability')
@Index(['trainer_link_id'])
export class GymTrainerAvailability {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    trainer_link_id!: string;

    @Column({ type: 'varchar', length: 3 })
    day_key!: DayKey; // mon | tue | wed | thu | fri | sat | sun

    @Column({ type: 'time' })
    start_time!: string; // HH:MM

    @Column({ type: 'time' })
    end_time!: string; // HH:MM

    @Column({ type: 'varchar', length: 20, default: 'group' })
    availability_type!: AvailabilityType;

    @CreateDateColumn()
    created_at!: Date;

    // Relations
    @ManyToOne(() => GymTrainerLink, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'trainer_link_id' })
    trainer_link!: GymTrainerLink;
}
