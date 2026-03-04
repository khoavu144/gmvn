// Shared TypeScript types for the frontend
export interface User {
    id: string;
    email: string;
    full_name: string;
    user_type: 'user' | 'athlete' | 'trainer' | 'gym_owner' | 'admin';
    avatar_url: string | null;
    bio?: string | null;
    height_cm?: number | null;
    current_weight_kg?: number | null;
    experience_level?: string | null;
    specialties?: string[] | null;
    base_price_monthly?: number | null;
    is_verified?: boolean;
    gym_owner_status?: 'pending_review' | 'approved' | 'rejected' | null;
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

export interface GymCenter {
    id: string;
    owner_id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    cover_image_url: string | null;
    description: string | null;
    tagline: string | null;
    website_url: string | null;
    social_links: any | null;
    is_verified: boolean;
    is_active: boolean;
    view_count: number;
    created_at: string;
    updated_at: string;
    owner?: User; // joined relation for admin
    branches?: GymBranch[]; // optional relation
}

export interface GymBranch {
    id: string;
    gym_center_id: string;
    branch_name: string;
    address: string;
    city: string | null;
    district: string | null;
    latitude: number | null;
    longitude: number | null;
    phone: string | null;
    email: string | null;
    manager_name: string | null;
    opening_hours: any | null;
    is_active: boolean;
    view_count: number;
    description: string | null;
    created_at: string;
    updated_at: string;

    // Relations (optional)
    gym_center?: GymCenter;
    gallery?: GymGallery[];
    amenities?: GymAmenity[];
    equipment?: GymEquipment[];
    pricing?: GymPricing[];
    events?: GymEvent[];
    reviews?: GymReview[];
    trainer_links?: GymTrainerLink[];
}

export interface GymGallery {
    id: string;
    branch_id: string;
    image_url: string;
    caption: string | null;
    image_type: 'facility' | 'equipment' | 'class' | 'other';
    order_number: number;
}

export interface GymAmenity {
    id: string;
    branch_id: string;
    name: string;
    is_available: boolean;
    note: string | null;
}

export interface GymEquipment {
    id: string;
    branch_id: string;
    category: string;
    name: string;
    quantity: number | null;
    brand: string | null;
    condition?: string | null; // Added for UI helper if needed
    is_available: boolean;
}

export interface GymPricing {
    id: string;
    branch_id: string;
    plan_name: string;
    price: number;
    billing_cycle: 'per_day' | 'per_month' | 'per_quarter' | 'per_year' | 'per_session';
    description: string | null;
    is_highlighted: boolean;
    order_number: number;
}

export interface GymEvent {
    id: string;
    branch_id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string;
    instructor_name: string | null;
    max_participants: number | null;
    event_type: 'class' | 'workshop' | 'competition' | 'promotion' | 'other';
    image_url: string | null;
}

export interface GymTrainerLink {
    id: string;
    gym_center_id: string;
    branch_id: string | null;
    trainer_id: string;
    role_at_gym: string | null;
    status: 'pending' | 'active' | 'inactive' | 'removed';
    created_at: string;
    updated_at: string;

    // Relations
    gym_center?: GymCenter;
    branch?: GymBranch;
    trainer?: User;
}

export interface GymReview {
    id: string;
    branch_id: string;
    user_id: string;     // references User.id
    rating: number;
    comment: string | null;
    is_verified_athlete: boolean;
    is_visible: boolean;
    created_at: string;
    updated_at: string;

    user?: User; // joined relation
}
