import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Program } from '../entities/Program';
import { Workout } from '../entities/Workout';
import { Exercise } from '../entities/Exercise';
import { Subscription } from '../entities/Subscription';
import { WorkoutLog } from '../entities/WorkoutLog';
import { UserProgress } from '../entities/UserProgress';
import { Message } from '../entities/Message';
import { TrainerProfile } from '../entities/TrainerProfile';
import { TrainerExperience } from '../entities/TrainerExperience';
import { TrainerGallery } from '../entities/TrainerGallery';
import { TrainerFAQ } from '../entities/TrainerFAQ';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    synchronize: process.env.NODE_ENV !== 'production', // Auto-sync schema in dev
    logging: process.env.NODE_ENV !== 'production',
    entities: [
        User,
        Program,
        Workout,
        Exercise,
        Subscription,
        WorkoutLog,
        UserProgress,
        Message,
        TrainerProfile,
        TrainerExperience,
        TrainerGallery,
        TrainerFAQ,
    ],
    subscribers: [],
    migrations: [],
});
