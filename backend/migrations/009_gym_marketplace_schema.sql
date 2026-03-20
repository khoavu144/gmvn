-- ============================================================
-- Migration 009: Gym Marketplace Schema Extension
-- ============================================================
-- All changes are additive (no destructive rewrites).
-- Every new field uses safe NULL or default fallback.
-- Run this migration once against the production database.
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. TAXONOMY SYSTEM
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gym_taxonomy_terms (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug          VARCHAR(100) NOT NULL UNIQUE,
    label         VARCHAR(200) NOT NULL,
    term_type     VARCHAR(50)  NOT NULL,  -- venue_type | training_style | audience | positioning | service_model | recovery_type | atmosphere
    parent_id     UUID REFERENCES gym_taxonomy_terms(id) ON DELETE SET NULL,
    sort_order    INT          NOT NULL DEFAULT 0,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gym_taxonomy_terms_term_type ON gym_taxonomy_terms(term_type);
CREATE INDEX IF NOT EXISTS idx_gym_taxonomy_terms_slug     ON gym_taxonomy_terms(slug);

-- Junction: many-to-many center ↔ taxonomy
CREATE TABLE IF NOT EXISTS gym_center_taxonomy_terms (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_center_id  UUID NOT NULL REFERENCES gym_centers(id)       ON DELETE CASCADE,
    term_id        UUID NOT NULL REFERENCES gym_taxonomy_terms(id) ON DELETE CASCADE,
    is_primary     BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order     INT     NOT NULL DEFAULT 0,
    UNIQUE (gym_center_id, term_id)
);

CREATE INDEX IF NOT EXISTS idx_gym_center_taxonomy_gym  ON gym_center_taxonomy_terms(gym_center_id);
CREATE INDEX IF NOT EXISTS idx_gym_center_taxonomy_term ON gym_center_taxonomy_terms(term_id);

-- ─────────────────────────────────────────────────────────────
-- 2. EXTEND gym_centers — discovery summary fields
-- ─────────────────────────────────────────────────────────────

ALTER TABLE gym_centers
    ADD COLUMN IF NOT EXISTS primary_venue_type_slug    VARCHAR(100)     DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS price_from_amount          NUMERIC(14, 0)   DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS price_from_billing_cycle   VARCHAR(30)      DEFAULT NULL,  -- per_day | per_month | per_session | etc.
    ADD COLUMN IF NOT EXISTS positioning_tier           VARCHAR(30)      DEFAULT NULL,  -- budget | mid | premium | luxury
    ADD COLUMN IF NOT EXISTS beginner_friendly          BOOLEAN          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS women_friendly             BOOLEAN          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS family_friendly            BOOLEAN          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS athlete_friendly           BOOLEAN          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS recovery_focused           BOOLEAN          DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS discovery_blurb            VARCHAR(300)     DEFAULT NULL,  -- ≤ 2 sentences for card
    ADD COLUMN IF NOT EXISTS hero_value_props           JSONB            DEFAULT NULL,  -- string[]
    ADD COLUMN IF NOT EXISTS profile_completeness_score SMALLINT         DEFAULT 0,     -- 0–100
    ADD COLUMN IF NOT EXISTS response_sla_text          VARCHAR(100)     DEFAULT NULL,  -- 'Phản hồi trong 2 giờ'
    ADD COLUMN IF NOT EXISTS default_primary_cta        VARCHAR(50)      DEFAULT NULL,  -- consultation | visit_booking | class_trial | membership
    ADD COLUMN IF NOT EXISTS default_secondary_cta      VARCHAR(50)      DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS featured_weight            SMALLINT         DEFAULT 0;     -- 0 = organic, higher = editorial boost

CREATE INDEX IF NOT EXISTS idx_gym_centers_featured_weight ON gym_centers(featured_weight DESC);
CREATE INDEX IF NOT EXISTS idx_gym_centers_venue_type      ON gym_centers(primary_venue_type_slug);

-- ─────────────────────────────────────────────────────────────
-- 3. EXTEND gym_branches — decision-making fields
-- ─────────────────────────────────────────────────────────────

ALTER TABLE gym_branches
    ADD COLUMN IF NOT EXISTS neighborhood_label       VARCHAR(150) DEFAULT NULL,  -- 'Quận 7, gần Phú Mỹ Hưng'
    ADD COLUMN IF NOT EXISTS parking_summary          VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS locker_summary           VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS shower_summary           VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS towel_service_summary    VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS crowd_level_summary      VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS best_visit_time_summary  VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS accessibility_summary    VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS women_only_summary       VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS child_friendly_summary   VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS check_in_instructions    TEXT         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS branch_tagline           VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS whatsapp_number          VARCHAR(30)  DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS messenger_url            VARCHAR(500) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS consultation_phone       VARCHAR(30)  DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS cover_media_id           UUID         DEFAULT NULL,  -- FK → gym_gallery.id (set after gallery rows exist)
    ADD COLUMN IF NOT EXISTS branch_status_badges     JSONB        DEFAULT NULL;  -- ['New', 'Popular', 'Renovated']

-- ─────────────────────────────────────────────────────────────
-- 4. ZONE STORYTELLING — new table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gym_zones (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id           UUID         NOT NULL REFERENCES gym_branches(id) ON DELETE CASCADE,
    zone_type           VARCHAR(50)  NOT NULL,  -- cardio_floor | strength_floor | free_weight_zone | functional_zone | yoga_room | pilates_reformer_room | pilates_mat_room | cycling_room | boxing_zone | dance_room | recovery_zone | locker_zone | pool_zone | sauna_zone | outdoor_zone | other
    name                VARCHAR(200) NOT NULL,
    description         TEXT         DEFAULT NULL,
    capacity            INT          DEFAULT NULL,   -- persons
    area_sqm            NUMERIC(8,1) DEFAULT NULL,
    booking_required    BOOLEAN      NOT NULL DEFAULT FALSE,
    temperature_mode    VARCHAR(50)  DEFAULT NULL,   -- heated | cooled | ambient | infrared | outdoor
    sound_profile       VARCHAR(50)  DEFAULT NULL,   -- silent | ambient_music | energetic | instructor_led
    natural_light_score SMALLINT     DEFAULT NULL,   -- 1-5
    is_signature_zone   BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order          INT          NOT NULL DEFAULT 0,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gym_zones_branch    ON gym_zones(branch_id);
CREATE INDEX IF NOT EXISTS idx_gym_zones_zone_type ON gym_zones(zone_type);

-- ─────────────────────────────────────────────────────────────
-- 5. EXTEND gym_gallery — media semantics
-- ─────────────────────────────────────────────────────────────

ALTER TABLE gym_gallery
    ADD COLUMN IF NOT EXISTS media_role        VARCHAR(50)  DEFAULT 'other',   -- hero | exterior | reception | open_gym | class_in_action | trainer_in_action | equipment_detail | zone_overview | amenity | recovery | community | before_after | other
    ADD COLUMN IF NOT EXISTS zone_id           UUID         DEFAULT NULL REFERENCES gym_zones(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS alt_text          VARCHAR(300) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS is_hero           BOOLEAN      NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_listing_thumb  BOOLEAN      NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_featured       BOOLEAN      NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS orientation       VARCHAR(20)  DEFAULT NULL;  -- landscape | portrait | square

CREATE INDEX IF NOT EXISTS idx_gym_gallery_is_hero          ON gym_gallery(branch_id, is_hero)          WHERE is_hero = TRUE;
CREATE INDEX IF NOT EXISTS idx_gym_gallery_is_listing_thumb ON gym_gallery(branch_id, is_listing_thumb) WHERE is_listing_thumb = TRUE;
CREATE INDEX IF NOT EXISTS idx_gym_gallery_zone             ON gym_gallery(zone_id)                     WHERE zone_id IS NOT NULL;

-- Backfill: map existing image_type to media_role
UPDATE gym_gallery SET media_role = 'exterior'          WHERE media_role = 'other' AND image_type = 'exterior';
UPDATE gym_gallery SET media_role = 'open_gym'          WHERE media_role = 'other' AND image_type = 'interior';
UPDATE gym_gallery SET media_role = 'equipment_detail'  WHERE media_role = 'other' AND image_type = 'equipment';
UPDATE gym_gallery SET media_role = 'zone_overview'     WHERE media_role = 'other' AND image_type = 'pool';
UPDATE gym_gallery SET media_role = 'class_in_action'   WHERE media_role = 'other' AND image_type = 'class';

-- Promote first image per branch to listing_thumb if none set
UPDATE gym_gallery g
SET is_listing_thumb = TRUE
FROM (
    SELECT DISTINCT ON (branch_id) id
    FROM gym_gallery
    WHERE is_listing_thumb = FALSE
    ORDER BY branch_id, order_number ASC
) first_img
WHERE g.id = first_img.id
AND NOT EXISTS (
    SELECT 1 FROM gym_gallery g2
    WHERE g2.branch_id = g.branch_id AND g2.is_listing_thumb = TRUE
);

-- ─────────────────────────────────────────────────────────────
-- 6. EXTEND gym_pricing — pricing semantics
-- ─────────────────────────────────────────────────────────────

ALTER TABLE gym_pricing
    ADD COLUMN IF NOT EXISTS plan_type                   VARCHAR(30)    DEFAULT 'membership',  -- membership | class_pack | private_pt | drop_in | trial | reformer_pack | recovery_pack | corporate
    ADD COLUMN IF NOT EXISTS access_scope                VARCHAR(30)    DEFAULT 'single_branch', -- single_branch | all_branches | selected_branches
    ADD COLUMN IF NOT EXISTS included_services           JSONB          DEFAULT NULL,  -- string[]
    ADD COLUMN IF NOT EXISTS class_credits               INT            DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS session_count               INT            DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS trial_available             BOOLEAN        NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS trial_price                 NUMERIC(14, 0) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS joining_fee                 NUMERIC(14, 0) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS deposit_amount              NUMERIC(14, 0) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS freeze_policy_summary       VARCHAR(300)   DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS cancellation_policy_summary VARCHAR(300)   DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS validity_days               INT            DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS peak_access_rule            VARCHAR(200)   DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS supports_multi_branch       BOOLEAN        NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS highlighted_reason          VARCHAR(200)   DEFAULT NULL;  -- 'Tiết kiệm nhất', 'Phổ biến nhất'

-- ─────────────────────────────────────────────────────────────
-- 7. SCHEDULE INTELLIGENCE — new tables
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gym_programs (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id          UUID         NOT NULL REFERENCES gym_branches(id)     ON DELETE CASCADE,
    zone_id            UUID         DEFAULT NULL REFERENCES gym_zones(id)    ON DELETE SET NULL,
    trainer_id         UUID         DEFAULT NULL REFERENCES users(id)        ON DELETE SET NULL,
    title              VARCHAR(200) NOT NULL,
    program_type       VARCHAR(50)  NOT NULL,   -- yoga | pilates | hiit | cycling | boxing | dance | strength | meditation | recovery | mobility | other
    level              VARCHAR(20)  DEFAULT 'all',  -- beginner | intermediate | advanced | all
    description        TEXT         DEFAULT NULL,
    duration_minutes   INT          NOT NULL DEFAULT 60,
    capacity           INT          NOT NULL DEFAULT 20,
    language_code      VARCHAR(10)  DEFAULT 'vi',
    equipment_required JSONB        DEFAULT NULL,  -- string[]
    booking_mode       VARCHAR(20)  NOT NULL DEFAULT 'walk_in',  -- walk_in | pre_booking | member_only
    is_active          BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gym_programs_branch  ON gym_programs(branch_id);
CREATE INDEX IF NOT EXISTS idx_gym_programs_zone    ON gym_programs(zone_id) WHERE zone_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gym_programs_trainer ON gym_programs(trainer_id) WHERE trainer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS gym_program_sessions (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id        UUID        NOT NULL REFERENCES gym_programs(id) ON DELETE CASCADE,
    starts_at         TIMESTAMPTZ NOT NULL,
    ends_at           TIMESTAMPTZ NOT NULL,
    seats_total       INT         NOT NULL DEFAULT 20,
    seats_remaining   INT         NOT NULL DEFAULT 20,
    waitlist_enabled  BOOLEAN     NOT NULL DEFAULT FALSE,
    is_cancelled      BOOLEAN     NOT NULL DEFAULT FALSE,
    session_note      TEXT        DEFAULT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gym_program_sessions_program   ON gym_program_sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_gym_program_sessions_starts_at ON gym_program_sessions(starts_at);

-- ─────────────────────────────────────────────────────────────
-- 8. EXTEND gym_trainer_links — branch-specific context
-- ─────────────────────────────────────────────────────────────

ALTER TABLE gym_trainer_links
    ADD COLUMN IF NOT EXISTS specialization_summary    VARCHAR(200) DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS featured_at_branch        BOOLEAN      NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS accepts_private_clients   BOOLEAN      NOT NULL DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS branch_intro              TEXT         DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS languages                 JSONB        DEFAULT NULL,  -- ['vi', 'en']
    ADD COLUMN IF NOT EXISTS visible_order             INT          NOT NULL DEFAULT 0;

-- Optional: trainer availability slots per link
CREATE TABLE IF NOT EXISTS gym_trainer_availability (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_link_id   UUID        NOT NULL REFERENCES gym_trainer_links(id) ON DELETE CASCADE,
    day_key           VARCHAR(3)  NOT NULL,  -- mon | tue | wed | thu | fri | sat | sun
    start_time        TIME        NOT NULL,
    end_time          TIME        NOT NULL,
    availability_type VARCHAR(20) NOT NULL DEFAULT 'group',  -- group | private | both
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gym_trainer_availability_link ON gym_trainer_availability(trainer_link_id);

-- ─────────────────────────────────────────────────────────────
-- 9. EXTEND gym_reviews — trust dimensions
-- ─────────────────────────────────────────────────────────────

ALTER TABLE gym_reviews
    ADD COLUMN IF NOT EXISTS equipment_rating   SMALLINT DEFAULT NULL,  -- 1-5
    ADD COLUMN IF NOT EXISTS cleanliness_rating SMALLINT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS coaching_rating    SMALLINT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS atmosphere_rating  SMALLINT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS value_rating       SMALLINT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS crowd_rating       SMALLINT DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS visit_type         VARCHAR(30) DEFAULT NULL,  -- member | drop_in | trial | guest
    ADD COLUMN IF NOT EXISTS is_verified_visit  BOOLEAN NOT NULL DEFAULT FALSE;

-- ─────────────────────────────────────────────────────────────
-- 10. LEAD ROUTING — new table
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS gym_lead_routes (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id            UUID         NOT NULL REFERENCES gym_branches(id) ON DELETE CASCADE,
    inquiry_type         VARCHAR(30)  NOT NULL,  -- consultation | visit_booking | class_trial | membership | private_training | corporate
    primary_channel      VARCHAR(20)  NOT NULL,  -- whatsapp | phone | messenger | email | in_app
    fallback_channel     VARCHAR(20)  DEFAULT NULL,
    phone                VARCHAR(30)  DEFAULT NULL,
    whatsapp             VARCHAR(30)  DEFAULT NULL,
    messenger_url        VARCHAR(500) DEFAULT NULL,
    email                VARCHAR(255) DEFAULT NULL,
    owner_user_id        UUID         DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
    active_hours         JSONB        DEFAULT NULL,  -- { mon: { from: "08:00", to: "20:00" }, ... }
    auto_prefill_message TEXT         DEFAULT NULL,  -- prefilled message text
    is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gym_lead_routes_branch       ON gym_lead_routes(branch_id);
CREATE INDEX IF NOT EXISTS idx_gym_lead_routes_inquiry_type ON gym_lead_routes(branch_id, inquiry_type);

-- ─────────────────────────────────────────────────────────────
-- 11. BACKFILL — price_from summary on gym_centers
-- ─────────────────────────────────────────────────────────────

UPDATE gym_centers gc
SET
    price_from_amount        = sub.min_price,
    price_from_billing_cycle = sub.billing_cycle
FROM (
    SELECT
        b.gym_center_id,
        p.price         AS min_price,
        p.billing_cycle AS billing_cycle
    FROM gym_pricing p
    JOIN gym_branches b ON b.id = p.branch_id
    WHERE p.price > 0
    ORDER BY b.gym_center_id, p.price ASC
) sub
WHERE gc.id = sub.gym_center_id
AND gc.price_from_amount IS NULL;

-- ─────────────────────────────────────────────────────────────
-- 12. SEED — baseline taxonomy terms
-- ─────────────────────────────────────────────────────────────

INSERT INTO gym_taxonomy_terms (slug, label, term_type, sort_order) VALUES
-- venue types
('gym',              'Gym',                 'venue_type', 10),
('fitness_club',     'Fitness Club',        'venue_type', 20),
('yoga_studio',      'Yoga Studio',         'venue_type', 30),
('pilates_studio',   'Pilates Studio',      'venue_type', 40),
('boutique_studio',  'Boutique Studio',     'venue_type', 50),
('recovery_venue',   'Recovery & Wellness', 'venue_type', 60),
('crossfit_box',     'CrossFit Box',        'venue_type', 70),
('martial_arts',     'Võ thuật',            'venue_type', 80),
-- audience
('beginner',         'Phù hợp người mới',  'audience', 10),
('women_focused',    'Dành cho nữ',        'audience', 20),
('athlete',          'Dành cho VĐV',       'audience', 30),
('family',           'Thân thiện gia đình','audience', 40),
('senior',           'Người cao tuổi',     'audience', 50),
-- positioning
('premium',          'Premium',            'positioning', 10),
('luxury',           'Luxury',             'positioning', 20),
('hardcore',         'Hardcore',           'positioning', 30),
('community_driven', 'Cộng đồng',          'positioning', 40),
('budget',           'Tiết kiệm',          'positioning', 50),
-- training_style
('strength',         'Strength Training',  'training_style', 10),
('cardio',           'Cardio',             'training_style', 20),
('functional',       'Functional',         'training_style', 30),
('hiit',             'HIIT',               'training_style', 40),
('yoga',             'Yoga',               'training_style', 50),
('pilates',          'Pilates',            'training_style', 60),
('boxing',           'Boxing & MMA',       'training_style', 70),
('dance',            'Dance',              'training_style', 80),
('cycling',          'Cycling',            'training_style', 90),
('swimming',         'Bơi lội',            'training_style', 100),
-- service_model
('pt_focused',       'PT chuyên sâu',      'service_model', 10),
('class_based',      'Lớp học theo lịch',  'service_model', 20),
('open_floor',       'Tập tự do',          'service_model', 30),
('hybrid',           'Kết hợp',            'service_model', 40),
-- recovery_type
('sauna',            'Sauna & Steam',      'recovery_type', 10),
('cryotherapy',      'Cryotherapy',        'recovery_type', 20),
('massage',          'Massage',            'recovery_type', 30),
('physiotherapy',    'Vật lý trị liệu',    'recovery_type', 40),
('nutrition',        'Tư vấn dinh dưỡng',  'recovery_type', 50),
-- atmosphere
('energetic',        'Năng động',          'atmosphere', 10),
('zen',              'Thư thái',           'atmosphere', 20),
('minimalist',       'Tối giản',           'atmosphere', 30),
('social',           'Socialising',        'atmosphere', 40)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- Backfill: users.is_active (was in entity but missing from migrations)
-- ─────────────────────────────────────────────────────────────
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

COMMIT;
