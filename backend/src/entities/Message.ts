import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './User';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid' })
    sender_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'sender_id' })
    sender!: User;

    @Column({ type: 'uuid' })
    receiver_id!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'receiver_id' })
    receiver!: User;

    @Column({ type: 'text' })
    content!: string;

    @Column({ type: 'boolean', default: false })
    is_read!: boolean;

    @Column({ type: 'timestamp', nullable: true })
    read_at!: Date | null;

    @CreateDateColumn()
    created_at!: Date;
}
