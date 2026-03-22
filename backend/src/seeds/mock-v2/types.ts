export type SeedImageKind =
    | 'coach_avatar'
    | 'coach_cover'
    | 'coach_gallery'
    | 'athlete_avatar'
    | 'athlete_gallery'
    | 'member_avatar'
    | 'gym_cover'
    | 'gym_gallery'
    | 'shop_logo'
    | 'shop_cover'
    | 'product_physical'
    | 'product_digital'
    | 'product_service'
    | 'transformation'
    | 'community_gallery';

export interface SeedImageEntry {
    id: string;
    kind: SeedImageKind;
    url: string;
    tags: string[];
    note?: string;
}

export interface ReferenceCategorySeed {
    slug: string;
    label: string;
    product_type: 'digital' | 'physical' | 'service';
    icon_emoji: string;
    sort_order: number;
    requires_moderation?: boolean;
}

export interface GymTaxonomySeed {
    slug: string;
    label: string;
    term_type:
        | 'venue_type'
        | 'training_style'
        | 'audience'
        | 'positioning'
        | 'service_model'
        | 'recovery_type'
        | 'atmosphere';
    sort_order: number;
}

export interface UserProfileCatalogSeed {
    section: {
        slug: string;
        title_vi: string;
        description_vi: string;
        sort_order: number;
        applies_to: Array<'user' | 'athlete' | 'trainer' | 'gym_owner'>;
        min_select: number;
        max_select: number;
    };
    terms: Array<{
        slug: string;
        label_vi: string;
        sort_order: number;
    }>;
}

export interface DemoIdentity {
    key: string;
    full_name: string;
    email: string;
    slug: string;
    city: string;
    district: string;
    avatar_url: string;
    bio: string;
}

export interface MockCoachRecord extends DemoIdentity {
    user_type: 'trainer';
    specialties: string[];
    base_price_monthly: number;
    is_verified: boolean;
    marketplace_membership_active: boolean;
    experience_level: 'intermediate' | 'advanced';
    headline: string;
    bio_short: string;
    bio_long: string;
    years_experience: number;
    clients_trained: number;
    success_stories: number;
    profile_tagline: string;
    is_accepting_clients: boolean;
    packages: Array<{
        name: string;
        description: string;
        duration_months: number;
        sessions_per_week: number;
        price: number;
        features: string[];
        is_popular: boolean;
    }>;
    gallery: Array<{
        image_url: string;
        caption: string;
        image_type: 'workout' | 'event' | 'certificate' | 'other' | 'transformation';
    }>;
    testimonials: Array<{
        client_name: string;
        client_avatar: string;
        rating: number;
        comment: string;
        result_achieved: string;
        is_featured: boolean;
    }>;
    before_after: {
        client_name: string;
        before_url: string;
        after_url: string;
        story: string;
        duration_weeks: number;
    };
    programs: Array<{
        name: string;
        description: string;
        duration_weeks: number;
        difficulty: 'beginner' | 'intermediate' | 'advanced';
        equipment_needed: string[];
        price_monthly?: number;
        price_one_time?: number;
        pricing_type: 'lump_sum' | 'monthly' | 'per_session';
        training_format: 'online' | 'offline_1on1' | 'offline_group' | 'hybrid';
        included_features: string[];
        training_goals: string[];
        prerequisites?: string;
        cover_image_url: string;
        max_clients: number;
        current_clients: number;
    }>;
    highlights: Array<{
        title: string;
        value: string;
        icon_key: string;
    }>;
    experiences: Array<{
        title: string;
        organization: string;
        location?: string;
        experience_type: 'work' | 'education' | 'certification' | 'achievement';
        start_date: string;
        end_date?: string;
        is_current?: boolean;
        description?: string;
        achievements?: string[];
    }>;
    skills: Array<{
        name: string;
        level: number;
        category: string;
    }>;
    social_links: Record<string, string>;
    languages: string[];
    cover_image_url: string;
}

export interface MockAthleteRecord extends DemoIdentity {
    user_type: 'athlete';
    specialties: string[];
    is_verified: boolean;
    experience_level: 'beginner' | 'intermediate' | 'advanced';
    headline: string;
    bio_short: string;
    bio_long: string;
    years_experience: number;
    profile_tagline: string;
    gallery: Array<{
        image_url: string;
        caption: string;
        image_type: 'workout' | 'event' | 'certificate' | 'other' | 'transformation';
    }>;
    progress_photos: Array<{
        image_url: string;
        caption: string;
        taken_at: string;
        weight_kg: number;
    }>;
    experiences: Array<{
        title: string;
        organization: string;
        location?: string;
        experience_type: 'work' | 'education' | 'certification' | 'achievement';
        start_date: string;
        end_date?: string;
        is_current?: boolean;
        description?: string;
    }>;
    achievements: Array<{
        achievement_title: string;
        competition_name: string;
        organizing_body: string;
        achievement_level: 'LOCAL' | 'NATIONAL' | 'INTERNATIONAL';
        achievement_date: string;
        certificate_image_url: string;
        medal_type: 'GOLD' | 'SILVER' | 'BRONZE' | 'PARTICIPATION';
        proof_url?: string;
        verification_notes: string;
    }>;
    packages: Array<{
        name: string;
        description: string;
        duration_months: number;
        sessions_per_week: number;
        price: number;
        features: string[];
        is_popular: boolean;
    }>;
    social_links: Record<string, string>;
    languages: string[];
    cover_image_url: string;
}

