import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './User';
import { UserProfileTerm } from './UserProfileTerm';

@Entity('user_profile_term_selections')
export class UserProfileTermSelection {
    @PrimaryColumn('uuid')
    user_id!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @PrimaryColumn('uuid')
    term_id!: string;

    @ManyToOne(() => UserProfileTerm, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'term_id' })
    term!: UserProfileTerm;
}
