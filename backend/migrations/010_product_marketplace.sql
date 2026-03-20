-- ====================================================================
-- Migration 010: GYMERVIET Product Marketplace
-- ====================================================================
-- Multi-category e-commerce: training packages, gear/wear, supplements,
-- equipment, digital content, services.
-- All changes are additive. No destructive rewrites.
-- ====================================================================

BEGIN;

-- ────────────────────────────────────────────────────────────────────
-- 1. PRODUCT CATEGORIES — two-level taxonomy
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_categories (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                VARCHAR(100) NOT NULL UNIQUE,
    label               VARCHAR(200) NOT NULL,
    parent_id           UUID        REFERENCES product_categories(id) ON DELETE SET NULL,
    icon_emoji          VARCHAR(10)  DEFAULT NULL,
    product_type        VARCHAR(20)  NOT NULL DEFAULT 'physical', -- digital | physical | service
    requires_moderation BOOLEAN      NOT NULL DEFAULT FALSE,
    sort_order          INT          NOT NULL DEFAULT 0,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_categories_parent ON product_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_slug   ON product_categories(slug);

-- ────────────────────────────────────────────────────────────────────
-- 2. SELLER PROFILES
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS seller_profiles (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    shop_name         VARCHAR(200) NOT NULL,
    shop_slug         VARCHAR(100) NOT NULL UNIQUE,
    shop_description  TEXT         DEFAULT NULL,
    shop_logo_url     VARCHAR(500) DEFAULT NULL,
    shop_cover_url    VARCHAR(500) DEFAULT NULL,
    business_type     VARCHAR(30)  NOT NULL DEFAULT 'individual', -- individual | brand | gym | coach
    contact_phone     VARCHAR(30)  DEFAULT NULL,
    contact_email     VARCHAR(255) DEFAULT NULL,
    bank_info         JSONB        DEFAULT NULL,  -- encrypted at app layer
    commission_rate   NUMERIC(5,2) NOT NULL DEFAULT 10.00,  -- percent
    is_verified       BOOLEAN      NOT NULL DEFAULT FALSE,
    total_revenue     NUMERIC(18,0) NOT NULL DEFAULT 0,
    total_orders      INT          NOT NULL DEFAULT 0,
    avg_rating        NUMERIC(3,2) DEFAULT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'pending', -- pending | active | suspended
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_profiles_user_id ON seller_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_slug    ON seller_profiles(shop_slug);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_status  ON seller_profiles(status);

-- ────────────────────────────────────────────────────────────────────
-- 3. PRODUCTS — main table
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS products (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id           UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_profile_id   UUID        DEFAULT NULL REFERENCES seller_profiles(id) ON DELETE SET NULL,
    category_id         UUID        NOT NULL REFERENCES product_categories(id),
    title               VARCHAR(300) NOT NULL,
    slug                VARCHAR(350) NOT NULL UNIQUE,
    description         TEXT         DEFAULT NULL,  -- Markdown
    product_type        VARCHAR(20)  NOT NULL DEFAULT 'physical', -- digital | physical | service

    -- Status lifecycle
    status              VARCHAR(30)  NOT NULL DEFAULT 'draft',
    -- draft | pending_review | active | rejected | suspended | sold_out | archived

    -- Pricing
    price               NUMERIC(14,0) NOT NULL DEFAULT 0,
    compare_at_price    NUMERIC(14,0) DEFAULT NULL,  -- original price (for showing discount)
    currency            VARCHAR(10)   NOT NULL DEFAULT 'VND',

    -- Inventory
    stock_quantity      INT          DEFAULT NULL,   -- NULL = unlimited
    track_inventory     BOOLEAN      NOT NULL DEFAULT FALSE,
    sku                 VARCHAR(100) DEFAULT NULL,

    -- Digital delivery
    digital_file_url    VARCHAR(1000) DEFAULT NULL,
    preview_content     TEXT         DEFAULT NULL,   -- free preview (markdown)

    -- Media
    thumbnail_url       VARCHAR(500) DEFAULT NULL,
    gallery             JSONB        DEFAULT NULL,   -- string[] of image URLs

    -- Attributes (flexible per category)
    attributes          JSONB        DEFAULT NULL,
    tags                JSONB        DEFAULT NULL,   -- string[]

    -- Stats (denormalized for performance)
    view_count          INT          NOT NULL DEFAULT 0,
    sale_count          INT          NOT NULL DEFAULT 0,
    wishlist_count      INT          NOT NULL DEFAULT 0,
    avg_rating          NUMERIC(3,2) DEFAULT NULL,
    review_count        INT          NOT NULL DEFAULT 0,

    -- Discovery
    featured_weight     SMALLINT     NOT NULL DEFAULT 0,

    -- Moderation
    moderation_note     TEXT         DEFAULT NULL,
    moderated_by        UUID         DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
    moderated_at        TIMESTAMPTZ  DEFAULT NULL,

    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ  DEFAULT NULL  -- soft delete
);

CREATE INDEX IF NOT EXISTS idx_products_seller_id       ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id     ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status          ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured_weight ON products(featured_weight DESC);
CREATE INDEX IF NOT EXISTS idx_products_slug            ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sale_count      ON products(sale_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at      ON products(deleted_at) WHERE deleted_at IS NULL;

-- ────────────────────────────────────────────────────────────────────
-- 4. PRODUCT VARIANTS — size/color/flavor/weight options
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_variants (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id          UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_label       VARCHAR(200) NOT NULL,  -- e.g. "XL / Đen", "Chocolate 2kg"
    variant_attributes  JSONB        DEFAULT NULL,  -- {size: 'XL', color: 'black', flavor: 'chocolate'}
    price               NUMERIC(14,0) DEFAULT NULL,    -- overrides product base price if set
    compare_at_price    NUMERIC(14,0) DEFAULT NULL,
    stock_quantity      INT          DEFAULT NULL,
    sku                 VARCHAR(100) DEFAULT NULL,
    image_url           VARCHAR(500) DEFAULT NULL,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_order          INT          NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- ────────────────────────────────────────────────────────────────────
-- 5. TRAINING PACKAGES — extends products for structured programs
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS training_packages (
    id                    UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id            UUID    NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
    -- Discovery attributes
    goal                  VARCHAR(50)  NOT NULL DEFAULT 'general_fitness',
    -- fat_loss | muscle_gain | endurance | flexibility | rehabilitation | competition_prep | general_fitness
    level                 VARCHAR(20)  NOT NULL DEFAULT 'all',
    -- beginner | intermediate | advanced | all
    duration_weeks        INT          NOT NULL DEFAULT 8,
    sessions_per_week     INT          NOT NULL DEFAULT 4,
    equipment_required    JSONB        DEFAULT NULL,  -- string[]
    includes_nutrition    BOOLEAN      NOT NULL DEFAULT FALSE,
    includes_video        BOOLEAN      NOT NULL DEFAULT FALSE,
    -- Structured program content
    program_structure     JSONB        DEFAULT NULL,
    -- { week_1: { day_1: { title, exercises: [{name,sets,reps,rest_seconds,note,video_url}], warmup, cooldown }, day_2: ... }, week_2: ... }
    preview_weeks         INT          NOT NULL DEFAULT 1,  -- how many weeks are visible for free
    -- Nutrition companion (optional)
    nutrition_guide       JSONB        DEFAULT NULL,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_packages_goal  ON training_packages(goal);
CREATE INDEX IF NOT EXISTS idx_training_packages_level ON training_packages(level);

-- ────────────────────────────────────────────────────────────────────
-- 6. PRODUCT REVIEWS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_reviews (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id              UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id                 UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_item_id           UUID        DEFAULT NULL,  -- FK → product_order_items added after table creation
    rating                  SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment                 TEXT        DEFAULT NULL,
    -- Dimension ratings (optional)
    quality_rating          SMALLINT    DEFAULT NULL CHECK (quality_rating BETWEEN 1 AND 5),
    value_rating            SMALLINT    DEFAULT NULL CHECK (value_rating BETWEEN 1 AND 5),
    delivery_rating         SMALLINT    DEFAULT NULL CHECK (delivery_rating BETWEEN 1 AND 5),
    is_verified_purchase    BOOLEAN     NOT NULL DEFAULT FALSE,
    is_visible              BOOLEAN     NOT NULL DEFAULT TRUE,
    -- Seller reply
    reply_text              TEXT        DEFAULT NULL,
    replied_by_id           UUID        DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
    replied_at              TIMESTAMPTZ DEFAULT NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id    ON product_reviews(user_id);

-- ────────────────────────────────────────────────────────────────────
-- 7. ORDERS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_orders (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id         UUID        NOT NULL REFERENCES users(id),
    order_number     VARCHAR(30)  NOT NULL UNIQUE,  -- e.g. GV-20240321-0001
    status           VARCHAR(30)  NOT NULL DEFAULT 'pending',
    -- pending | confirmed | processing | shipped | delivered | cancelled | refunded
    total_amount     NUMERIC(18,0) NOT NULL DEFAULT 0,
    shipping_fee     NUMERIC(14,0) NOT NULL DEFAULT 0,
    discount_amount  NUMERIC(14,0) NOT NULL DEFAULT 0,
    payment_method   VARCHAR(30)  NOT NULL DEFAULT 'bank_transfer',
    -- bank_transfer | cod | vnpay | momo | zalopay
    payment_status   VARCHAR(20)  NOT NULL DEFAULT 'pending',
    -- pending | paid | failed | refunded
    shipping_address JSONB        DEFAULT NULL,
    tracking_number  VARCHAR(100) DEFAULT NULL,
    note             TEXT         DEFAULT NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_orders_buyer_id ON product_orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_product_orders_status   ON product_orders(status);
CREATE INDEX IF NOT EXISTS idx_product_orders_number   ON product_orders(order_number);

-- ────────────────────────────────────────────────────────────────────
-- 8. ORDER ITEMS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_order_items (
    id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id                UUID        NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
    product_id              UUID        NOT NULL REFERENCES products(id),
    variant_id              UUID        DEFAULT NULL REFERENCES product_variants(id),
    quantity                INT         NOT NULL DEFAULT 1,
    unit_price              NUMERIC(14,0) NOT NULL,
    subtotal                NUMERIC(18,0) NOT NULL,
    -- Digital delivery
    digital_download_url    VARCHAR(1000) DEFAULT NULL,
    digital_download_count  INT          NOT NULL DEFAULT 0,
    digital_download_limit  INT          NOT NULL DEFAULT 5,
    -- Snapshot of product at time of purchase (for records)
    product_title_snapshot  VARCHAR(300) DEFAULT NULL,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_order_items_order_id   ON product_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_order_items_product_id ON product_order_items(product_id);

-- Add FK from product_reviews → product_order_items now that the table exists
ALTER TABLE product_reviews
    ADD CONSTRAINT fk_product_reviews_order_item
    FOREIGN KEY (order_item_id) REFERENCES product_order_items(id) ON DELETE SET NULL
    NOT VALID;

-- ────────────────────────────────────────────────────────────────────
-- 9. PRODUCT WISHLISTS
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS product_wishlists (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  UUID        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_product_wishlists_user_id    ON product_wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_product_wishlists_product_id ON product_wishlists(product_id);

-- ────────────────────────────────────────────────────────────────────
-- 10. PROHIBITED KEYWORDS — auto-moderation
-- ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS prohibited_keywords (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword    VARCHAR(100) NOT NULL UNIQUE,
    category   VARCHAR(50)  NOT NULL DEFAULT 'steroid', -- steroid | drug | weapon | other
    severity   VARCHAR(30)  NOT NULL DEFAULT 'flag_for_review', -- auto_reject | flag_for_review
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Seed prohibited keywords (steroids, roid-related, WADA banned)
INSERT INTO prohibited_keywords (keyword, category, severity) VALUES
('steroid',             'steroid', 'auto_reject'),
('steroids',            'steroid', 'auto_reject'),
('anabolic',            'steroid', 'flag_for_review'),
('sarm',                'steroid', 'auto_reject'),
('sarms',               'steroid', 'auto_reject'),
('prohormone',          'steroid', 'auto_reject'),
('prohormones',         'steroid', 'auto_reject'),
('testosterone inject', 'steroid', 'auto_reject'),
('trenbolone',          'steroid', 'auto_reject'),
('dianabol',            'steroid', 'auto_reject'),
('anadrol',             'steroid', 'auto_reject'),
('winstrol',            'steroid', 'auto_reject'),
('clenbuterol',         'steroid', 'auto_reject'),
('ephedrine',           'drug',    'auto_reject'),
('dmaa',                'drug',    'auto_reject'),
('dmha',                'drug',    'auto_reject'),
('hgh inject',          'steroid', 'auto_reject'),
('igf-1',               'steroid', 'auto_reject'),
('peptide cycle',       'steroid', 'flag_for_review'),
('post cycle therapy',  'steroid', 'flag_for_review'),
('pct cycle',           'steroid', 'flag_for_review'),
('roid',                'steroid', 'flag_for_review'),
('oxandrolone',         'steroid', 'auto_reject'),
('nandrolone',          'steroid', 'auto_reject'),
('boldenone',           'steroid', 'auto_reject'),
('masteron',            'steroid', 'auto_reject'),
('primobolan',          'steroid', 'auto_reject')
ON CONFLICT (keyword) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────
-- 11. SEED PRODUCT CATEGORIES
-- ────────────────────────────────────────────────────────────────────

-- Level 1
INSERT INTO product_categories (slug, label, parent_id, icon_emoji, product_type, requires_moderation, sort_order)
VALUES
('training-packages',  'Gói tập & Giáo án',    NULL, '📋', 'digital',  FALSE, 10),
('gear-wear',           'Gear & Trang phục',     NULL, '👕', 'physical', FALSE, 20),
('supplements',         'Thực phẩm bổ sung',     NULL, '💊', 'physical', TRUE,  30),
('equipment',           'Máy tập & Thiết bị',    NULL, '🏋️', 'physical', FALSE, 40),
('digital-content',     'Nội dung số',           NULL, '📚', 'digital',  FALSE, 50),
('services',            'Dịch vụ',               NULL, '🎟️', 'service',  FALSE, 60),
('body-care',           'Chăm sóc cơ thể',       NULL, '🧴', 'physical', FALSE, 70)
ON CONFLICT (slug) DO NOTHING;

-- Level 2: training-packages
WITH parent AS (SELECT id FROM product_categories WHERE slug = 'training-packages')
INSERT INTO product_categories (slug, label, parent_id, product_type, sort_order)
VALUES
('fat-loss-programs',    'Giảm mỡ',                 (SELECT id FROM parent), 'digital', 1),
('muscle-gain-programs', 'Tăng cơ',                 (SELECT id FROM parent), 'digital', 2),
('endurance-programs',   'Sức bền',                 (SELECT id FROM parent), 'digital', 3),
('flexibility-programs', 'Linh hoạt & Yoga',        (SELECT id FROM parent), 'digital', 4),
('competition-prep',     'Chuẩn bị thi đấu',        (SELECT id FROM parent), 'digital', 5),
('rehab-programs',       'Phục hồi chức năng',      (SELECT id FROM parent), 'digital', 6)
ON CONFLICT (slug) DO NOTHING;

-- Level 2: gear-wear
WITH parent AS (SELECT id FROM product_categories WHERE slug = 'gear-wear')
INSERT INTO product_categories (slug, label, parent_id, product_type, sort_order)
VALUES
('gym-wear',    'Đồ tập gym',      (SELECT id FROM parent), 'physical', 1),
('yoga-wear',   'Đồ tập yoga',     (SELECT id FROM parent), 'physical', 2),
('footwear',    'Giày thể thao',   (SELECT id FROM parent), 'physical', 3),
('accessories', 'Phụ kiện tập',    (SELECT id FROM parent), 'physical', 4),
('bags',        'Túi & Balo gym',  (SELECT id FROM parent), 'physical', 5)
ON CONFLICT (slug) DO NOTHING;

-- Level 2: supplements
WITH parent AS (SELECT id FROM product_categories WHERE slug = 'supplements')
INSERT INTO product_categories (slug, label, parent_id, product_type, requires_moderation, sort_order)
VALUES
('whey-protein',  'Whey Protein',             (SELECT id FROM parent), 'physical', TRUE, 1),
('creatine',      'Creatine',                 (SELECT id FROM parent), 'physical', TRUE, 2),
('pre-workout',   'Pre-Workout',              (SELECT id FROM parent), 'physical', TRUE, 3),
('bcaa-eaa',      'BCAA & EAA',               (SELECT id FROM parent), 'physical', TRUE, 4),
('vitamins',      'Vitamin & Khoáng chất',    (SELECT id FROM parent), 'physical', TRUE, 5),
('healthy-food',  'Thực phẩm lành mạnh',      (SELECT id FROM parent), 'physical', FALSE, 6),
('hydration',     'Nước điện giải & Hydration',(SELECT id FROM parent), 'physical', FALSE, 7)
ON CONFLICT (slug) DO NOTHING;

-- Level 2: equipment
WITH parent AS (SELECT id FROM product_categories WHERE slug = 'equipment')
INSERT INTO product_categories (slug, label, parent_id, product_type, sort_order)
VALUES
('free-weights',        'Tạ tự do',            (SELECT id FROM parent), 'physical', 1),
('machines',            'Máy tập',             (SELECT id FROM parent), 'physical', 2),
('cardio-equipment',    'Thiết bị cardio',     (SELECT id FROM parent), 'physical', 3),
('functional-tools',    'Dụng cụ functional',  (SELECT id FROM parent), 'physical', 4),
('recovery-tools',      'Dụng cụ recovery',    (SELECT id FROM parent), 'physical', 5),
('home-gym-bundles',    'Combo Home Gym',       (SELECT id FROM parent), 'physical', 6)
ON CONFLICT (slug) DO NOTHING;

-- Level 2: digital-content
WITH parent AS (SELECT id FROM product_categories WHERE slug = 'digital-content')
INSERT INTO product_categories (slug, label, parent_id, product_type, sort_order)
VALUES
('meal-plans',      'Thực đơn dinh dưỡng',  (SELECT id FROM parent), 'digital', 1),
('ebooks',          'Ebook',                 (SELECT id FROM parent), 'digital', 2),
('online-courses',  'Khóa học online',       (SELECT id FROM parent), 'digital', 3)
ON CONFLICT (slug) DO NOTHING;

-- Level 2: services
WITH parent AS (SELECT id FROM product_categories WHERE slug = 'services')
INSERT INTO product_categories (slug, label, parent_id, product_type, sort_order)
VALUES
('pt-sessions',     'Gói PT Session',            (SELECT id FROM parent), 'service', 1),
('event-tickets',   'Vé sự kiện & Workshop',     (SELECT id FROM parent), 'service', 2),
('gym-memberships', 'Membership phòng tập',       (SELECT id FROM parent), 'service', 3)
ON CONFLICT (slug) DO NOTHING;

COMMIT;