export interface MockMemberRecord extends DemoIdentity {
    user_type: 'user';
    experience_level: 'beginner' | 'intermediate';
    onboarding_goals: string[];
    interests: string[];
    city: string;
}

export interface MockGymOwnerRecord extends DemoIdentity {
    user_type: 'gym_owner';
    gym_owner_status: 'approved';
    marketplace_membership_active: boolean;
}

export interface MockGymRecord {
    key: string;
    owner_key: string;
    name: string;
    slug: string;
    city: string;
    district: string;
    address: string;
    tagline: string;
    description: string;
    logo_url: string;
    cover_image_url: string;
    founded_year: number;
    total_area_sqm: number;
    total_equipment_count: number;
    highlights: string[];
    social_links: Record<string, string>;
    is_verified: boolean;
    primary_venue_type_slug: string;
    positioning_tier: 'budget' | 'mid' | 'premium' | 'luxury';
    beginner_friendly: boolean;
    women_friendly: boolean;
    family_friendly: boolean;
    athlete_friendly: boolean;
    recovery_focused: boolean;
    discovery_blurb: string;
    hero_value_props: string[];
    profile_completeness_score: number;
    response_sla_text: string;
    default_primary_cta: 'consultation' | 'visit_booking' | 'class_trial' | 'membership' | 'private_training' | 'corporate';
    default_secondary_cta: 'consultation' | 'visit_booking' | 'class_trial' | 'membership' | 'private_training' | 'corporate';
    featured_weight: number;
    branch: {
        branch_name: string;
        description: string;
        manager_name: string;
        phone: string;
        email: string;
        latitude: number;
        longitude: number;
        neighborhood_label: string;
        parking_summary: string;
        locker_summary: string;
        shower_summary: string;
        towel_service_summary: string;
        crowd_level_summary: string;
        best_visit_time_summary: string;
        accessibility_summary: string;
        women_only_summary?: string;
        child_friendly_summary?: string;
        check_in_instructions: string;
        branch_tagline: string;
        whatsapp_number: string;
        messenger_url: string;
        consultation_phone: string;
        branch_status_badges: string[];
        opening_hours: Record<string, { open: string; close: string; is_closed?: boolean }>;
    };
    taxonomy_slugs: string[];
    amenities: Array<{ name: string; note: string }>;
    equipment: Array<{ category: string; name: string; quantity: number; brand?: string }>;
    pricing: Array<{
        plan_name: string;
        price: number;
        billing_cycle: 'per_day' | 'per_month' | 'per_quarter' | 'per_year' | 'per_session';
        description: string;
        is_highlighted: boolean;
        order_number: number;
        plan_type: 'membership' | 'class_pack' | 'private_pt' | 'drop_in' | 'trial' | 'reformer_pack' | 'recovery_pack' | 'corporate';
        access_scope: 'single_branch' | 'all_branches' | 'selected_branches';
        included_services: string[];
        class_credits?: number;
        session_count?: number;
        trial_available: boolean;
        trial_price?: number;
        joining_fee?: number;
        deposit_amount?: number;
        freeze_policy_summary?: string;
        cancellation_policy_summary?: string;
        validity_days?: number;
        peak_access_rule?: string;
        supports_multi_branch?: boolean;
        highlighted_reason?: string;
    }>;
    zones: Array<{
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
        description: string;
        capacity: number;
        area_sqm: number;
        booking_required: boolean;
        temperature_mode?: 'heated' | 'cooled' | 'ambient' | 'infrared' | 'outdoor';
        sound_profile?: 'silent' | 'ambient_music' | 'energetic' | 'instructor_led';
        natural_light_score?: number;
        is_signature_zone?: boolean;
        sort_order: number;
    }>;
    gallery: Array<{
        image_url: string;
        caption: string;
        image_type: 'exterior' | 'interior' | 'equipment' | 'pool' | 'class' | 'other';
        media_role:
            | 'hero'
            | 'exterior'
            | 'reception'
            | 'open_gym'
            | 'class_in_action'
            | 'trainer_in_action'
            | 'equipment_detail'
            | 'zone_overview'
            | 'amenity'
            | 'recovery'
            | 'community'
            | 'before_after'
            | 'other';
        alt_text: string;
        is_hero: boolean;
        is_listing_thumb: boolean;
        is_featured: boolean;
        orientation: 'landscape' | 'portrait' | 'square';
    }>;
    program_templates: Array<{
        title: string;
        program_type: 'yoga' | 'pilates' | 'hiit' | 'cycling' | 'boxing' | 'dance' | 'strength' | 'meditation' | 'recovery' | 'mobility' | 'other';
        level: 'beginner' | 'intermediate' | 'advanced' | 'all';
        description: string;
        duration_minutes: number;
        capacity: number;
        equipment_required?: string[];
        booking_mode: 'walk_in' | 'pre_booking' | 'member_only';
        zone_name?: string;
        trainer_key?: string;
        sessions: Array<{
            starts_at: string;
            ends_at: string;
            seats_total: number;
            seats_remaining: number;
            waitlist_enabled?: boolean;
            session_note?: string;
        }>;
    }>;
    lead_routes: Array<{
        inquiry_type: 'consultation' | 'visit_booking' | 'class_trial' | 'membership' | 'private_training' | 'corporate';
        primary_channel: 'whatsapp' | 'phone' | 'messenger' | 'email' | 'in_app';
        fallback_channel?: 'whatsapp' | 'phone' | 'messenger' | 'email' | 'in_app';
        auto_prefill_message: string;
    }>;
    linked_trainer_keys: string[];
    review_templates: Array<{
        reviewer_key: string;
        rating: number;
        comment: string;
        equipment_rating: number;
        cleanliness_rating: number;
        coaching_rating: number;
        atmosphere_rating: number;
        value_rating: number;
        crowd_rating: number;
        visit_type: 'member' | 'drop_in' | 'trial' | 'guest';
        is_verified_visit: boolean;
        reply_text: string;
    }>;
}

