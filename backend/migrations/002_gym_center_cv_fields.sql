-- ============================================================
-- Migration: Add CV/Profile fields to gym_centers
-- Date: 2025
-- Note: TypeORM synchronize:true auto-runs this.
--       Use manually for production.
-- ============================================================

ALTER TABLE gym_centers
    ADD COLUMN IF NOT EXISTS founded_year        INTEGER,
    ADD COLUMN IF NOT EXISTS total_area_sqm      INTEGER,
    ADD COLUMN IF NOT EXISTS total_equipment_count INTEGER,
    ADD COLUMN IF NOT EXISTS highlights          JSONB;

-- Index for slug lookup (already exists in most deployments, safe)
CREATE INDEX IF NOT EXISTS idx_gym_centers_slug ON gym_centers(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gym_centers_active ON gym_centers(is_active, is_verified);

-- ============================================================
-- Sample seed data
-- ============================================================
-- UPDATE gym_centers SET
--     founded_year = 2019,
--     total_area_sqm = 2500,
--     total_equipment_count = 120,
--     highlights = '["Open 24/7", "Hồ bơi Olympic", "5 chi nhánh", "Coach chuyên nghiệp"]'::jsonb
-- WHERE slug = '{{GYM_SLUG}}';
