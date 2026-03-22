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
    onboarding_completed?: boolean;
    gym_owner_status?: 'pending_review' | 'approved' | 'rejected' | null;
    /** Allows more than one marketplace listing (second+ product). */
    marketplace_membership_active?: boolean;
    created_at: string;
    updated_at?: string;
    profile_slug?: string | null; // for /coach/:slug URL
}

export interface Trainer {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    headline?: string | null;
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

export interface ProfileBadge {
    label: string;
    value?: string;
    icon_key?: string;
}

export interface ProfileMetric {
    label: string;
    value: string;
}

export interface ProfileCTAConfig {
    primary_label?: string;
    secondary_label?: string;
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
    profile_template: 'card' | 'hero';
    is_profile_public: boolean;
    profile_tagline?: string | null;
    profile_theme_variant?: string | null;
    hero_badges?: ProfileBadge[] | null;
    key_metrics?: ProfileMetric[] | null;
    cta_config?: ProfileCTAConfig | null;
    section_order?: string[] | null;
    is_featured_profile?: boolean;
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

export interface TrainerSkill {
    id: string;
    trainer_id: string;
    name: string;
    level: number; // 0-100
    category: string | null;
    order_number: number;
    created_at: string;
}

export interface TrainerPackage {
    id: string;
    trainer_id: string;
    name: string;
    description: string | null;
    duration_months: number;
    sessions_per_week: number | null;
    price: number;
    features: string[];
    is_popular: boolean;
    is_active: boolean;
    order_number: number;
    created_at: string;
}

export interface TrainerTestimonial {
    id: string;
    trainer_id: string;
    client_name: string;
    client_avatar: string | null;
    rating: number;
    comment: string;
    result_achieved: string | null;
    is_featured: boolean;
    is_approved: boolean;
    created_at: string;
}

export interface GymTaxonomyTerm {
    id: string;
    slug: string;
    label: string;
    term_type: 'venue_type' | 'training_style' | 'audience' | 'positioning' | 'service_model' | 'recovery_type' | 'atmosphere';
    parent_id?: string | null;
    sort_order?: number;
    is_active?: boolean;
    created_at?: string;
}

export interface GymCenterTaxonomyTerm {
    id: string;
    gym_center_id: string;
    term_id: string;
    is_primary: boolean;
    sort_order: number;
    term?: GymTaxonomyTerm;
}

export interface GymTrustDimensions {
    equipment_rating: number | null;
    cleanliness_rating: number | null;
    coaching_rating: number | null;
    atmosphere_rating: number | null;
    value_rating: number | null;
    crowd_rating: number | null;
}

export interface GymTrustSummary {
    avg_rating: number | null;
    review_count: number;
    dimensions: GymTrustDimensions;
}

export interface GymCenter {
    id: string;
    owner_id: string;
    name: string;
    slug: string | null;
    logo_url: string | null;
    cover_image_url: string | null;
    description: string | null;
    tagline: string | null;
    founded_year: number | null;
    total_area_sqm: number | null;
    total_equipment_count: number | null;
    highlights: string[] | null;
    website_url: string | null;
    social_links: any | null;
    is_verified: boolean;
    is_active: boolean;
    view_count: number;
    avg_rating?: number | null;
    review_count?: number | null;
    primary_venue_type_slug?: string | null;
    price_from_amount?: number | null;
    price_from_billing_cycle?: 'per_day' | 'per_month' | 'per_quarter' | 'per_year' | 'per_session' | null;
    positioning_tier?: 'budget' | 'mid' | 'premium' | 'luxury' | null;
    beginner_friendly?: boolean | null;
    women_friendly?: boolean | null;
    family_friendly?: boolean | null;
    athlete_friendly?: boolean | null;
    recovery_focused?: boolean | null;
    discovery_blurb?: string | null;
    hero_value_props?: string[] | null;
    profile_completeness_score?: number;
    response_sla_text?: string | null;
    default_primary_cta?: 'consultation' | 'visit_booking' | 'class_trial' | 'membership' | 'private_training' | 'corporate' | null;
    default_secondary_cta?: 'consultation' | 'visit_booking' | 'class_trial' | 'membership' | 'private_training' | 'corporate' | null;
    featured_weight?: number;
    created_at: string;
    updated_at: string;
    owner?: User;
    branches?: GymBranch[];
    listing_thumbnail?: GymGallery | null;
    taxonomy_terms?: GymCenterTaxonomyTerm[];
    trust_summary?: GymTrustSummary | null;
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
    google_maps_embed_url: string | null;
    phone: string | null;
    email: string | null;
    manager_name: string | null;
    opening_hours: any | null;
    is_active: boolean;
    view_count: number;
    description: string | null;
    neighborhood_label?: string | null;
    parking_summary?: string | null;
    locker_summary?: string | null;
    shower_summary?: string | null;
    towel_service_summary?: string | null;
    crowd_level_summary?: string | null;
    best_visit_time_summary?: string | null;
    accessibility_summary?: string | null;
    women_only_summary?: string | null;
    child_friendly_summary?: string | null;
    check_in_instructions?: string | null;
    branch_tagline?: string | null;
    whatsapp_number?: string | null;
    messenger_url?: string | null;
    consultation_phone?: string | null;
    cover_media_id?: string | null;
    branch_status_badges?: string[] | null;
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
    zones?: GymZone[];
    programs?: GymProgram[];
    lead_routes?: GymLeadRoute[];
}

export interface GymZone {
    id: string;
    branch_id: string;
    zone_type:
    | 'cardio_floor'
    | 'strength_floor'
    | 'free_weight_zone'
    | 'functional_zone'
    | 'yoga_room'
    | 'pilates_reformer_room'
    | 'pilates_mat_room'
    | 'cycling_room'
    | 'boxing_zone'
    | 'dance_room'
    | 'recovery_zone'
    | 'locker_zone'
    | 'pool_zone'
    | 'sauna_zone'
    | 'outdoor_zone'
    | 'other';
    name: string;
    description: string | null;
    capacity: number | null;
    area_sqm: number | null;
    booking_required: boolean;
    temperature_mode?: 'heated' | 'cooled' | 'ambient' | 'infrared' | 'outdoor' | null;
    sound_profile?: 'silent' | 'ambient_music' | 'energetic' | 'instructor_led' | null;
    natural_light_score?: number | null;
    is_signature_zone: boolean;
    sort_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface GymGallery {
    id: string;
    branch_id: string;
    image_url: string;
    caption: string | null;
    image_type: 'facility' | 'equipment' | 'class' | 'other' | 'exterior' | 'interior' | 'pool';
    order_number: number;
    media_role?: 'hero' | 'exterior' | 'reception' | 'open_gym' | 'class_in_action' | 'trainer_in_action' | 'equipment_detail' | 'zone_overview' | 'amenity' | 'recovery' | 'community' | 'before_after' | 'other';
    zone_id?: string | null;
    alt_text?: string | null;
    is_hero?: boolean;
    is_listing_thumb?: boolean;
    is_featured?: boolean;
    orientation?: 'landscape' | 'portrait' | 'square' | null;
    zone?: GymZone | null;
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
    condition?: string | null;
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
    plan_type?: 'membership' | 'class_pack' | 'private_pt' | 'drop_in' | 'trial' | 'reformer_pack' | 'recovery_pack' | 'corporate';
    access_scope?: 'single_branch' | 'all_branches' | 'selected_branches';
    included_services?: string[] | null;
    class_credits?: number | null;
    session_count?: number | null;
    trial_available?: boolean;
    trial_price?: number | null;
    joining_fee?: number | null;
    deposit_amount?: number | null;
    freeze_policy_summary?: string | null;
    cancellation_policy_summary?: string | null;
    validity_days?: number | null;
    peak_access_rule?: string | null;
    supports_multi_branch?: boolean;
    highlighted_reason?: string | null;
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

export interface GymProgramSession {
    id: string;
    program_id: string;
    starts_at: string;
    ends_at: string;
    seats_total: number;
    seats_remaining: number;
    waitlist_enabled: boolean;
    is_cancelled: boolean;
    session_note: string | null;
    created_at: string;
}

export interface GymProgram {
    id: string;
    branch_id: string;
    zone_id: string | null;
    trainer_id: string | null;
    title: string;
    program_type: 'yoga' | 'pilates' | 'hiit' | 'cycling' | 'boxing' | 'dance' | 'strength' | 'meditation' | 'recovery' | 'mobility' | 'other';
    level: 'beginner' | 'intermediate' | 'advanced' | 'all';
    description: string | null;
    duration_minutes: number;
    capacity: number;
    language_code: string | null;
    equipment_required: string[] | null;
    booking_mode: 'walk_in' | 'pre_booking' | 'member_only';
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    zone?: GymZone | null;
    sessions?: GymProgramSession[];
}

export interface GymLeadRoute {
    id: string;
    branch_id: string;
    inquiry_type: 'consultation' | 'visit_booking' | 'class_trial' | 'membership' | 'private_training' | 'corporate';
    primary_channel: 'whatsapp' | 'phone' | 'messenger' | 'email' | 'in_app';
    fallback_channel?: 'whatsapp' | 'phone' | 'messenger' | 'email' | 'in_app' | null;
    phone?: string | null;
    whatsapp?: string | null;
    messenger_url?: string | null;
    email?: string | null;
    owner_user_id?: string | null;
    active_hours?: Record<string, { from: string; to: string }> | null;
    auto_prefill_message?: string | null;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface GymTrainerLink {
    id: string;
    gym_center_id: string;
    branch_id: string | null;
    trainer_id: string;
    role_at_gym: string | null;
    status: 'pending' | 'active' | 'inactive' | 'removed';
    linked_at?: string | null;
    specialization_summary?: string | null;
    featured_at_branch?: boolean;
    accepts_private_clients?: boolean;
    branch_intro?: string | null;
    languages?: string[] | null;
    visible_order?: number;
    created_at: string;
    updated_at?: string;

    // Relations
    gym_center?: GymCenter;
    branch?: GymBranch;
    trainer?: User;
}

// Sprint 3: In-app notification
export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body: string | null;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

export interface GymReview {
    id: string;
    branch_id: string;
    user_id: string;
    rating: number;
    comment: string | null;
    is_verified_athlete?: boolean;
    verified_via_subscription_id?: string | null;
    is_visible: boolean;
    equipment_rating?: number | null;
    cleanliness_rating?: number | null;
    coaching_rating?: number | null;
    atmosphere_rating?: number | null;
    value_rating?: number | null;
    crowd_rating?: number | null;
    visit_type?: 'member' | 'drop_in' | 'trial' | 'guest' | null;
    is_verified_visit?: boolean;
    created_at: string;
    updated_at: string;

    user?: User;

    // Sprint 3: Review Reply
    reply_text?: string | null;
    replied_by_id?: string | null;
    replied_at?: string | null;
    replied_by?: User;
}

export interface ProgressPhoto {
    id: string;
    user_id: string;
    image_url: string;
    caption?: string | null;
    taken_at?: string | null;
    weight_kg?: number | null;
    created_at: string;
}

// ─────────────────────────────────────────────────────────────────────
// PRODUCT MARKETPLACE
// ─────────────────────────────────────────────────────────────────────

export type ProductType = 'digital' | 'physical' | 'service';
export type ProductStatus =
    | 'draft'
    | 'pending_review'
    | 'active'
    | 'rejected'
    | 'suspended'
    | 'sold_out'
    | 'archived';

export interface ProductCategory {
    id: string;
    slug: string;
    label: string;
    parent_id: string | null;
    icon_emoji: string | null;
    product_type: ProductType;
    requires_moderation: boolean;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    // Relations
    children?: ProductCategory[];
    parent?: ProductCategory | null;
}

export interface SellerProfile {
    id: string;
    user_id: string;
    shop_name: string;
    shop_slug: string;
    shop_description: string | null;
    shop_logo_url: string | null;
    shop_cover_url: string | null;
    business_type: 'individual' | 'brand' | 'gym' | 'coach';
    contact_phone: string | null;
    contact_email: string | null;
    commission_rate: number;
    is_verified: boolean;
    total_revenue: number;
    total_orders: number;
    avg_rating: number | null;
    status: 'pending' | 'active' | 'suspended';
    created_at: string;
    updated_at: string;
    // Relations
    user?: User;
}

export interface ProductVariant {
    id: string;
    product_id: string;
    variant_label: string;
    variant_attributes: Record<string, string> | null;
    price: number | null;
    compare_at_price: number | null;
    stock_quantity: number | null;
    sku: string | null;
    image_url: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

export interface TrainingPackageDetail {
    id: string;
    product_id: string;
    goal: 'fat_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'rehabilitation' | 'competition_prep' | 'general_fitness';
    level: 'beginner' | 'intermediate' | 'advanced' | 'all';
    duration_weeks: number;
    sessions_per_week: number;
    equipment_required: string[] | null;
    includes_nutrition: boolean;
    includes_video: boolean;
    program_structure: Record<string, Record<string, {
        title: string;
        exercises: Array<{
            name: string;
            sets: number;
            reps: string;
            rest_seconds?: number;
            note?: string;
            video_url?: string;
        }>;
        warmup?: string;
        cooldown?: string;
    }>> | null;
    preview_weeks: number;
    nutrition_guide: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: string;
    seller_id: string;
    seller_profile_id: string | null;
    category_id: string;
    title: string;
    slug: string;
    description: string | null;
    product_type: ProductType;
    status: ProductStatus;
    price: number;
    compare_at_price: number | null;
    currency: string;
    stock_quantity: number | null;
    track_inventory: boolean;
    sku: string | null;
    digital_file_url: string | null;
    preview_content: string | null;
    thumbnail_url: string | null;
    gallery: string[] | null;
    attributes: Record<string, unknown> | null;
    tags: string[] | null;
    view_count: number;
    sale_count: number;
    wishlist_count: number;
    avg_rating: number | null;
    review_count: number;
    featured_weight: number;
    moderation_note: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    // Relations
    category?: ProductCategory;
    seller?: User;
    variants?: ProductVariant[];
    training_package?: TrainingPackageDetail | null;
}

export interface ProductReview {
    id: string;
    product_id: string;
    user_id: string;
    order_item_id: string | null;
    rating: number;
    comment: string | null;
    quality_rating: number | null;
    value_rating: number | null;
    delivery_rating: number | null;
    is_verified_purchase: boolean;
    is_visible: boolean;
    reply_text: string | null;
    replied_by_id: string | null;
    replied_at: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    user?: User;
}

export interface ProductOrderItem {
    id: string;
    order_id: string;
    product_id: string;
    variant_id: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
    digital_download_url: string | null;
    digital_download_count: number;
    digital_download_limit: number;
    product_title_snapshot: string | null;
    created_at: string;
    // Relations
    product?: Product;
    variant?: ProductVariant | null;
}

export interface ShippingAddress {
    full_name: string;
    phone: string;
    address: string;
    district?: string;
    city: string;
    province?: string;
    note?: string;
}

export interface ProductOrder {
    id: string;
    buyer_id: string;
    order_number: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    total_amount: number;
    shipping_fee: number;
    discount_amount: number;
    payment_method: 'bank_transfer' | 'cod' | 'vnpay' | 'momo' | 'zalopay';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    shipping_address: ShippingAddress | null;
    tracking_number: string | null;
    note: string | null;
    created_at: string;
    updated_at: string;
    // Relations
    buyer?: User;
    items?: ProductOrderItem[];
}

export interface ProductWishlistItem {
    id: string;
    user_id: string;
    product_id: string;
    created_at: string;
    product?: Product;
}

// API response wrappers
export interface MarketplaceListResponse {
    success: boolean;
    products: Product[];
    total: number;
    page: number;
    limit: number;
}

export interface MarketplaceCategoriesResponse {
    success: boolean;
    categories: ProductCategory[];
}

export interface MarketplaceFeaturedResponse {
    success: boolean;
    featured: Product[];
    new_arrivals: Product[];
}