export interface MockShopRecord {
    key: string;
    owner_key: string;
    shop_name: string;
    shop_slug: string;
    shop_description: string;
    shop_logo_url: string;
    shop_cover_url: string;
    business_type: 'individual' | 'brand' | 'gym' | 'coach';
    contact_phone: string;
    contact_email: string;
    commission_rate: number;
    is_verified: boolean;
    status: 'active';
}

export interface MockProductRecord {
    key: string;
    shop_key: string;
    seller_key: string;
    category_slug: string;
    title: string;
    slug: string;
    description: string;
    product_type: 'digital' | 'physical' | 'service';
    price: number;
    compare_at_price: number | null;
    currency: 'VND';
    stock_quantity: number | null;
    track_inventory: boolean;
    sku: string;
    digital_file_url: string | null;
    preview_content: string | null;
    thumbnail_url: string;
    gallery: string[];
    attributes: Record<string, unknown>;
    tags: string[];
    featured_weight: number;
    variants: Array<{
        variant_label: string;
        variant_attributes: Record<string, string>;
        price: number;
        compare_at_price: number | null;
        stock_quantity: number | null;
        sku: string;
        image_url: string | null;
        is_active: boolean;
        sort_order: number;
    }>;
    training_package?: {
        goal: 'fat_loss' | 'muscle_gain' | 'endurance' | 'flexibility' | 'rehabilitation' | 'competition_prep' | 'general_fitness';
        level: 'beginner' | 'intermediate' | 'advanced' | 'all';
        duration_weeks: number;
        sessions_per_week: number;
        equipment_required: string[];
        includes_nutrition: boolean;
        includes_video: boolean;
        preview_weeks: number;
        program_structure: Record<string, unknown>;
        nutrition_guide?: Record<string, unknown>;
    };
}

export interface MockGalleryRecord {
    key: string;
    image_url: string;
    caption: string;
    category: 'workout' | 'lifestyle' | 'transformation' | 'event' | 'gym_space' | 'portrait' | 'other';
    linked_user_key: string | null;
    source: 'admin_upload' | 'trainer_gallery';
    is_featured: boolean;
    order_number: number;
}

export interface MockMessageThread {
    key: string;
    participants: [string, string];
    messages: Array<{
        sender_key: string;
        content: string;
        is_read: boolean;
        created_at: string;
    }>;
}

export interface MockProductOrderRecord {
    key: string;
    buyer_key: string;
    order_number: string;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
    payment_method: 'bank_transfer' | 'cod' | 'vnpay' | 'momo' | 'zalopay';
    payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
    shipping_fee: number;
    discount_amount: number;
    note: string | null;
    tracking_number: string | null;
    shipping_address: {
        full_name: string;
        phone: string;
        address: string;
        district?: string;
        city: string;
        province?: string;
        note?: string;
    } | null;
    items: Array<{
        product_key: string;
        variant_sku?: string;
        quantity: number;
        digital_download_url?: string | null;
        digital_download_count?: number;
        digital_download_limit?: number;
    }>;
}

export interface MockWishlistRecord {
    user_key: string;
    product_key: string;
}

export interface MockProductReviewRecord {
    user_key: string;
    product_key: string;
    rating: number;
    comment: string;
    quality_rating: number;
    value_rating: number;
    delivery_rating: number;
    is_verified_purchase: boolean;
    reply_text?: string;
}

export interface MockDataset {
    coaches: MockCoachRecord[];
    athletes: MockAthleteRecord[];
    members: MockMemberRecord[];
    gymOwners: MockGymOwnerRecord[];
    gyms: MockGymRecord[];
    shops: MockShopRecord[];
    products: MockProductRecord[];
    communityGallery: MockGalleryRecord[];
    messageThreads: MockMessageThread[];
    productOrders: MockProductOrderRecord[];
    wishlists: MockWishlistRecord[];
    productReviews: MockProductReviewRecord[];
}
