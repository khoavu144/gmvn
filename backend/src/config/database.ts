import { DataSource } from 'typeorm';
import { getEnv } from './env';
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
import { ProgressPhoto } from '../entities/ProgressPhoto';
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
// Gym Marketplace Extension Entities
import { GymTaxonomyTerm } from '../entities/GymTaxonomyTerm';
import { GymCenterTaxonomyTerm } from '../entities/GymCenterTaxonomyTerm';
import { GymZone } from '../entities/GymZone';
import { GymProgram } from '../entities/GymProgram';
import { GymProgramSession } from '../entities/GymProgramSession';
import { GymLeadRoute } from '../entities/GymLeadRoute';
import { GymTrainerAvailability } from '../entities/GymTrainerAvailability';

import { TrainerSkill } from '../entities/TrainerSkill';
import { TrainerPackage } from '../entities/TrainerPackage';

// Coach Profile Enhancement Entities
import { Testimonial } from '../entities/Testimonial';
import { BeforeAfterPhoto } from '../entities/BeforeAfterPhoto';
import { TrainerProfileHighlight } from '../entities/TrainerProfileHighlight';
import { TrainerMediaFeature } from '../entities/TrainerMediaFeature';
import { TrainerPressMention } from '../entities/TrainerPressMention';
import { CommunityGallery } from '../entities/CommunityGallery';
import { EmailVerificationToken } from '../entities/EmailVerificationToken';
import { PasswordResetToken } from '../entities/PasswordResetToken';
import { CoachApplication } from '../entities/CoachApplication';
import { PlatformSubscription } from '../entities/PlatformSubscription';
import { AppSetting } from '../entities/AppSetting';

// Product Marketplace Entities
import { ProductCategory } from '../entities/ProductCategory';
import { SellerProfile } from '../entities/SellerProfile';
import { Product } from '../entities/Product';
import { ProductVariant } from '../entities/ProductVariant';
import { TrainingPackage } from '../entities/TrainingPackage';
import { ProductReview } from '../entities/ProductReview';
import { ProductOrder } from '../entities/ProductOrder';
import { ProductOrderItem } from '../entities/ProductOrderItem';
import { ProductWishlist } from '../entities/ProductWishlist';
import { ProhibitedKeyword } from '../entities/ProhibitedKeyword';

// News Module
import { NewsArticle } from '../entities/NewsArticle';
import { UserProfileSection } from '../entities/UserProfileSection';
import { UserProfileTerm } from '../entities/UserProfileTerm';
import { UserProfileTermSelection } from '../entities/UserProfileTermSelection';
import { GoogleFormImportLog } from '../entities/GoogleFormImportLog';

const env = getEnv();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: env.DATABASE_URL,
    ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    synchronize: false,
    logging: env.NODE_ENV === 'development',
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
        ProgressPhoto,
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
        // Gym Marketplace Extensions
        GymTaxonomyTerm,
        GymCenterTaxonomyTerm,
        GymZone,
        GymProgram,
        GymProgramSession,
        GymLeadRoute,
        GymTrainerAvailability,
        // Coach Profile Enhancement
        Testimonial,
        BeforeAfterPhoto,
        TrainerSkill,
        TrainerPackage,
        TrainerProfileHighlight,
        TrainerMediaFeature,
        TrainerPressMention,
        // Community Gallery
        CommunityGallery,
        EmailVerificationToken,
        PasswordResetToken,
        // Coach Application (Athlete → Coach upgrade)
        CoachApplication,
        // Platform Subscription (Free/Pro/Elite tiers)
        PlatformSubscription,
        AppSetting,
        // Product Marketplace
        ProductCategory,
        SellerProfile,
        Product,
        ProductVariant,
        TrainingPackage,
        ProductReview,
        ProductOrder,
        ProductOrderItem,
        ProductWishlist,
        ProhibitedKeyword,
        // News / Tin Tức
        NewsArticle,
        UserProfileSection,
        UserProfileTerm,
        UserProfileTermSelection,
        GoogleFormImportLog,
    ],
    subscribers: [],
    migrations: [__dirname + '/../migrations/*.{js,ts}'],
});
