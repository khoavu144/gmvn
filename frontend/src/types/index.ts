// Shared TypeScript types for the frontend
export interface User {
    id: string;
    email: string;
    full_name: string;
    user_type: 'user' | 'athlete' | 'trainer' | 'admin';
    avatar_url: string | null;
    bio?: string | null;
    height_cm?: number | null;
    current_weight_kg?: number | null;
    experience_level?: string | null;
    specialties?: string[] | null;
    base_price_monthly?: number | null;
    is_verified?: boolean;
    created_at: string;
    updated_at?: string;
}

export interface Trainer {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
    specialties: string[];
    certifications: { name: string; year: number }[];
    years_experience: number;
    base_price_monthly: number;
    rating_avg: number;
    review_count: number;
    follower_count: number;
}

export interface Program {
    id: string;
    trainer_id: string;
    name: string;
    description: string | null;
    duration_weeks: number | null;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
    equipment_needed: string[] | null;
    price_monthly: number | null;
    price_one_time: number | null;

    // New Fields
    training_format: 'online' | 'offline_1on1' | 'offline_group' | 'hybrid';
    included_features: string[] | null;
    pricing_type: 'lump_sum' | 'monthly' | 'per_session';
    price_per_session: number | null;
    training_goals: string[] | null;
    prerequisites: string | null;
    cover_image_url: string | null;

    is_published: boolean;
    max_clients: number;
    current_clients: number;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user: User;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    details?: any;
}

export interface SocialLinks {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    twitter?: string;
    website?: string;
    linkedin?: string;
}

export interface Certification {
    name: string;
    issuer: string;
    year: number;
    url?: string;
}

export interface Award {
    name: string;
    organization: string;
    year: number;
    description?: string;
}

export interface TrainerProfile {
    id: string;
    trainer_id: string;
    trainer?: User;
    slug: string | null;
    cover_image_url: string | null;
    headline: string | null;
    bio_short: string | null;
    bio_long: string | null;
    years_experience: number | null;
    clients_trained: number | null;
    success_stories: number | null;
    certifications: Certification[] | null;
    awards: Award[] | null;
    phone: string | null;
    location: string | null;
    timezone: string | null;
    social_links: SocialLinks | null;
    languages: string[] | null;
    is_accepting_clients: boolean;
    theme_color: string;
    is_profile_public: boolean;
    created_at: string;
    updated_at: string;
}

export interface TrainerExperience {
    id: string;
    trainer_id: string;
    title: string;
    organization: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    description: string | null;
    experience_type: 'work' | 'education' | 'certification' | 'achievement';
    created_at: string;
}

export interface TrainerGallery {
    id: string;
    trainer_id: string;
    image_url: string;
    caption: string | null;
    image_type: 'transformation' | 'workout' | 'event' | 'certificate' | 'other';
    order_number: number;
    created_at: string;
}

export interface TrainerFAQ {
    id: string;
    trainer_id: string;
    question: string;
    answer: string;
    order_number: number;
    created_at: string;
}
