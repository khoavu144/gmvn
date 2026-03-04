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

// New Final Spec Entities
import { AthleteAchievement } from '../entities/AthleteAchievement';
import { UserPointsHistory } from '../entities/UserPointsHistory';
import { RankingCache } from '../entities/RankingCache';
import { ProgramReport } from '../entities/ProgramReport';
import { FinancialTransaction } from '../entities/FinancialTransaction';
import { AdminAuditLog } from '../entities/AdminAuditLog';
import { RevenueTier } from '../entities/RevenueTier';

// Gym Center Entities
import { GymCenter } from '../entities/GymCenter';
import { GymBranch } from '../entities/GymBranch';
import { GymGallery } from '../entities/GymGallery';
import { GymAmenity } from '../entities/GymAmenity';
import { GymEquipment } from '../entities/GymEquipment';
import { GymTrainerLink } from '../entities/GymTrainerLink';
import { GymPricing } from '../entities/GymPricing';
import { GymEvent } from '../entities/GymEvent';
import { GymReview } from '../entities/GymReview';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    synchronize: true, // Thử bật sync để fix schema production
    logging: true,
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
        AthleteAchievement,
        UserPointsHistory,
        RankingCache,
        ProgramReport,
        FinancialTransaction,
        AdminAuditLog,
        RevenueTier,
        // Gym Center Module
        GymCenter,
        GymBranch,
        GymGallery,
        GymAmenity,
        GymEquipment,
        GymTrainerLink,
        GymPricing,
        GymEvent,
        GymReview,
    ],
    subscribers: [],
    migrations: [],
});
