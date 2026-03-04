import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { User } from './User';

@Entity('athlete_achievements')
export class AthleteAchievement {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'athlete_id' })
    athlete!: User;

    @Column({ type: 'uuid' })
    athlete_id!: string;

    @Column({ type: 'varchar', length: 255 })
    achievement_title!: string;

    @Column({ type: 'varchar', length: 255 })
    competition_name!: string;

    @Column({ type: 'varchar', length: 255 })
    organizing_body!: string;

    @Column({ type: 'varchar', length: 50 })
    achievement_level!: string; // LOCAL, NATIONAL, INTERNATIONAL

    @Column({ type: 'date' })
    achievement_date!: Date;

    @Column({ type: 'varchar' })
    certificate_image_url!: string;

    @Column({ type: 'varchar', length: 50 })
    medal_type!: string; // GOLD, SILVER, BRONZE, PARTICIPATION

    @Column({ type: 'varchar', length: 500, nullable: true })
    proof_url!: string | null;

    @Column({ type: 'varchar', length: 50, default: 'PENDING' })
    status!: string; // PENDING, APPROVED, REJECTED

    @ManyToOne(() => User)
    @JoinColumn({ name: 'admin_id' })
    admin!: User;

    @Column({ type: 'uuid', nullable: true })
    admin_id!: string | null;

    @Column({ type: 'text', nullable: true })
    verification_notes!: string | null;

    @Column({ type: 'timestamp', nullable: true })
    verified_at!: Date | null;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
