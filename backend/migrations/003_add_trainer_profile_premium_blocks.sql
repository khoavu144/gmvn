-- ============================================================
-- Migration: Add premium trainer profile blocks
-- Date: 2026
-- Purpose:
--   1) Extend trainer_profiles with premium presentation metadata
--   2) Add highlight/media/press tables for richer public profile
-- Notes:
--   - Additive only, backward-compatible with existing API payloads
--   - Safe to run multiple times in development/staging
-- ============================================================

-- 1) Extend trainer_profiles
ALTER TABLE trainer_profiles
    ADD COLUMN IF NOT EXISTS profile_tagline VARCHAR(160),
    ADD COLUMN IF NOT EXISTS profile_theme_variant VARCHAR(30),
    ADD COLUMN IF NOT EXISTS hero_badges JSONB,
    ADD COLUMN IF NOT EXISTS key_metrics JSONB,
    ADD COLUMN IF NOT EXISTS cta_config JSONB,
    ADD COLUMN IF NOT EXISTS section_order JSONB,
    ADD COLUMN IF NOT EXISTS is_featured_profile BOOLEAN NOT NULL DEFAULT false;

-- 2) Create enum for trainer media feature type (if missing)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'trainer_media_features_media_type_enum'
    ) THEN
        CREATE TYPE trainer_media_features_media_type_enum AS ENUM ('image', 'video');
    END IF;
END
$$;

-- 3) Trainer profile highlights
CREATE TABLE IF NOT EXISTS trainer_profile_highlights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    value VARCHAR(255) NOT NULL,
    icon_key VARCHAR(60),
    order_number INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trainer_profile_highlights_trainer
    ON trainer_profile_highlights (trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_profile_highlights_active_order
    ON trainer_profile_highlights (trainer_id, is_active, order_number);

-- 4) Trainer media features
CREATE TABLE IF NOT EXISTS trainer_media_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_type trainer_media_features_media_type_enum NOT NULL DEFAULT 'image',
    url VARCHAR(1000) NOT NULL,
    thumbnail_url VARCHAR(1000),
    caption VARCHAR(255),
    order_number INTEGER NOT NULL DEFAULT 0,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trainer_media_features_trainer
    ON trainer_media_features (trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_media_features_active_order
    ON trainer_media_features (trainer_id, is_active, is_featured, order_number);

-- 5) Trainer press mentions
CREATE TABLE IF NOT EXISTS trainer_press_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_name VARCHAR(150) NOT NULL,
    title VARCHAR(255) NOT NULL,
    mention_url VARCHAR(1000),
    logo_url VARCHAR(1000),
    excerpt TEXT,
    published_at TIMESTAMP,
    order_number INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trainer_press_mentions_trainer
    ON trainer_press_mentions (trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_press_mentions_active_order
    ON trainer_press_mentions (trainer_id, is_active, order_number, published_at);
